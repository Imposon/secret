import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SQLEditor from "../components/SQLEditor";
import api from "../api";

export default function Studio() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [databases, setDatabases] = useState([]);
  const [selectedDB, setSelectedDB] = useState("sqlite");

  useEffect(() => {
    api.get("/api/databases").then((res) => setDatabases(res.data));
  }, []);

  async function runQuery() {
    setError("");
    setResult(null);

    try {
      const res = await api.post("/api/query", {
        query,
        db: selectedDB
      });

      if (res.data.success) {
        setResult(res.data.result || res.data.message);
      } else {
        setError(res.data.error);
      }
    } catch (e) {
      setError("Query failed: " + e.message);
    }
  }

  return (
    <>
      <Navbar />

      <Sidebar
        databases={databases}
        onSelectTable={(db, table) =>
          setQuery((q) => q + `\nSELECT * FROM ${table} LIMIT 10;`)
        }
      />

      <div style={styles.mainArea}>
        
        {/* DB SELECTOR */}
        <div style={styles.dbRow}>
          <label style={styles.dbLabel}>Database:</label>
          <select
            value={selectedDB}
            onChange={(e) => setSelectedDB(e.target.value)}
            style={styles.dbSelect}
          >
            <option value="sqlite">SQLite</option>
            <option value="mysql">MySQL</option>
            <option value="postgres">PostgreSQL</option>
          </select>

          <button style={styles.runBtn} onClick={runQuery}>
            Run Query
          </button>
        </div>

        {/* Editor */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Editor</h2>
          <SQLEditor value={query} onChange={setQuery} />
        </div>

        {/* Results */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Results</h2>

          {error && <p style={styles.error}>{error}</p>}

          {Array.isArray(result) ? (
            result.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(result[0] || {}).map((c) => (
                      <th key={c} style={styles.th}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={styles.td}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#aaa" }}>No results found (0 rows).</p>
            )
          ) : (
            <p style={{ color: "#aaa" }}>Run a query to view results...</p>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  mainArea: {
    marginLeft: "260px",
    marginTop: "70px",
    padding: "25px",
    color: "white",
  },

  dbRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "18px",
    gap: "15px",
  },

  dbLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ff4d7a",
  },

  dbSelect: {
    padding: "10px",
    background: "#1c212c",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
  },

  runBtn: {
    padding: "10px 20px",
    background: "#ff4d7a",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
    color: "white",
  },

  panel: {
    marginTop: "20px",
    padding: "20px",
    background: "#161a22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
  },

  panelTitle: {
    color: "#ff4d7a",
    marginBottom: "15px",
  },

  error: {
    color: "#ff4d7a",
    fontWeight: "600",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "10px",
    background: "#1f232d",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
};
