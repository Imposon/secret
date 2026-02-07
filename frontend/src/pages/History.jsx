// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api.js";
import ExportButtons, { exportCSV } from "../components/ExportButtons";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dbFilter, setDbFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, dbFilter]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Could not load history. Login may be required.");
    } finally {
      setLoading(false);
    }
  }

  function filterHistory() {
    let filtered = [...history];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((h) =>
        h.query.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by database type
    if (dbFilter !== "all") {
      filtered = filtered.filter((h) => h.db === dbFilter);
    }

    setFilteredHistory(filtered);
  }

  async function rerun(item) {
    setError(null);
    setSelectedQuery(item);
    try {
      const res = await api.post("/api/query", { query: item.query, db: item.db || "mysql" });
      if (res.data && res.data.success) {
        setSelectedRows(Array.isArray(res.data.result) ? res.data.result : [{ message: res.data.message }]);
      } else {
        setError(res.data?.error || "Query run failed");
      }
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Rerun failed");
    }
  }

  async function deleteQuery(id) {
    if (!window.confirm("Delete this query from history?")) return;
    
    try {
      await api.delete(`/api/history/${id}`);
      loadHistory();
      if (selectedQuery?.id === id) {
        setSelectedRows(null);
        setSelectedQuery(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete query");
    }
  }

  async function clearAllHistory() {
    if (!window.confirm("Clear all query history? This cannot be undone.")) return;
    
    try {
      await api.delete("/api/history");
      loadHistory();
      setSelectedRows(null);
      setSelectedQuery(null);
    } catch (err) {
      console.error(err);
      setError("Failed to clear history");
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  }

  function clearSelection() {
    setSelectedRows(null);
    setSelectedQuery(null);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <>
      <Navbar />
      <main className="history-page">
        <div className="history-container">
          <section className="history-main">
            <div className="glass-card">
              <div className="history-header">
                <div>
                  <h2>Query History</h2>
                  <p className="hero-sub">All your executed queries are listed here. Re-run, inspect or export results.</p>
                </div>
                {history.length > 0 && (
                  <button className="clear-all-btn" onClick={clearAllHistory}>
                    <span>🗑️</span> Clear All
                  </button>
                )}
              </div>

              {/* Search and Filter Bar */}
              <div className="history-filters">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm("")}>
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={dbFilter}
                  onChange={(e) => setDbFilter(e.target.value)}
                  className="db-filter"
                >
                  <option value="all">All Databases</option>
                  <option value="mysql">MySQL</option>
                  <option value="postgres">PostgreSQL</option>
                </select>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading history...</p>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {!loading && filteredHistory.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No queries found</h3>
                  <p>
                    {searchTerm || dbFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Execute some queries to see them here"}
                  </p>
                </div>
              )}

              <div className="history-list">
                {filteredHistory.map((h) => (
                  <div
                    key={h.id}
                    className={`history-card ${selectedQuery?.id === h.id ? "selected" : ""}`}
                  >
                    <div className="history-card-header">
                      <div className="query-meta">
                        <span className="db-badge">{h.db || "mysql"}</span>
                        <span className="time-ago">{formatDate(h.createdAt)}</span>
                      </div>
                      <div className="card-actions">
                        <button
                          className="icon-btn copy-btn"
                          onClick={() => copyToClipboard(h.query)}
                          title="Copy query"
                        >
                          📋
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => deleteQuery(h.id)}
                          title="Delete query"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="query-text">
                      <code>{h.query}</code>
                    </div>

                    <div className="history-card-footer">
                      <button className="rerun-btn" onClick={() => rerun(h)}>
                        ▶️ Re-run
                      </button>
                      <button
                        className="export-btn-small"
                        onClick={() => exportCSV([{ query: h.query, createdAt: h.createdAt }], `query-${h.id}.csv`)}
                      >
                        💾 Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="history-sidebar">
            <div className="glass-card">
              <h3>
                {selectedQuery ? "Query Results" : "Last Run Result"}
              </h3>

              {!selectedRows && (
                <div className="sidebar-empty">
                  <div className="empty-icon-small">📊</div>
                  <p>Run a query from history to view output here.</p>
                </div>
              )}

              {selectedRows && Array.isArray(selectedRows) && (
                <>
                  <div className="result-info">
                    <span className="row-count">
                      {selectedRows.length} {selectedRows.length === 1 ? "row" : "rows"}
                    </span>
                    {selectedRows.length > 0 && (
                      <span className="col-count">
                        {Object.keys(selectedRows[0]).length} columns
                      </span>
                    )}
                  </div>

                  <div className="result-table-container">
                    <table className="result-table">
                      <thead>
                        <tr>
                          {Object.keys(selectedRows[0] || {}).map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRows.map((r, i) => (
                          <tr key={i}>
                            {Object.values(r).map((v, j) => (
                              <td key={j}>{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="result-actions">
                    <ExportButtons rows={selectedRows} />
                    <button className="clear-btn" onClick={clearSelection}>
                      Clear
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="tips-card glass-card">
              <h4>💡 Tips</h4>
              <ul>
                <li>Use the search bar to quickly find queries</li>
                <li>Filter by database type for focused results</li>
                <li>Click copy icon to copy query to clipboard</li>
                <li>Re-run queries to see updated results</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
