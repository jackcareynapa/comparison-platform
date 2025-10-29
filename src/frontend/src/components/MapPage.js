// MapPage.js — with collapsible floating filter bar (updated navigation + compare behavior)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "./MapView";
import ComparisonHotbar from "./ComparisonHotbar";
import DeveloperCard from "./DeveloperCard";
import NavBar from "./NavBar.js";
import MapFilterBar from "./MapFilterBar";
import { getDevelopers } from "../services/api";
import "../styles/themes.css";

// --- helper ---
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

// --- modal for compare view ---
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 96%)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>{title ?? "Compare developers"}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeName, setActiveName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- new unified filters ---
  const [filters, setFilters] = useState({
    classification: "",
    state: "",
    projectSize: [0, 100],
    services: "",
  });

  const carouselRef = useRef(null);
  const cardRefs = useRef(new Map());

  // --- Load data ---
  useEffect(() => {
    (async () => {
      try {
        const data = await getDevelopers();
        setDevelopers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Derived filtered list ---
  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      const classification =
        dev.project_type ?? dev.classification ?? dev.services ?? "";
      const region =
        dev.region ?? dev.location ?? dev["Region"] ?? dev["region/location (de)"] ?? "";
      const projectSize = dev.project_size ?? 0;
      const services = dev.services ?? "";

      const matchClassification =
        !filters.classification || classification === filters.classification;
      const matchState = !filters.state || region === filters.state;
      const matchSize =
        projectSize >= filters.projectSize[0] &&
        projectSize <= filters.projectSize[1];
      const matchService =
        !filters.services || services.includes(filters.services);

      return matchClassification && matchState && matchSize && matchService;
    });
  }, [developers, filters]);

  // --- Selection helpers ---
  const toggleSelect = (devOrName) => {
    const name = getName(devOrName);
    if (!name) return;
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const removeSelectedByName = (name) =>
    setSelected((prev) => prev.filter((n) => n !== name));

  const selectedDevelopers = useMemo(() => {
    const names = new Set(selected);
    return developers.filter((d) => names.has(getName(d)));
  }, [developers, selected]);

  // new: navigate to developer detail page when "Learn more" clicked
  const handleLearnMore = (devOrName) => {
    const name = getName(devOrName);
    if (!name) return;
    // keep same style the carousel used: /platform?dev=...
    navigate(`/developer?dev=${encodeURIComponent(name)}`);
  };

  // open compare from card button (adds to selection and either opens modal or navigates)
  const openCompare = (devOrName) => {
    const name = getName(devOrName);
    if (!name) return;

    const alreadySelected = selected.includes(name);
    const newSelected = alreadySelected ? selected : [...selected, name];

    // ensure local state updated
    setSelected(newSelected);

    if (newSelected.length >= 2) {
      // navigate to comparison page with first two selected
      const [a, b] = newSelected.slice(0, 2);
        navigate(`/comparison?dev1=${encodeURIComponent(a)}&dev2=${encodeURIComponent(b)}`);
      return;
    }

    // else open the compare modal for user to select another
    setCompareOpen(true);
  };

  const handleCompare = () => {
    if (selected.length >= 2) {
      const [a, b] = selected.slice(0, 2);
        navigate(`/comparison?dev1=${encodeURIComponent(a)}&dev2=${encodeURIComponent(b)}`);
    } else {
      // fewer than two — show the modal so the user can pick
      setCompareOpen(true);
    }
  };

  const ensureCardRef = (name) => {
    if (!name) return null;
    let ref = cardRefs.current.get(name);
    if (!ref) {
      ref = React.createRef();
      cardRefs.current.set(name, ref);
    }
    return ref;
  };

  const scrollToDeveloper = (devOrName, { setActive = true } = {}) => {
    const name = getName(devOrName);
    if (!name) return;
    const ref = cardRefs.current.get(name);
    const container = carouselRef.current;
    if (ref?.current && container) {
      ref.current.scrollIntoView({ behavior: "smooth", inline: "center" });
      if (setActive) setActiveName(name);
    }
  };

  // --- filter handlers ---
  const handleApplyFilters = (f) => setFilters(f);
  const handleResetFilters = (reset) => setFilters(reset);

  if (loading) return <div style={{ padding: 20 }}>Loading map...</div>;
  if (error)
    return (
      <div style={{ padding: 20, color: "red" }}>
        Error: {String(error.message ?? error)}
      </div>
    );

  return (
    <div className="tb-landing tb-gradient-fade">
      <NavBar />

      {/* === Main Map + Sidebar === */}
      <main
        style={{
          padding: "20px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Map & Sidebar */}
          <div style={{ display: "flex", gap: 12, height: "60vh" }}>
            {/* --- Map Section --- */}
            <div
              className="tb-map-overlay"
              style={{
                flex: 1,
                position: "relative",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Filter toolbar now inside the map container */}
              <MapFilterBar
                filters={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />

              <MapView
                developers={filteredDevelopers}
                onSelect={toggleSelect}
                selected={selected}
                onLearnMore={handleLearnMore} // <-- map popups now navigate
              />
            </div>

            {/* --- Sidebar --- */}
            <aside
              style={{
                width: 360,
                padding: 12,
                background: "#fff",
                borderLeft: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Selected developers</h4>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {selected.length} selected
                </div>
              </div>
              <ComparisonHotbar
                selectedDevelopers={selectedDevelopers}
                onRemove={(payload) =>
                  removeSelectedByName(
                    typeof payload === "string" ? payload : getName(payload)
                  )
                }
                onCompare={handleCompare} // <-- hotbar compare navigates when possible
              />
             
            </aside>
          </div>

          {/* --- Carousel --- */}
          <div style={{ flex: "0 0 30vh", minHeight: 200 }}>
            <div className="tb-carousel-wrapper">
              <div className="tb-carousel" ref={carouselRef} role="list">
                {filteredDevelopers.map((dev, idx) => {
                  const name = getName(dev) || `dev-${idx}`;
                  const ref = ensureCardRef(name);
                  return (
                    <div
                      key={name}
                      ref={ref}
                      role="listitem"
                      className={`tb-carousel-item ${
                        activeName === name ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveName(name);
                        setTimeout(
                          () => scrollToDeveloper(name, { setActive: true }),
                          50
                        );
                      }}
                    >
                      <DeveloperCard
                        dev={dev}
                        onSelect={() => toggleSelect(dev)}
                        onOpenCompare={(d) => openCompare(d)} // <-- wired so card Compare triggers navigation/modal
                        onLearnMore={() =>
                          navigate(`/developer?dev=${encodeURIComponent(name)}`)
                        }
                        isActive={activeName === name}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="tb-footer">
        <div className="tb-footer-inner">
          <div>© {new Date().getFullYear()} Terrabid</div>
          <div className="tb-footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </footer>

      {/* --- Compare Modal --- */}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Compare developers"
      >
      </Modal>
    </div>
  );
}
