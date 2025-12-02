// src/pages/Auth.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api, { setAuthToken } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function goGitHub() {
    window.location.href = "http://localhost:5001/auth/github";
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email, password });
        setAuthToken(res.data.token);
        navigate("/studio");
      } else {
        const res = await api.post("/api/auth/register", { email, password, name });
        setAuthToken(res.data.token);
        navigate("/studio");
      }
    } catch (err) {
      setErr(err.response?.data?.error || "Auth failed");
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: "140px 40px 60px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 980, display: "flex", gap: 24 }}>
          <div className="glass-card" style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 8 }}>{mode === "login" ? "Sign in" : "Create account"}</h2>
            <p style={{ color: "#cfcfcf", marginBottom: 12 }}>Use your GitHub account or email to continue.</p>

            <button className="cta-btn" onClick={goGitHub} style={{ width: "100%", marginBottom: 10 }}>
              Continue with GitHub
            </button>

            <div style={{ textAlign: "center", margin: "10px 0", color: "#bdbdbd" }}>OR</div>

            <form onSubmit={submit}>
              {mode === "register" && <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }} />}
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }} />
              <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }} />
              {err && <div style={{ color: "#ffb4b4", marginBottom: 8 }}>{err}</div>}
              <button type="submit" className="cta-btn" style={{ width: "100%" }}>{mode === "login" ? "Sign In" : "Create Account"}</button>
            </form>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ background: "transparent", border: "none", color: "#bdbdbd", cursor: "pointer" }}>
                {mode === "login" ? "Create an account" : "Have an account? Sign in"}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <h3>Why sign in?</h3>
            <ul style={{ color: "#cfcfcf", marginTop: 8 }}>
              <li>Save query history</li>
              <li>Re-run queries from anywhere</li>
              <li>Export & share results</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <img src="/illustration-db.png" alt="illustration" style={{ width: "100%", borderRadius: 8 }} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
