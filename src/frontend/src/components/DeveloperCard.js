import React from "react";

/**
 * DeveloperCard
 *
 * Small summary card for a developer, used in lists.
 *
 * Props:
 * - dev: developer object (may have .raw)
 * - onSelect: function called when card is clicked
 */

// Get field helpers that check top-level and .raw
const get = (dev, key) => (dev ? dev[key] ?? (dev.raw && dev.raw[key]) ?? undefined : undefined);
const getName = (dev) => get(dev, "name") ?? get(dev, "Company") ?? get(dev, "company") ?? "Unknown";

export default function DeveloperCard({ dev, onSelect = () => {} }) {
  const name = getName(dev);
  const projectType = get(dev, "project_type") ?? get(dev, "classification") ?? "";
  const region = get(dev, "region") ?? get(dev, "location") ?? "";
  const capacity = get(dev, "capacity_mw") ?? get(dev, "project_size_range") ?? "";

  return (
    <div
      onClick={() => onSelect(dev)}
      style={{
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        background: "#fff",
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(dev);
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            {projectType} {projectType && region ? " • " : ""} {region}
          </div>
          <div style={{ fontSize: 13, color: "#333" }}>{capacity ? `Capacity: ${capacity}` : "Capacity: —"}</div>
        </div>

        <div style={{ marginLeft: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onSelect(dev); }} aria-label={`Select ${name}`} >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
