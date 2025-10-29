import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function pick(dev, candidates = []) {
  if (!dev || typeof dev !== "object") return undefined;
  const map = {};
  Object.keys(dev).forEach((k) => (map[normalize(k)] = k));
  for (const c of candidates) {
    const n = normalize(c);
    if (n in map) return dev[map[n]];
  }
  return undefined;
}
function toNumber(v) {
  if (v === undefined || v === null) return NaN;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

function FitBounds({ positions, germanyCenter = [51.1657, 10.4515], germanyZoom = 6, padding = [40, 40] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (!positions || positions.length === 0) {
      map.setView(germanyCenter, germanyZoom);
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 8);
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding, maxZoom: 10 });
  }, [map, positions, germanyCenter, germanyZoom, padding]);
  return null;
}

export default function MapView({
  developers = [],
  selected = [],
  onSelect = () => {},
  onLearnMore = () => {},
  center = [51.1657, 10.4515],
  zoom = 6,
}) {
  const normalized = useMemo(() => {
    return (developers || [])
      .map((dev) => {
        const raw = dev;
        const name =
          pick(dev, ["company", "name", "organisation", "organization"]) || "";
        const lat = toNumber(pick(dev, ["lat", "latitude", "y"]));
        const lng = toNumber(pick(dev, ["lng", "lon", "lng", "longitude", "x"]));
        const project_type =
          pick(dev, ["project_type", "projecttype", "classification"]) || "";
        const region =
          pick(dev, ["region", "region/location (de)", "location", "state"]) || "";
        return { raw, name, lat, lng, project_type, region };
      })
      .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
  }, [developers]);

  const positions = useMemo(() => normalized.map((d) => [d.lat, d.lng]), [normalized]);

  const isSelected = (name) =>
    selected.some((s) =>
      typeof s === "string"
        ? s === name
        : (s.name ?? s.Company ?? s.company) === name
    );

  useEffect(() => {
    // CSS fix for Leaflet popups stacking
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-popup-content-wrapper { pointer-events: auto; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", 
        width: "100%",
        position: "relative",}}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds positions={positions} />

      {normalized.map((dev, idx) => {
        const devName = dev.name || `dev-${idx}`;
        const selectedNow = isSelected(devName);
        return (
          <Marker
            key={idx}
            position={[dev.lat, dev.lng]}
            icon={greenIcon}
            eventHandlers={{
              mouseover: (e) => {
                const marker = e.target;
                marker.openPopup();
                // keep open if hover over popup
                const popupEl = marker.getPopup()?.getElement();
                if (popupEl) {
                  popupEl.addEventListener("mouseenter", () => marker.openPopup());
                  popupEl.addEventListener("mouseleave", () => marker.closePopup());
                }
              },
              mouseout: (e) => {
                const marker = e.target;
                const popupEl = marker.getPopup()?.getElement();
                // only close if not hovering popup
                if (popupEl && popupEl.matches(":hover")) return;
                marker.closePopup();
              },
            }}
          >
            <Popup closeButton={false} autoClose={false} closeOnClick={false}>
              <div style={{ maxWidth: 260 }}>
                <strong>{dev.name || "Unknown"}</strong>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {dev.project_type && <>{dev.project_type} • </>}
                  {dev.region}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    className="tb-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(dev.raw ?? dev);
                    }}
                    aria-pressed={selectedNow}
                  >
                    {selectedNow ? "Deselect" : "Select"}
                  </button>

                  <button
                    className="tb-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (typeof onLearnMore === "function") onLearnMore(dev.raw ?? dev);
                    }}
                  >
                    Learn more
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
