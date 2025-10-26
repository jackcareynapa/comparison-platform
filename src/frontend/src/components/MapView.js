import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix missing default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper: normalize object keys to test for many header variants
const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Try multiple candidate keys on a developer object and return first found
function pick(dev, candidates = []) {
  if (!dev || typeof dev !== "object") return undefined;
  const map = {};
  // build normalized map of available keys -> original key
  Object.keys(dev).forEach((k) => {
    map[normalize(k)] = k;
  });
  for (const c of candidates) {
    const n = normalize(c);
    if (n in map) return dev[map[n]];
  }
  return undefined;
}

// Convert latitude/longitude to numbers and validate
function toNumber(v) {
  if (v === undefined || v === null) return NaN;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

// Component to fit map bounds to markers
function FitBounds({ positions, padding = [40, 40] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding });
  }, [map, positions, padding]);
  return null;
}

export default function MapView({ developers = [], selected = null, onSelect = () => {} }) {
  // Normalise developers into a consistent shape, but keep original object as `raw`
  const normalized = useMemo(() => {
    return (developers || [])
      .map((dev) => {
        const raw = dev;
        const name =
          pick(dev, ["company", "name", "organisation", "organization"]) || "";
        const lat = toNumber(pick(dev, ["lat", "latitude", "y"]));
        const lng = toNumber(pick(dev, ["lng", "lon", "lng", "longitude", "x"]));
        const project_type =
          pick(dev, [
            "project_type",
            "projecttype",
            "classification",
            "services",
            "offer",
          ]) || "";
        const region =
          pick(dev, ["region", "region/location (de)", "location", "state"]) || "";
        const deal_summary =
          pick(dev, ["referenceprojects", "reference_projects", "deal_summary", "notes"]) ||
          "";
        const capacity_mw =
          pick(dev, ["capacity_mw", "capacity", "project_size_range", "size_mw"]) || "";
        const financing_option = pick(dev, ["financing_option", "financing", "finance"]) || "";
        const contact_email = pick(dev, ["contact_email", "email", "e-mail"]) || "";

        return {
          raw,
          name,
          lat,
          lng,
          project_type,
          region,
          deal_summary,
          capacity_mw,
          financing_option,
          contact_email,
        };
      })
      // keep only entries with valid numeric lat/lng
      .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
  }, [developers]);

  // positions array for fitBounds
  const positions = useMemo(
    () => normalized.map((d) => [d.lat, d.lng]),
    [normalized]
  );

  return (
    <MapContainer
      center={[-25, 133]}
      zoom={4}
      style={{ height: "500px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds positions={positions} />
      {normalized.map((dev, idx) => (
        <Marker
          key={idx}
          position={[dev.lat, dev.lng]}
          eventHandlers={{
            click: () => onSelect(dev.raw ?? dev),
          }}
        >
          <Popup>
            <div style={{ maxWidth: 240 }}>
              <strong>{dev.name || "Unknown"}</strong>
              <br />
              {dev.project_type ? (
                <>
                  <small>{dev.project_type}</small>
                  <br />
                </>
              ) : null}
              {dev.region ? (
                <>
                  <small>{dev.region}</small>
                  <br />
                </>
              ) : null}
              {dev.deal_summary ? (
                <>
                  <div style={{ marginTop: 6 }}>{dev.deal_summary}</div>
                </>
              ) : null}
              {dev.capacity_mw ? <div>Capacity: {dev.capacity_mw} MW</div> : null}
              {dev.financing_option ? <div>{dev.financing_option}</div> : null}
              {dev.contact_email ? (
                <div>
                  <a href={`mailto:${dev.contact_email}`}>{dev.contact_email}</a>
                </div>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
