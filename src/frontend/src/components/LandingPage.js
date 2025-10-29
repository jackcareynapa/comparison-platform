import React from "react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import "../styles/themes.css";

export default function LandingPage() {
  
  return (
    <div className="tb-landing">
      <NavBar/>

      <main className="tb-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(34,203,100,0.85), rgba(11,133,197,0.85))` }}>
        <div className="tb-hero-inner">
          <h1 className="tb-hero-title">
            Your strong partner in <span className="tb-em">energy transformation</span>
          </h1>

          <p className="tb-hero-sub">
            We ensure that your interests are represented and that you benefit from the energy transition.
          </p>

          <div className="tb-nav">
            <Link to="/map">
            Find a developer
            </Link>
</div>
        </div>
      </main>

      <footer className="tb-footer">
        <div className="tb-footer-inner">
          <div>© {new Date().getFullYear()} Terrabid</div>
          <div className="tb-footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
