import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">SQLRunner</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/studio">SQL Studio</Link>
        <Link to="/history">History</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/auth">Login</Link>
      </div>
    </nav>
  );
}
