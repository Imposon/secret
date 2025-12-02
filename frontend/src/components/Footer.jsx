// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#bdbdbd" }}>
          <div>© {new Date().getFullYear()} SQLRunner</div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/pricing" style={{ color: "#bdbdbd" }}>Pricing</a>
            <a href="/history" style={{ color: "#bdbdbd" }}>History</a>
            <a href="/auth" style={{ color: "#bdbdbd" }}>Account</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
