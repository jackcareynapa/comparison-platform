import React from "react";

/**
 * ComparisonHotbar
 *
 * Props:
 * - selectedDevelopers: array of developer objects (or objects with .raw)
 * - onRemove: function(devOrName) -> parent will remove by name
 * - onCompare: optional function invoked to open the compare UI
 */

// local helper
const getName = (devOrName) => {
  if (!devOrName) return undefined;
  if (typeof devOrName === "string") return devOrName;
  return devOrName.name ?? (devOrName.raw && devOrName.raw.name) ?? devOrName.Company ?? devOrName.company;
};

export default function ComparisonHotbar({ selectedDevelopers = [], onRemove = () => {}, onCompare = () => {} }) {
  if (!selectedDevelopers || selectedDevelopers.length === 0) {
    return (
      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <strong>No developers selected</strong>
        <div style={{ fontSize: 12, color: "#666" }}>Select markers or cards to compare</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Selected ({selectedDevelopers.length})</strong>
        <div>
          <button onClick={() => onCompare()} style={{ marginLeft: 8 }}>
            Compare
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
        {selectedDevelopers.map((dev, idx) => {
          const name = getName(dev) || `#${idx + 1}`;
          const region = dev?.region ?? (dev.raw && dev.raw.region) ?? dev?.Region ?? "";
          return (
            <div
              key={name + idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                border: "1px solid #f0f0f0",
                padding: 8,
                borderRadius: 6,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                  {name}
                </div>
                {region ? <div style={{ fontSize: 12, color: "#666" }}>{region}</div> : null}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  title="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(dev);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
