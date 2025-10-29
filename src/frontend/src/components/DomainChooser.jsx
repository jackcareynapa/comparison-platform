import React from "react";
import { listAvailableDomains } from "../config/entities";
import { useNavigate } from "react-router-dom";
import "../styles/components.css";

export default function DomainChooser() {
  const navigate = useNavigate();
  const domains = listAvailableDomains();

  return (
    <div className="container">
      <h1>What would you like to compare?</h1>
      <div className="grid-3 mt-md" role="list">
        {domains.map((d) => (
          <button
            key={d.type}
            className="tb-card"
            onClick={() => navigate(`/compare?type=${encodeURIComponent(d.type)}`)}
            role="listitem"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <div style={{ fontWeight: 700 }}>{d.label}</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>{d.description}</div>
            <div style={{ marginTop: 12 }}>
              <span className="tb-btn tb-btn-outline">Start comparing</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
