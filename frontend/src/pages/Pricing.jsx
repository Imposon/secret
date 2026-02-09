import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Pricing() {
  return (
    <>
      <Navbar />
      <main className="pricing-page">
        <div style={{ padding: "120px 20px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "20px", color: "#fff" }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: "18px", color: "#8b949e", marginBottom: "60px" }}>
            Choose the plan that's right for you. No hidden fees.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
            {/* Free Plan */}
            <div className="glass-card" style={{ flex: "1", minWidth: "300px", maxWidth: "350px", padding: "40px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "24px", color: "#fff", marginBottom: "10px" }}>Free</h3>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#ff4d7a", marginBottom: "20px" }}>
                $0<span style={{ fontSize: "16px", color: "#8b949e" }}>/mo</span>
              </div>
              <p style={{ color: "#8b949e", marginBottom: "30px" }}>Perfect for learning and small projects.</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", textAlign: "left", flex: 1 }}>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> MySQL Support
                </li>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Basic Query History
                </li>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Export to CSV
                </li>
              </ul>
              
              <button className="cta-btn" style={{ width: "100%", marginTop: "auto" }}>Current Plan</button>
            </div>

            {/* Pro Plan */}
            <div className="glass-card" style={{ flex: "1", minWidth: "300px", maxWidth: "350px", padding: "40px", display: "flex", flexDirection: "column", border: "1px solid #ff4d7a", position: "relative" }}>
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#ff4d7a", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: "24px", color: "#fff", marginBottom: "10px" }}>Pro</h3>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#ff4d7a", marginBottom: "20px" }}>
                $19<span style={{ fontSize: "16px", color: "#8b949e" }}>/mo</span>
              </div>
              <p style={{ color: "#8b949e", marginBottom: "30px" }}>For professionals and teams.</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", textAlign: "left", flex: 1 }}>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> All Free Features
                </li>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Unlimited Query History
                </li>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Advanced Analytics
                </li>
                <li style={{ marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Priority Support
                </li>
              </ul>
              
              <button className="cta-btn" style={{ width: "100%", background: "#ff4d7a", color: "white", border: "none" }}>Upgrade Now</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
