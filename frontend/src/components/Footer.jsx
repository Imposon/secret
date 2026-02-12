import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Footer() {
  return (
    <footer className="apple-footer">
      <div className="footer-content">
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <span>© {new Date().getFullYear()} SQLRunner</span>
          <span style={{color: "#424245"}}>|</span>
          <span style={{color: "#86868b"}}>Designed with precision.</span>
        </div>
        <div className="footer-links">
          <Link to="/pricing" className="footer-link">Pricing</Link>
          <Link to="/history" className="footer-link">History</Link>
          <Link to="/auth" className="footer-link">Account</Link>
        </div>
      </div>
    </footer>
  );
}
