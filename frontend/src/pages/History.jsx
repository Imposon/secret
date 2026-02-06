// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api, { setAuthToken } from "../api.js";
import ExportButtons, { exportCSV } from "../components/ExportButtons";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

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

  async function rerun(item) {
    setError(null);
    try {
      // You can call the re-run endpoint or simply run the query again:
      // call /api/query with the saved query
      const res = await api.post("/api/query", { query: item.query, db: item.db || "mysql" });
      if (res.data && res.data.success) {
        // show results for export
        setSelectedRows(Array.isArray(res.data.result) ? res.data.result : [{ message: res.data.message }]);
      } else {
        setError(res.data?.error || "Query run failed");
      }
      // refresh history
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Rerun failed");
    }
  }

  function clearSelection() {
    setSelectedRows(null);
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: "120px 40px 60px" }}>
        <div style={{ display: "flex", gap: 24 }}>
          <section style={{ flex: 1 }}>
            <div className="glass-card">
              <h2>Query History</h2>
              <p className="hero-sub">All your executed queries are listed here. Re-run, inspect or export results.</p>

              {loading && <div style={{ marginTop: 12 }}>Loading...</div>}
              {error && <div style={{ marginTop: 12, color: "#ff9999" }}>{error}</div>}

              <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                {history.map((h) => (
                  <div key={h.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ maxWidth: "75%" }}>
                      <div style={{ fontWeight: 600 }}>{h.query}</div>
                      <div style={{ fontSize: 13, color: "#bdbdbd", marginTop: 6 }}>{new Date(h.createdAt).toLocaleString()}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="cta-btn small" onClick={() => rerun(h)}>Re-run</button>
                      <button className="cta-btn small" onClick={() => exportCSV([{ query: h.query, createdAt: h.createdAt }], `query-${h.id}.csv`)}>Export</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside style={{ width: 420 }}>
            <div className="glass-card">
              <h3>Last Run Result</h3>

              {!selectedRows && <div style={{ color: "#bdbdbd" }}>Run a query from history to view output here.</div>}

              {selectedRows && Array.isArray(selectedRows) && (
                <>
                  <div style={{ maxHeight: 520, overflow: "auto", marginTop: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {Object.keys(selectedRows[0] || {}).map((c) => <th key={c} style={{ textAlign: "left", padding: 8, background: "rgba(255,255,255,0.03)" }}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRows.map((r, i) => (
                          <tr key={i}>
                            {Object.values(r).map((v, j) => <td key={j} style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{String(v)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <ExportButtons rows={selectedRows} />
                    <button className="cta-btn small" onClick={clearSelection}>Clear</button>
                  </div>
                </>
              )}
            </div>

            <div style={{ height: 20 }} />
            <div className="glass-card">
              <h4>Tips</h4>
              <ul style={{ color: "#cfcfcf", marginTop: 8 }}>
                <li>Use SHIFT+ENTER to run a selection in the editor.</li>
                <li>Click a history card to re-run fast.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
