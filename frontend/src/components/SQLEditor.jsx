import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import axios from "axios";

const SQL_KEYWORDS = [
  "SELECT","INSERT","UPDATE","DELETE","CREATE","DROP","ALTER","TABLE",
  "FROM","WHERE","ORDER","BY","GROUP","JOIN","LEFT JOIN","RIGHT JOIN",
  "LIMIT","VALUES","INTO","SET","COUNT","SUM","AVG","MIN","MAX"
];

export default function SQLEditor({ value, onChange, onExecute, onFocus }) {
  const editorRef = useRef(null);
  const [tables, setTables] = useState({});
  const [tableNames, setTableNames] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadSchema() {
      try {
        const res = await axios.get("http://localhost:5001/api/databases");
        const dbList = res.data || [];

        let allTables = [];
        const schema = {};

        for (const db of dbList) {
          for (const tbl of db.tables || []) {
            allTables.push(tbl);

            try {
              const colRes = await axios.get(`http://localhost:5001/api/columns/${db.type}/${tbl}`);
              const cols = (colRes.data || []).map((c) => c.name || c.column_name || c.column_name);
              schema[tbl] = cols;
            } catch (e) {
              schema[tbl] = schema[tbl] || [];
            }
          }
        }

        if (!mounted) return;
        setTableNames(allTables);
        setTables(schema);
      } catch (err) {
        console.error("Failed to load schema:", err);
      }
    }
    loadSchema();
    return () => { mounted = false; };
  }, []);

  function autoCompleteSQL(context) {
    const word = context.matchBefore(/[A-Za-z0-9_\.]*/);
    if (!word) return null;
    if (!word.text || word.text.trim() === "") {
      return null;
    }

    const before = context.state.doc.sliceString(0, word.from).trim().toUpperCase();
    const suggestions = [];

    suggestions.push(...SQL_KEYWORDS.map((kw) => ({ label: kw, type: "keyword" })));

    const tableTriggers = ["INSERT INTO", "FROM", "JOIN", "UPDATE", "DELETE FROM"];
    for (const trig of tableTriggers) {
      if (before.endsWith(trig)) {
        suggestions.push(...tableNames.map((t) => ({ label: t, type: "table" })));
      }
    }

    const fromMatch = before.match(/FROM\s+(\w+)$/i);
    const updateMatch = before.match(/UPDATE\s+(\w+)$/i);
    const table = (fromMatch && fromMatch[1]) || (updateMatch && updateMatch[1]) || null;

    if (table && tables[table]) {
      suggestions.push(...tables[table].map((c) => ({ label: c, type: "column" })));
    }

    if (word.text.includes(".")) {
      const parts = word.text.split(".");
      const tbl = parts[0];
      if (tables[tbl]) {
        suggestions.push(...tables[tbl].map((c) => ({ label: `${tbl}.${c}`, type: "column" })));
      }
    }

    return {
      from: word.from,
      options: suggestions
    };
  }

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value || "",
      extensions: [
        keymap.of([
          ...defaultKeymap,
          {
            key: "Shift-Enter",
            run(view) {
              const { from, to } = view.state.selection.main;
              const selection = view.state.doc.sliceString(from, to);
              const toRun = selection && selection.trim() ? selection : view.state.doc.toString();

              if (onExecute) onExecute(toRun);
              return true;
            }
          },
          {
            key: "Mod-Enter",
            run(view) { 
              const { from, to } = view.state.selection.main;
              const selection = view.state.doc.sliceString(from, to);
              const toRun = selection && selection.trim() ? selection : view.state.doc.toString();
              if (onExecute) onExecute(toRun);
              return true;
            }
          }
        ]),
        sql(),
        autocompletion({ override: [autoCompleteSQL] }),
        EditorView.updateListener.of((update) => {
          if (update.changes && onChange) onChange(update.state.doc.toString());
        }),
        EditorView.domEventHandlers({
          focus: (event, view) => {
            if (onFocus) onFocus();
          }
        }),
        EditorView.theme({
          "&": { minHeight: "180px", border: "1px solid #ccc", background: "#fff" },
          ".cm-content": { fontSize: "15px", padding: "8px" }
        })
      ]
    });

    const view = new EditorView({ state, parent: editorRef.current });
    return () => view.destroy();
  }, [tables]);

  return <div ref={editorRef}></div>;
}
