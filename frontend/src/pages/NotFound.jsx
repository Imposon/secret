import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: "70px",
            background: "linear-gradient(45deg,#ff0055,#00c6ff)",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>404</h1>

          <h2 style={{ color: "#fff" }}>Page Not Found</h2>
          <p className="hero-sub">The page you are looking for doesn't exist.</p>

          <a href="/" className="cta-btn" style={{ marginTop: 20 }}>
            Go Home
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
