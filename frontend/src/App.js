import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import SQLEditor from "./components/SQLEditor";
import Sidebar from "./components/Sidebar";

function App() {
  const [cells, setCells] = useState([
    { id: Date.now(), query: "", result: null, error: null }
  ]);
  const [selectedDBType, setSelectedDBType] = useState("sqlite"); 
  const [activeCell, setActiveCell] = useState(null);

  function addCell() {
    setCells((prev) => [...prev, { id: Date.now(), query: "", result: null, error: null }]);
  }

  function updateCell(cellId, newQuery) {
    setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, query: newQuery } : c)));
  }

  async function runCell(cellId, selectedQuery = null) {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    const sqlToRun = (selectedQuery && selectedQuery.trim()) ? selectedQuery : cell.query;
    if (!sqlToRun || !sqlToRun.trim()) return;

    setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, result: null, error: null } : c)));

    try {
      const res = await axios.post("http://localhost:5001/api/query", {
        query: sqlToRun,
        db: selectedDBType
      });

      if (res.data && res.data.success === false) {
        setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, error: res.data.error || "Query failed" } : c)));
      } else {
        const out = res.data.result ?? res.data.message ?? null;
        setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, result: out, error: null } : c)));
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Execution error";
      setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, error: message } : c)));
    }
  }

  function deleteCell(cellId) {
    setCells((prev) => prev.filter((c) => c.id !== cellId));
  }

  function handleSelectDB(dbType) {
    setSelectedDBType(dbType);
  }

  function handleSelectTable(dbType, tableName) {
    setSelectedDBType(dbType);
    const sql = `SELECT * FROM ${tableName} LIMIT 100;`;
    if (activeCell) {
      updateCell(activeCell, sql);
    } else {
      const newCell = { id: Date.now(), query: sql, result: null, error: null };
      setCells((prev) => [...prev, newCell]);
    }
  }

  return (
    <div className="main-layout">
      <Sidebar onSelectDB={handleSelectDB} onSelectTable={handleSelectTable} />

      <div className="workspace">
        <h1>🧩 SQL Query Runner</h1>
        <p className="db-indicator">Connected to: <strong>{selectedDBType}</strong></p>

        {cells.map((cell) => (
          <div key={cell.id} className={`sql-cell ${activeCell === cell.id ? "active" : ""}`}>
            <div className="cell-toolbar">
              <div className="cell-actions">
                <button
                  className="run-btn"
                  onClick={() => runCell(cell.id)}
                >
                  ▶ Run Cell
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteCell(cell.id)}
                >
                  🗑 Delete
                </button>
              </div>
              <div className="cell-id">Cell: {String(cell.id).slice(-4)}</div>
            </div>

            <SQLEditor
              value={cell.query}
              onChange={(val) => updateCell(cell.id, val)}
              onExecute={(selectedText) => runCell(cell.id, selectedText)}
              onFocus={() => setActiveCell(cell.id)}
            />

            {cell.error && <p className="error">{cell.error}</p>}

            {cell.result && (
              <div className="result-box">
                {Array.isArray(cell.result) ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(cell.result[0] || {}).map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cell.result.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => (
                              <td key={j}>{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(cell.result, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <button className="add-cell-btn" onClick={addCell}>+ Add SQL Cell</button>
        </div>
      </div>
    </div>
  );
}

export default App;
