// HomePage.js
import React, { useState, useMemo, useEffect } from "react";
import MapView from "./MapView";
import ComparisonHotbar from "./ComparisonHotbar";
import ComparisonView from "./ComparisonView";
import DeveloperCard from "./DeveloperCard";
import { getDevelopers } from "../services/api";

/**
 * HomePage
 *
 * - Fetches developers from backend on mount
 * - Keeps `selected` as an array of names (strings)
 * - toggleSelect accepts either a dev object or a name string (MapView may pass objects)
 * - Robust getters tolerate dev objects that may have `.raw` or inconsistent header names
 */

// Robust name getter (accepts string or object with `name` or `raw.name` or Company/company)
const getName = (devOrName) => {
  if (!devOrName) return undefined;
  if (typeof devOrName === "string") return devOrName;
  return (
    devOrName.name ??
    (devOrName.raw && devOrName.raw.name) ??
    devOrName.Company ??
    devOrName.company ??
    undefined
  );
};


export default function HomePage() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]); // array of names (strings)

  // Fetch developers from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getDevelopers();
        if (!mounted) return;
        // Ensure we have an array
        if (Array.isArray(data)) setDevelopers(data);
        else {
          console.warn("getDevelopers returned non-array:", data);
          setDevelopers([]);
        }
      } catch (err) {
        console.error("Failed to fetch developers:", err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Toggle selection (accepts object or name)
  const toggleSelect = (devOrName) => {
    const id = getName(devOrName);
    if (!id) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  // Remove by name helper
  const removeSelectedByName = (name) => {
    if (!name) return;
    setSelected((prev) => prev.filter((p) => p !== name));
  };

  // Build selectedDevelopers array (the full objects from `developers`)
  const selectedDevelopers = useMemo(() => {
    const setNames = new Set(selected.map((s) => (typeof s === "string" ? s : getName(s))));
    return developers.filter((d) => {
      const name = getName(d);
      return name && setNames.has(name);
    });
  }, [developers, selected]);

  // Debug: small preview
  const debugFirstNames = (developers || []).slice(0, 10).map((d) => getName(d) ?? "(no name)");

  // Console debug info
  if (typeof window !== "undefined") {
    console.debug("[HomePage] developers.length =", (developers || []).length);
    console.debug("[HomePage] sample names (first 10) =", debugFirstNames);
    console.debug("[HomePage] selected (names) =", selected);
  }

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0 }}>Developers Map</h1>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 16,
          padding: 16,
          alignItems: "start",
        }}
      >
        <section style={{ position: "relative", zIndex: 0 }}>
          {/* MapView: ensure it doesn't use absolute positioning that covers later content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <MapView developers={developers} onSelect={toggleSelect} selected={selected} />
          </div>

          {/* Developer list */}
          <div
            style={{
              marginTop: 16,
              position: "relative",
              zIndex: 2,
              background: "#fff",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>All developers</h2>
              <div style={{ fontSize: 12, color: "#666" }}>
                Count: <strong>{(developers || []).length}</strong>
              </div>
            </div>

            {/* Debug panel */}
            <div
              style={{
                marginTop: 8,
                padding: 8,
                borderRadius: 6,
                background: "#fff7e6",
                border: "1px solid #ffe8b3",
                fontSize: 12,
                color: "#663c00",
              }}
            >
              <div>
                <strong>Debug:</strong> first {debugFirstNames.length} names — {debugFirstNames.join(", ")}
              </div>
              <div style={{ marginTop: 6 }}>
                If this list is empty, your backend likely returned no rows. Check the API at{" "}
                <code>http://127.0.0.1:8000/developers</code>.
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {loading && <div style={{ padding: 12, color: "#666" }}>Loading developers...</div>}
              {error && <div style={{ padding: 12, color: "red" }}>Error loading developers: {String(error.message || error)}</div>}

              {!loading && developers.length === 0 && !error && (
                <div style={{ padding: 12, color: "#666" }}>
                  No developers found. Check your backend response or CSV loader.
                </div>
              )}

              {!loading && developers.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                  {developers.map((dev, idx) => (
                    <DeveloperCard
                      key={(getName(dev) || "dev") + "-" + idx}
                      dev={dev}
                      onSelect={() => toggleSelect(dev)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside>
          <ComparisonHotbar
            selectedDevelopers={selectedDevelopers}
            onRemove={(payload) => {
              // payload may be a name string, {name}, or an object; normalize to name
              const name = typeof payload === "string" ? payload : payload?.name ?? getName(payload);
              removeSelectedByName(name);
            }}
            onCompare={() => {
              // You can wire this to open a compare UI
              console.log("compare", selectedDevelopers.map((d) => getName(d)));
            }}
          />

          <div style={{ marginTop: 12 }}>
            <ComparisonView selectedDevelopers={selectedDevelopers} />
          </div>
        </aside>
      </main>
    </div>
  );
}
