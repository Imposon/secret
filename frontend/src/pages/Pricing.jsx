// src/pages/Pricing.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Pricing() {
  const plans = [
    { name: "Free", price: "Free", features: ["Local SQLite", "Notebook cells", "Export CSV"] },
    { name: "Pro", price: "$9 / mo", features: ["MySQL/Postgres", "History 10k", "Export XLSX/PDF", "Priority support"] },
    { name: "Team", price: "$49 / mo", features: ["Team auth", "Sharing", "Audit log", "SAML (soon)"] }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: "140px 40px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ fontSize: 44, background: "linear-gradient(90deg,#7f5cff,#00c6ff)", WebkitBackgroundClip: "text", color: "transparent" }}>Pricing</h1>
          <p style={{ color: "#cfcfcf" }}>Plans built for students, solo devs and teams.</p>
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          {plans.map((p) => (
            <div key={p.name} className="glass-card" style={{ width: 320 }}>
              <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{p.price}</div>
              <ul style={{ color: "#cfcfcf", marginBottom: 12 }}>
                {p.features.map(f => <li key={f} style={{ marginBottom: 8 }}>{f}</li>)}
              </ul>
              <button className="cta-btn" style={{ width: "100%" }}>{p.name === "Free" ? "Get Started" : "Choose plan"}</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
