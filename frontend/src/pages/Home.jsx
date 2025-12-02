import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrapper}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>SQLRunner</div>
        <div style={styles.links}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/studio" style={styles.navLink}>Studio</Link>
          <Link to="/history" style={styles.navLink}>History</Link>
          <Link to="/auth" style={styles.loginBtn}>Login</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>The Ultimate SQL Playground</h1>

        <p style={styles.heroSubtitle}>
          Execute SQL instantly. Autocomplete with schema intelligence.
          Multi-database execution across SQLite, MySQL & PostgreSQL.
        </p>

        <Link to="/studio" style={styles.ctaButton}>
          Start Querying →
        </Link>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <div style={styles.featureBox}>
          <span style={styles.emoji}>⚡</span>
          <h3 style={styles.featureTitle}>Lightning Fast</h3>
          <p style={styles.featureText}>
            Execute SQL instantly across SQLite, MySQL & PostgreSQL.
          </p>
        </div>

        <div style={styles.featureBox}>
          <span style={styles.emoji}>🧠</span>
          <h3 style={styles.featureTitle}>Smart Autocomplete</h3>
          <p style={styles.featureText}>
            Schema-aware suggestions for tables & columns.
          </p>
        </div>

        <div style={styles.featureBox}>
          <span style={styles.emoji}>📜</span>
          <h3 style={styles.featureTitle}>Query History</h3>
          <p style={styles.featureText}>
            Re-run anything, anytime. Never lose a query again.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © 2025 SQLRunner — Built for developers who move fast 🚀
      </footer>
    </div>
  );
}

/* --------------------------------------- */
/*              INLINE STYLES              */
/* --------------------------------------- */

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0b0f17",
    color: "white",
    fontFamily: "Inter, sans-serif",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 60px",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 999,
  },

  logo: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(90deg, #ff1e56, #ffac41)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  links: {
    display: "flex",
    gap: "30px",
    alignItems: "center",
  },

  navLink: {
    color: "white",
    fontSize: "16px",
    fontWeight: "500",
    opacity: 0.8,
    textDecoration: "none",
  },

  loginBtn: {
    padding: "8px 18px",
    background: "#ff3b6d",
    borderRadius: "6px",
    color: "white",
    fontWeight: "600",
    textDecoration: "none",
  },

  hero: {
    textAlign: "center",
    padding: "120px 40px 80px",
  },

  heroTitle: {
    fontSize: "48px",
    fontWeight: "900",
    marginBottom: "20px",
  },

  heroSubtitle: {
    fontSize: "18px",
    opacity: 0.8,
    maxWidth: "800px",
    margin: "0 auto 40px",
  },

  ctaButton: {
    display: "inline-block",
    padding: "14px 28px",
    background: "#ff3b6d",
    color: "white",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "18px",
    textDecoration: "none",
  },

  features: {
    marginTop: "80px",
    display: "flex",
    justifyContent: "center",
    gap: "70px",
    padding: "20px 40px 60px",
  },

  featureBox: {
    width: "260px",
    textAlign: "center",
  },

  emoji: {
    fontSize: "40px",
  },

  featureTitle: {
    marginTop: "12px",
    fontSize: "22px",
    fontWeight: "700",
  },

  featureText: {
    marginTop: "8px",
    opacity: 0.7,
  },

  footer: {
    padding: "40px",
    textAlign: "center",
    opacity: 0.6,
    marginTop: "60px",
  },
};
