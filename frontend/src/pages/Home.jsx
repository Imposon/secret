import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../App.css";

/* ── Scroll Animation Hook ── */
function useScrollObserver(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    // Observe all .observe-* children inside this container
    const targets = el.querySelectorAll(
      ".observe-fade, .observe-fade-left, .observe-fade-right"
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export default function Home() {
  const bentoRef   = useScrollObserver(0.1);
  const statsRef   = useScrollObserver(0.2);
  const ctaRef     = useScrollObserver(0.2);

  return (
    <div className="home-wrapper">
      <Navbar />

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="hero-section">
          <div className="hero-grid-bg" aria-hidden="true" />
          <div className="hero-glow"   aria-hidden="true" />
          <div className="hero-glow-2" aria-hidden="true" />

          <div className="hero-badge">
            <span className="badge-dot" />
            Now with AI-assisted query generation
          </div>

          <h1 className="hero-title">
            SQL.{" "}
            <span className="hero-title-accent">Reimagined.</span>
          </h1>

          <p className="hero-subtitle">
            The ultimate playground for developers. Execute queries across
            MySQL and PostgreSQL with zero configuration.
          </p>

          <div className="cta-group">
            <Link to="/studio" className="primary-btn">
              Open Studio →
            </Link>
            <Link to="/pricing" className="secondary-link">
              View Pricing
            </Link>
          </div>

          <div className="hero-scroll-hint" aria-hidden="true">
            <span>scroll</span>
            <span className="scroll-arrow" />
          </div>
        </section>

        {/* ══════════ BENTO FEATURES ══════════ */}
        <section className="bento-section" ref={bentoRef}>
          <p className="section-label observe-fade">Features</p>
          <h2 className="section-title observe-fade delay-1">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="section-sub observe-fade delay-2">
            Built for speed, power, and clarity — from your first query to
            production-grade analytics.
          </p>

          <div className="bento-grid">

            {/* Card 1 — large, span 2 */}
            <div className="bento-item bento-span-2 observe-fade">
              <div className="bento-glow" style={{
                background: "radial-gradient(circle at 30% 50%, rgba(41,151,255,0.08) 0%, transparent 70%)"
              }} />
              <div className="mac-dots">
                <span className="mac-dot md-red" />
                <span className="mac-dot md-yellow" />
                <span className="mac-dot md-green" />
              </div>
              <div className="bento-code-block">
                <div>
                  <span className="code-keyword">SELECT</span>{" "}
                  <span className="code-fn">COUNT</span>(*),
                  region
                </div>
                <div>
                  <span className="code-keyword">FROM</span>{" "}
                  <span className="code-str">orders</span>
                </div>
                <div>
                  <span className="code-keyword">WHERE</span> status ={" "}
                  <span className="code-str">'completed'</span>
                </div>
                <div>
                  <span className="code-keyword">GROUP BY</span> region;
                </div>
              </div>
              <span className="feature-tag" style={{ marginTop: 20 }}>Universal Compatibility</span>
              <h3>One Studio. Any DB.</h3>
              <p>Connect to MySQL and PostgreSQL instantly. Switch context in milliseconds.</p>
            </div>

            {/* Card 2 */}
            <div className="bento-item observe-fade delay-1" style={{
              background: "linear-gradient(135deg, #0a1628 0%, #060e1c 100%)"
            }}>
              <div className="bento-glow" style={{
                background: "radial-gradient(circle at 50% 80%, rgba(41,151,255,0.15) 0%, transparent 70%)"
              }} />
              <span className="bento-icon-large">⚡</span>
              <span className="feature-tag" style={{ color: "var(--accent-blue)" }}>Performance</span>
              <h3>Lightning Fast</h3>
              <p>Real-time execution built on Node.js. Results in milliseconds.</p>
            </div>

            {/* Card 3 */}
            <div className="bento-item observe-fade delay-2" style={{
              background: "linear-gradient(135deg, #130a22 0%, #0c0616 100%)"
            }}>
              <div className="bento-glow" style={{
                background: "radial-gradient(circle at 50% 80%, rgba(191,90,242,0.15) 0%, transparent 70%)"
              }} />
              <span className="bento-icon-large">🧠</span>
              <span className="feature-tag" style={{ color: "var(--accent-purple)" }}>Intelligence</span>
              <h3>Smart Autofill</h3>
              <p>Content-aware SQL suggestions — tables, columns, and keywords.</p>
            </div>

            {/* Card 4 */}
            <div className="bento-item observe-fade delay-3">
              <div className="bento-glow" style={{
                background: "radial-gradient(circle at 50% 80%, rgba(48,209,88,0.1) 0%, transparent 70%)"
              }} />
              <span className="bento-icon-large">📦</span>
              <span className="feature-tag" style={{ color: "var(--accent-green)" }}>Export</span>
              <h3>Any Format</h3>
              <p>Export to CSV, Excel, or PDF in one click.</p>
            </div>

            {/* Card 5 — large, span 2 */}
            <div className="bento-item bento-span-2 observe-fade delay-2" style={{
              background: "linear-gradient(135deg, #0c1a15 0%, #060e0b 100%)"
            }}>
              <div className="bento-glow" style={{
                background: "radial-gradient(circle at 70% 50%, rgba(48,209,88,0.1) 0%, transparent 70%)"
              }} />
              <span className="feature-tag" style={{ color: "var(--accent-green)" }}>History &amp; Analytics</span>
              <h3>Never lose a query.</h3>
              <p>
                Every execution is saved automatically. Search, filter, re-run, and
                analyze your full query history at any time.
              </p>
            </div>

          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="stats-section" ref={statsRef}>
          <p className="section-label observe-fade">By the numbers</p>
          <div className="stats-grid">
            {[
              { number: "3+", label: "DB Engines Supported" },
              { number: "∞",  label: "Query History Stored"  },
              { number: "0",  label: "Config Files Needed"   },
              { number: "1ms", label: "Avg. Response Time"   },
            ].map(({ number, label }, i) => (
              <div key={label} className={`stat-item observe-fade delay-${i + 1}`}>
                <div className="stat-number">{number}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ CTA BANNER ══════════ */}
        <section className="cta-banner" ref={ctaRef}>
          <p className="section-label observe-fade">Get started today</p>
          <h2 className="section-title observe-fade delay-1">
            Build something amazing<br />with SQLRunner.
          </h2>
          <p className="section-sub observe-fade delay-2">
            Free to use. No credit card required. Open your first query
            in under 30 seconds.
          </p>
          <div className="cta-group observe-fade delay-3">
            <Link to="/studio" className="primary-btn">
              Open Studio →
            </Link>
            <Link to="/auth" className="secondary-link">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
