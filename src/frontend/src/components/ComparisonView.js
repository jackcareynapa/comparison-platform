import React from "react";

/**
 * ComparisonView
 *
 * Renders a simple comparison summary for selected developers.
 *
 * Props:
 * - selectedDevelopers: array of developer objects (each may have .raw)
 */

// tiny getter: looks at top-level and at .raw
const get = (dev, key) => {
  if (!dev) return undefined;
  return dev[key] ?? (dev.raw && dev.raw[key]) ?? undefined;
};

export default function ComparisonView({ selectedDevelopers = [] }) {
  if (!selectedDevelopers || selectedDevelopers.length === 0) {
    return (
      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <strong>No comparison data</strong>
        <div style={{ fontSize: 12, color: "#666" }}>Select developers to compare them here.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Comparison</h3>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, selectedDevelopers.length)}, 1fr)`, gap: 12 }}>
        {selectedDevelopers.map((dev, idx) => {
          const name = get(dev, "name") ?? get(dev, "Company") ?? `Developer ${idx + 1}`;
          const projectType = get(dev, "project_type") ?? get(dev, "classification") ?? "";
          const region = get(dev, "region") ?? get(dev, "location") ?? "";
          const capacity = get(dev, "capacity_mw") ?? get(dev, "project_size_range") ?? "";
          const contact = get(dev, "contact_email") ?? get(dev, "email") ?? get(dev, "Contact");

          return (
            <div key={name + idx} style={{ border: "1px solid #f4f4f4", borderRadius: 6, padding: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                {projectType ? <span>{projectType} • </span> : null}
                {region ? <span>{region}</span> : null}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#888" }}>Capacity</div>
                <div style={{ fontWeight: 600 }}>{capacity || "—"}</div>
              </div>

              <div style={{ fontSize: 12, color: "#444" }}>
                {get(dev, "deal_summary") || get(dev, "services") || get(dev, "description") || "No description"}
              </div>

              {contact ? (
                <div style={{ marginTop: 8 }}>
                  <a href={`mailto:${contact}`} style={{ fontSize: 12 }}>
                    {contact}
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
