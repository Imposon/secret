import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/studio", label: "Studio" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`apple-nav${scrolled ? " nav-scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⬡</span>
          SQLRunner
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-nav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${location.pathname === to ? " nav-link-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions desktop-nav">
          <Link to="/auth" className="nav-btn">Login</Link>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`ham-line${menuOpen ? " ham-open" : ""}`}></span>
          <span className={`ham-line${menuOpen ? " ham-open" : ""}`}></span>
          <span className={`ham-line${menuOpen ? " ham-open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-menu${menuOpen ? " mobile-menu-open" : ""}`}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} className="mobile-nav-link">{label}</Link>
        ))}
        <Link to="/auth" className="mobile-nav-link mobile-cta">Login</Link>
      </div>
    </nav>
  );
}
