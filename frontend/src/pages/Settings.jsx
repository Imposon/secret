import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api, { setAuthToken } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  function logout() {
    setAuthToken(null);
    navigate("/auth");
  }

  return (
    <>
      <Navbar />

      <main className="page-container">
        <div className="glass-card">
          <h2>Account Settings</h2>
          <p className="hero-sub">Manage your profile, theme, and security.</p>

          <section className="settings-block">
            <h3>Appearance</h3>
            <button className="cta-btn small">Toggle Dark / Light Mode</button>
          </section>

          <section className="settings-block">
            <h3>Security</h3>
            <button className="cta-btn small">Change Password</button>
          </section>

          <section className="settings-block">
            <h3>Logout</h3>
            <button className="cta-btn danger" onClick={logout}>Logout</button>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
