import React, { useState } from "react";
import "../styles/themes.css";

export default function MapFilterBar({ filters, onApply, onReset }) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (e) => {
    const [min, max] = e.target.value.split(",");
    setLocalFilters((prev) => ({ ...prev, projectSize: [Number(min), Number(max)] }));
  };

  const applyFilters = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const resetFilters = () => {
    const reset = { classification: "", state: "", projectSize: [0, 100], services: "" };
    setLocalFilters(reset);
    onReset(reset);
  };

  return (
    <div className={`tb-filter-bar ${open ? "open" : ""}`}>
      <button className="tb-filter-toggle" onClick={() => setOpen(!open)}>
        🔍 Filters {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="tb-filter-content">
          <div className="tb-filter-row">
            <label>Classification</label>
            <select
              value={localFilters.classification}
              onChange={(e) => handleChange("classification", e.target.value)}
            >
              <option value="">All</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div className="tb-filter-row">
            <label>Federal State</label>
            <select
              value={localFilters.state}
              onChange={(e) => handleChange("state", e.target.value)}
            >
              <option value="">All</option>
              <option>Bavaria</option>
              <option>Berlin</option>
              <option>Hesse</option>
              <option>Lower Saxony</option>
              <option>North Rhine-Westphalia</option>
            </select>
          </div>

          <div className="tb-filter-row">
            <label>Project Size (MW)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localFilters.projectSize[1]}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  projectSize: [0, Number(e.target.value)],
                }))
              }
            />
            <span>{localFilters.projectSize[1]} MW</span>
          </div>

          <div className="tb-filter-row">
            <label>Category of Services</label>
            <select
              value={localFilters.services}
              onChange={(e) => handleChange("services", e.target.value)}
            >
              <option value="">All</option>
              <option>Planning</option>
              <option>Construction</option>
              <option>Financing</option>
              <option>Operation</option>
            </select>
          </div>

          <div className="tb-filter-actions">
            <button className="tb-btn tb-btn-outline" onClick={resetFilters}>
              Reset
            </button>
            <button className="tb-btn tb-btn-primary" onClick={applyFilters}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
