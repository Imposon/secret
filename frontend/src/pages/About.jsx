import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="glass-card">
          <h1>About SQL Runner</h1>
          <p className="hero-sub">
            SQLRunner is a modern, powerful, notebook-style SQL playground — built for
            students, developers, data analysts, and teams.
          </p>

          <div style={{ marginTop: 20 }}>
            <ul style={{ color: "#cfcfcf", lineHeight: "1.8" }}>
              <li>⚡ Notebook-style line-by-line query execution</li>
              <li>🔍 Auto-suggest tables, columns, keywords</li>
              <li>🧠 Multi-database support: SQLite, MySQL, PostgreSQL</li>
              <li>📦 Export results to CSV, Excel, PDF</li>
              <li>🔐 Login + history + re-run past queries</li>
            </ul>
          </div>

          <div className="hero-sub" style={{ marginTop: 24 }}>
            Built with ❤️ to make learning and working with SQL enjoyable.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
