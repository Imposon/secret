import React, { useState } from "react";

export default function Sidebar({ databases, onSelectTable }) {
  const [expanded, setExpanded] = useState({});

  const toggleDB = (db) => {
    setExpanded((prev) => ({ ...prev, [db]: !prev[db] }));
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>📁 Databases</h2>

      {databases.map((db) => (
        <div key={db.name} style={styles.dbBlock}>
          <div style={styles.dbHeader} onClick={() => toggleDB(db.name)}>
            <span>{expanded[db.name] ? "▼" : "▶"}</span>
            <strong style={{ marginLeft: "8px" }}>{db.name}</strong>
          </div>

          {expanded[db.name] && (
            <div style={styles.tableList}>
              {db.tables.length > 0 ? (
                db.tables.map((t) => (
                  <div
                    key={t}
                    style={styles.tableItem}
                    onClick={() => onSelectTable(db.type, t)}
                  >
                    • {t}
                  </div>
                ))
              ) : (
                <div style={styles.noTables}>No tables</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    background: "#14181e",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "20px",
    color: "white",
    height: "calc(100vh - 70px)",
    overflowY: "auto",
    position: "fixed",
    top: "70px",
    left: 0,
  },

  title: {
    fontSize: "20px",
    marginBottom: "20px",
    color: "#ff4d7a",
  },

  dbBlock: {
    marginBottom: "15px",
  },

  dbHeader: {
    cursor: "pointer",
    padding: "8px 5px",
    borderRadius: "6px",
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
  },

  tableList: {
    marginLeft: "18px",
    marginTop: "8px",
  },

  tableItem: {
    padding: "4px 0",
    cursor: "pointer",
    color: "rgba(255,255,255,0.7)",
  },

  noTables: {
    padding: "4px 0",
    color: "rgba(255,255,255,0.4)",
  }
};
