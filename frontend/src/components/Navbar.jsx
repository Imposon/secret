import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>SQLRunner</div>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/studio" style={styles.link}>Studio</Link>
        <Link to="/history" style={styles.link}>History</Link>
        <Link to="/login" style={styles.loginBtn}>Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    background: "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },

  brand: {
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(90deg,#ff4d7a,#ffce54)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },

  link: {
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "0.25s",
  },

  loginBtn: {
    padding: "8px 18px",
    background: "#ff4d7a",
    borderRadius: "8px",
    textDecoration: "none",
    color: "white",
    fontWeight: "600",
  }
};
