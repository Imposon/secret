import React, { useState } from "react";
import api, { setAuthToken } from "../api";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email, password });
        setAuthToken(res.data.token);
        onLogin(res.data.user);
      } else {
        const res = await api.post("/api/auth/register", { email, password, name });
        setAuthToken(res.data.token);
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Auth failed");
    }
  }

  return (
    <div className="auth-box">
      <h3>{mode === "login" ? "Login" : "Register"}</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        {mode === "register" && <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create account" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}
