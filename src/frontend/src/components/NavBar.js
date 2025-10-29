import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/themes.css";
import defaultLogo from "../assets/TBLogo.png";

export default function NavBar({
  logoSrc = defaultLogo,
  links = [
    { to: "/", label: "Home" },
    { to: "/map", label: "Developer Map" }
  ],
  className = "",
}) {
  const location = useLocation?.() ?? { pathname: typeof window !== "undefined" ? window.location.pathname : "/" };
  const current = location.pathname + (location.hash ?? "");

  return (
    <header className={`tb-header ${className}`}>
      <div className="tb-header-inner">
        <div className="tb-brand">
          <Link to="/" aria-label="Terrabid home" className="tb-brand-link" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={logoSrc}
              alt="Terrabid"
              className="tb-logo"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </Link>
        </div>

        <nav className="tb-nav" aria-label="Main navigation">
          {links.map((l) => {
            const isActive = current === l.to || (l.to !== "/" && current.startsWith(l.to));
            return (
              <Link key={l.to + l.label} to={l.to} className={isActive ? "active" : ""} aria-current={isActive ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        
      </div>
    </header>
  );
}
