import React from "react";

export default function DeveloperCard({
  dev = {},
  onSelect = () => {},
  onLearnMore = () => {},
  isActive = false,
}) {
  const companyName = dev.name || dev.Company || dev.company || "Unnamed Developer";

  return (
    <div
      className="developer-card"
      style={{
        border: isActive ? "2px solid #22c55e" : undefined
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="developer-card__name">{companyName}</div>

      <div className="developer-card__logo">
        {dev.logo ? (
          <img
            src={dev.logo}
            alt={`${companyName} logo`}
            onError={(ev) => (ev.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="developer-card__no-logo">No Logo</div>
        )}
      </div>

      <div className="developer-card__actions">
        <button className="tb-btn" onClick={() => onSelect(dev)}>
          {dev.selected ? "Deselect" : "Select"}
        </button>
        <button className="tb-btn tb-btn-primary" onClick={() => onLearnMore(dev)}>
          Learn More
        </button>
      </div>
    </div>
  );
}
