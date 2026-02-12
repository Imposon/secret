import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../App.css";

export default function Home() {
  return (
    <div className="home-wrapper">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <h1 className="hero-title">
            SQL. Reimagined.
          </h1>
          <p className="hero-subtitle">
            The ultimate playground for developers. 
            Execute queries across MySQL, SQLite, and PostgreSQL with zero setup.
          </p>
          
          <div className="cta-group">
            <Link to="/studio" className="primary-btn">
              Get Started
            </Link>
            <Link to="/pricing" className="secondary-link">
              View Pricing <span>›</span>
            </Link>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section className="bento-section">
          <div className="bento-grid">
            
            {/* Box 1 (Large) */}
            <div className="bento-item bento-large">
              <div className="bento-content">
                <span className="feature-tag">Universal Compatibility</span>
                <h3>One Studio. Any DB.</h3>
                <p>Connect to MySQL, PostgreSQL, and SQLite instantly. Switch context in milliseconds.</p>
              </div>
              <div style={{ marginTop: 40, width: '100%', height: 120, background: 'linear-gradient(90deg, #2c2c2e 0%, #1c1c1e 100%)', borderRadius: 12, border: '1px solid #333' }}>
                {/* Visual placeholder for DB connection */}
                <div style={{ padding: 20, display: 'flex', gap: 12 }}>
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }}></div>
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }}></div>
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }}></div>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bento-item" style={{ background: 'linear-gradient(135deg, #0f1c2e 0%, #08101a 100%)' }}>
              <div className="bento-icon">⚡</div>
              <div className="bento-content">
                <h3>Lightning Fast</h3>
                <p>Built on Node.js for real-time execution.</p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bento-item">
              <div className="bento-content">
                <span className="feature-tag" style={{ color: '#bf5af2' }}>Intelligence</span>
                <h3>Autofill</h3>
                <p>Content-aware SQL suggestions as you type.</p>
              </div>
            </div>

            {/* Box 4 (Large) */}
            <div className="bento-item bento-large" style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #000 100%)' }}>
               <div className="bento-content">
                <span className="feature-tag" style={{ color: '#2997ff' }}>History & Analytics</span>
                <h3>Never lose a query.</h3>
                <p>Every execution is saved. Search, filter, and re-run your history anytime.</p>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
