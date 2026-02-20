import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Footer() {
  return (
    <footer className="apple-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">⬡</span> SQLRunner
          </Link>
          <p className="footer-tagline">The modern SQL playground for every developer.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/studio" className="footer-link">Studio</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <Link to="/history" className="footer-link">History</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/auth" className="footer-link">Login</Link>
            <Link to="/auth" className="footer-link">Register</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SQLRunner. Designed with precision.</span>
        <div className="footer-bottom-links">
          <Link to="/pricing" className="footer-link-sm">Pricing</Link>
          <Link to="/about" className="footer-link-sm">About</Link>
          <Link to="/contact" className="footer-link-sm">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
