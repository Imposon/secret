import { Link } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  return (
    <nav className="apple-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SQLRunner
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/studio" className="nav-link">Studio</Link>
          <Link to="/history" className="nav-link">History</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/auth" className="nav-btn">Login</Link>
        </div>
      </div>
    </nav>
  );
}
