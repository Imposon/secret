import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Contact() {
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <Navbar />

      <main className="page-container">
        <div className="glass-card">
          <h2>Contact Us</h2>
          <p className="hero-sub">Have questions? We're here to help.</p>

          <input
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Your Message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="textarea"
            style={{ height: 120, marginTop: 10 }}
          />

          <button className="cta-btn" style={{ marginTop: 10 }}>
            Send Message
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
