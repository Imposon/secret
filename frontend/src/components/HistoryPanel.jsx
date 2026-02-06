import React, { useEffect, useState } from "react";
import api from "../api";

export default function HistoryPanel({ onRerun }) {
  const [history, setHistory] = useState([]);

  async function load() {
    try {
      const res = await api.get("/api/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("history load err", err);
    }
  }

  useEffect(() => { load(); }, []);

  async function rerun(item) {
    try {
      const res = await api.post("/api/query", { query: item.query, db: item.db || "mysql" });
      if (onRerun) onRerun(res.data);
      load();
    } catch (err) {
      console.error("rerun failed", err);
    }
  }

  return (
    <div className="history-panel">
      <h4>History</h4>
      <div className="history-list">
        {history.map((h) => (
          <div key={h.id} className="history-item">
            <div className="history-query">{h.query}</div>
            <div className="history-meta">{new Date(h.createdAt).toLocaleString()}</div>
            <div className="history-actions">
              <button onClick={() => rerun(h)}>Re-run</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

