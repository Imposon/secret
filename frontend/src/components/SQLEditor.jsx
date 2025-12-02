// src/components/SQLEditor.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";

/*
  SQLEditor props:
    - value (string)           : current editor content
    - onChange (string)        : called when document changes
    - onExecute (function)     : called when user presses Shift+Enter
    - height (number | string) : optional editor height (default "260px")
*/

const UNIVERSAL_KEYWORDS = [
  "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP",
  "TRUNCATE", "RENAME", "TABLE", "VIEW", "INDEX", "FROM", "WHERE",
  "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "JOIN", "LEFT JOIN",
  "RIGHT JOIN", "FULL JOIN", "ON", "VALUES", "INTO", "SET", "AND", "OR",
  "NOT", "IN", "IS NULL", "IS NOT NULL"
];

const POSTGRES_COMMANDS = [
  "SERIAL", "BIGSERIAL", "RETURNING", "CREATE EXTENSION", "UPSERT",
  "ON CONFLICT", "JSON", "JSONB", "ARRAY", "UNNEST", "ILIKE",
  "CREATE SCHEMA", "DROP SCHEMA", "GRANT", "REVOKE"
];

const MYSQL_COMMANDS = [
  "AUTO_INCREMENT", "DESCRIBE", "SHOW TABLES", "SHOW COLUMNS",
  "ENGINE", "CHARSET", "ALTER TABLE MODIFY", "REPLACE INTO", "REGEXP",
  "CREATE DATABASE", "DROP DATABASE"
];

const SQLITE_COMMANDS = [
  "PRAGMA", "WITHOUT ROWID", "AUTOINCREMENT", "EXPLAIN QUERY PLAN", "VACUUM", "ANALYZE"
];

const SQL_KEYWORDS = [
  ...UNIVERSAL_KEYWORDS,
  ...POSTGRES_COMMANDS,
  ...MYSQL_COMMANDS,
  ...SQLITE_COMMANDS
];

/* autocomplete dropdown theme for dark UI */
const autoTheme = EditorView.theme({
  ".cm-tooltip-autocomplete": {
    backgroundColor: "#15171b",
    color: "white",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "6px 0",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    boxShadow: "0 6px 18px rgba(0,0,0,0.6)"
  },

  ".cm-tooltip-autocomplete ul": {
    listStyle: "none",
    margin: 0,
    padding: 0,
    maxHeight: "260px",
    overflow: "auto"
  },

  ".cm-tooltip-autocomplete > ul > li": {
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    background: "#ff4d7a",
    color: "white",
  },

  ".cm-tooltip .cm-completionIcon": {
    opacity: 0.9
  },

  ".cm-tooltip": {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#15171b",
  },
}, { dark: true });


