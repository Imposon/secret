import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({ onSelectDB, onSelectTable }) {
  const [databases, setDatabases] = useState([]);
  const [expandedDBs, setExpandedDBs] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [columnsCache, setColumnsCache] = useState({});

  useEffect(() => {
    loadDatabases();
  }, []);

  async function loadDatabases() {
    try {
      const res = await axios.get("http://localhost:5001/api/databases");
      setDatabases(res.data || []);
    } catch (err) {
      console.error("Failed to load databases:", err);
    }
  }

  function toggleDB(dbType) {
    setExpandedDBs((p) => ({ ...p, [dbType]: !p[dbType] }));
    if (onSelectDB) onSelectDB(dbType);
  }

  async function toggleTable(dbType, table) {
    const key = `${dbType}.${table}`;
    setExpandedTables((p) => ({ ...p, [key]: !p[key] }));

    if (!columnsCache[key]) {
      try {
        const res = await axios.get(`http://localhost:5001/api/columns/${dbType}/${table}`);
        const cols = (res.data || []).map((c) => c.name || c.column_name || c.column_name);
        setColumnsCache((p) => ({ ...p, [key]: cols }));
      } catch (err) {
        setColumnsCache((p) => ({ ...p, [key]: [] }));
      }
    }
  }

  return (
    <div className="sidebar">
      <h3>📁 Databases</h3>

      {databases.map((db) => (
        <div key={db.type} className="db-item">
          <div className="db-header" onClick={() => toggleDB(db.type)} role="button">
            {expandedDBs[db.type] ? "▾" : "▸"} {db.name}
          </div>

          {expandedDBs[db.type] && (
            <div className="table-list">
              {db.tables && db.tables.length ? db.tables.map((t) => {
                const key = `${db.type}.${t}`;
                return (
                  <div key={t} className="table-wrap">
                    <div className="table-item" onClick={() => { toggleTable(db.type, t); onSelectTable && onSelectTable(db.type, t); }}>
                      {expandedTables[key] ? "▾" : "•"} {t}
                    </div>

                    {expandedTables[key] && (
                      <div className="column-list">
                        {(columnsCache[key] || []).map((col) => (
                          <div className="column-item" key={col}>- {col}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }) : <div className="empty">No tables</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