export default function SQLEditor({ value = "", onChange = () => {}, onExecute = () => {}, height = "260px" }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  const [databases, setDatabases] = useState([]); // raw from api
  const [tableNames, setTableNames] = useState([]); // flattened list of table names
  const [tables, setTables] = useState({}); // { tableName: [col1, col2, ...] }

  // Load schema (databases + tables + columns)
  useEffect(() => {
    let mounted = true;

    async function loadSchema() {
      try {
        const res = await axios.get("http://localhost:5001/api/databases");
        if (!mounted) return;
        const dbList = Array.isArray(res.data) ? res.data : [];

        const allTables = [];
        const schemaMap = {};

        // fetch columns in parallel per db.table
        const columnFetches = [];

        for (const db of dbList) {
          if (!Array.isArray(db.tables)) continue;
          for (const tableName of db.tables) {
            allTables.push(tableName);
            // request: /api/columns/:dbType/:table
            columnFetches.push(
              (async () => {
                try {
                  const colsRes = await axios.get(`/api/columns/${db.type}/${tableName}`);
                  // normalize various shapes: SQLite returns {name}, pg returns {column_name}, mysql returns Field
                  const raw = Array.isArray(colsRes.data) ? colsRes.data : [];
                  const cols = raw.map(c => c.name || c.column_name || c.Field || c.column || c.columnName).filter(Boolean);
                  schemaMap[tableName] = cols;
                } catch (err) {
                  // if column fetch fails, still set to empty array
                  schemaMap[tableName] = schemaMap[tableName] || [];
                }
              })()
            );
          }
        }

        await Promise.all(columnFetches);

        if (!mounted) return;

        setDatabases(dbList);
        // Unique table names (remove duplicates if same name across DBs)
        setTableNames(Array.from(new Set(allTables)));
        setTables(schemaMap);
      } catch (err) {
        console.error("Failed to load schema:", err);
      }
    }

    loadSchema();

    // reload periodically (optional) to pick up new tables without refresh
    const interval = setInterval(loadSchema, 30_000); // every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper: whether the editor should force show table suggestions based on token before caret
  function shouldForceTableSuggestions(beforeUpperTokens) {
    // We'll check the latest 2 tokens (to match "INSERT INTO", "DELETE FROM", "LEFT JOIN", etc.)
    const TABLE_REQUIRED = [
      "FROM",
      "JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "INNER JOIN",
      "OUTER JOIN",
      "INSERT INTO",
      "UPDATE",
      "DELETE FROM"
    ];

    // tokens array already upper-cased
    const len = beforeUpperTokens.length;
    const last = len >= 1 ? beforeUpperTokens[len - 1] : "";
    const last2 = len >= 2 ? `${beforeUpperTokens[len - 2]} ${beforeUpperTokens[len - 1]}`.trim() : "";

    return TABLE_REQUIRED.some(cmd => cmd === last || cmd === last2);
  }

  // Autocomplete function
  function autoCompleteSQL(context) {
    // match before the cursor — allow dot for table.column
    const word = context.matchBefore(/[A-Za-z0-9_.]*/);
    const typed = word ? word.text : "";

    const beforeAll = context.state.doc.sliceString(0, word ? word.from : context.pos).trim();
    const beforeUpper = beforeAll.toUpperCase();
    const tokens = beforeUpper.split(/\s+/).filter(Boolean);

    // Force show tables if last token requires a table name
    if (shouldForceTableSuggestions(tokens)) {
      // If typed includes a prefix, filter by prefix
      const prefix = typed.replace(/\./g, "").toLowerCase();
      const options = tableNames
        .filter(t => (prefix === "" ? true : t.toLowerCase().startsWith(prefix)))
        .map(t => ({ label: t, type: "table" }));
      return {
        from: word ? word.from : context.pos,
        options
      };
    }

    // If user typed '.' (table.column) show columns of that table
    if (typed.includes(".")) {
      const [tblPart, colPart] = typed.split(".");
      const tbl = tblPart;
      const colPrefix = (colPart || "").toLowerCase();
      if (tables[tbl]) {
        const opts = tables[tbl]
          .filter(c => (colPrefix === "" ? true : c.toLowerCase().startsWith(colPrefix)))
          .map(c => ({ label: `${tbl}.${c}`, type: "column" }));
        return {
          from: word ? word.from : context.pos,
          options: opts
        };
      }
    }

    // If typed is empty but not a table-required context, don't show everything — show nothing
    // However, we still want to show suggestions when user types at least 1 char
    if (!typed || typed.trim() === "") {
      return null;
    }

    const prefixLower = typed.toLowerCase();

    // Build suggestions: keywords, tables, columns (some)
    const suggestions = [];

    // 1) SQL keywords (filter by prefix)
    for (const kw of SQL_KEYWORDS) {
      if (kw.toLowerCase().startsWith(prefixLower)) {
        suggestions.push({ label: kw, type: "keyword" });
      }
    }

    // 2) Table names (if prefix matches)
    for (const t of tableNames) {
      if (t.toLowerCase().startsWith(prefixLower)) {
        suggestions.push({ label: t, type: "table" });
      }
    }

    // 3) If we can detect a table from "FROM <table>" earlier in the query, offer its columns
    const fromMatch = beforeUpper.match(/FROM\s+([A-Z0-9_]+)/i);
    const updateMatch = beforeUpper.match(/UPDATE\s+([A-Z0-9_]+)/i);
    const detectedTable = (fromMatch && fromMatch[1]) || (updateMatch && updateMatch[1]);

    if (detectedTable && tables[detectedTable]) {
      for (const c of tables[detectedTable]) {
        if (c.toLowerCase().startsWith(prefixLower)) {
          suggestions.push({ label: c, type: "column" });
        }
      }
    }

    // Deduplicate (label)
    const seen = new Set();
    const filtered = suggestions.filter(s => {
      const k = s.label;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (filtered.length === 0) return null;

    return {
      from: word ? word.from : context.pos,
      options: filtered
    };
  }

  // Initialize CodeMirror editor once (and re-use)
  useEffect(() => {
    if (!editorRef.current) return;

    // Destroy previous view if exists
    if (viewRef.current) {
      try { viewRef.current.destroy(); } catch (e) {}
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: value || "",
      extensions: [
        autoTheme,
        sql(),
        keymap.of([
          ...defaultKeymap,
          {
            key: "Shift-Enter",
            run: () => {
              // Execute on current selection or full document
              if (typeof onExecute === "function") {
                onExecute();
                return true;
              }
              return false;
            }
          }
        ]),
        autocompletion({ override: [autoCompleteSQL], activateOnTyping: true }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            onChange(text);
          }
        }),
        EditorView.theme({
          "&": {
            // make editor visually match premium studio dark panel
            backgroundColor: "#0f1316",
            color: "#e6eef6",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
            height: height,
            overflow: "auto"
          },
          ".cm-scroller": {
            fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
            fontSize: "15px",
            padding: "12px"
          },
          ".cm-line": {
            padding: "0"
          },
        }, { dark: true })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    // if parent value changes externally, keep editor in sync
    return () => {
      try { view.destroy(); } catch (e) {}
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* init once */]);

  // If external value changes (from props) update editor content
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const cur = view.state.doc.toString();
    if (value !== undefined && value !== cur) {
      view.dispatch({
        changes: { from: 0, to: cur.length, insert: value }
      });
    }
  }, [value]);

  return (
    <div ref={editorRef} />
  );
}
