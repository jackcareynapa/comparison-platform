import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import { getDevelopers } from "../services/api"; 
import ReactMarkdown from "react-markdown";
import { Settings } from "lucide-react";

// Helper to parse query parameters
const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

// Helper to humanize keys
const humanize = (k) =>
  k
    .replace(/[_\-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Helper to get developer name
const candidateName = (d) =>
  d?.name ?? d?.Company ?? d?.company ?? (d?.raw && d.raw.name) ?? "";

// Helper to normalize strings for tolerant matching
const normalize = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^0-9a-z ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();



// ReferenceProjects component
function ReferenceProjects({ dev }) {
  if (!dev) return null;
  let projects = dev.reference_projects || dev.ref_projects || dev.projects || [];

  if (!Array.isArray(projects)) {
    projects = typeof projects === "object" && projects !== null ? [projects] : [];
  }

  const hasRealProjects = projects.some((p) => typeof p === "object" && Object.keys(p || {}).length > 0);

  if (!hasRealProjects) {
    projects = [
      { title: "Example Solar Farm", year: "2022", description: "50 MW, utility-scale", image: "/placeholder-project.jpg" },
      { title: "Industrial PV Park", year: "2023", description: "200 MW, ground-mount", image: "/placeholder-project.jpg" },
    ];
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12 }}>
      {projects.map((p, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 10, padding: 10, boxShadow: "0 8px 20px rgba(11,34,48,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 8, background: "#f8fafc" }}>
            {p.image ? (
              <img src={p.image} alt={p.title || `project-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e)=>e.currentTarget.style.display='none'} />
            ) : (
              <div style={{ color: "#9ca3af" }}>{p.title || "Project"}</div>
            )}
          </div>
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontWeight: 700 }}>{p.title || `Project ${i+1}`}</div>
            {p.year && <div style={{ color: "#6b7280", fontSize: 13 }}>{p.year}</div>}
            {p.description && <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>{p.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// DifferenceSummary component
function DifferenceSummary({ a, b, limit = 999 }) {
  if (!a || !b) return null;

  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).filter((k) => !/lat|lng|latitude|longitude/i.test(k));

  // Helper to format values for diffing
  function formatValueForDiff(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return v.join(", ");
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  const diffs = keys
    .map((k) => ({ k, na: formatValueForDiff(a[k]), nb: formatValueForDiff(b[k]) }))
    .filter(({ na, nb }) => na !== nb)
    .slice(0, limit);

  if (!diffs.length) return <div style={{ color: "#6b7280", fontStyle: "italic" }}>No major differences detected.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {diffs.map(({ k, na, nb }) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 12, alignItems: "start", background: "#fff", padding: 10, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 700 }}>{humanize(k)}</div>
          <div title={na} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#065f46", fontWeight: 600 }}>{na}</div>
          <div title={nb} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#7f1d1d", fontWeight: 600 }}>{nb}</div>
        </div>
      ))}
    </div>
  );
}

// StatPill component
function StatPill({ label, value }) {
  return (
      <div className="stat-pill">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}

// ProfileCardLarge component
function ProfileCardLarge({ dev, side = "left" }) {
  if (!dev) return (
    <div style={{ flex: 1, background: "#fff", padding: 20, borderRadius: 8, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ color: "#6b7280" }}>{side === "left" ? "No developer selected (dev1)" : "No developer selected (dev2)"}</div>
    </div>
  );

  const name = dev.name || dev.Company || dev.company || (dev.raw && dev.raw.name) || "Unnamed";
  const stats = [
    { label: "Region", value: dev.federal_state || "—" },
    { label: "Projects", value: (dev.reference_projects || dev.ref_projects || dev.projects || []).length || dev.project_count || "—" },
    { label: "Founded", value: dev.founded || "—" },
  ];

  return (
    <div style={{ flex: 1, background: "linear-gradient(180deg, #fff, #fbfdff)", padding: 18, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 12, minHeight: 320, boxShadow: "0 10px 30px rgba(11,34,48,0.04)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{name}</h3>
          {dev.tagline && <div style={{ color: "#6b7280", marginTop: 6 }}>{dev.tagline}</div>}
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stats.map((s) => <StatPill key={s.label} label={s.label} value={s.value} />)}
          </div>
        </div>
        <div style={{ width: 160, textAlign: "right" }}>
          {dev.logo ? <img src={dev.logo} alt={`${name} logo`} style={{ width: 120, height: 80, objectFit: "contain", borderRadius: 6 }} onError={(e)=>e.currentTarget.style.display='none'} /> : <div style={{ width: 120, height: 80, borderRadius: 6, background: "#eef2ff" }} />}
        </div>
      </div>

      {dev.description && (
        <div style={{ color: "#374151", lineHeight: 1.45 }}>
          <strong style={{ display: "block", marginBottom: 6 }}>Overview</strong>
          <div style={{ color: "#444" }}>{dev.description}</div>
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Reference projects</div>
        <ReferenceProjects dev={dev} />
      </div>
    </div>
  );
}

// Basic local AI analysis function (fallback)
function basicAIAnalysis(devA, devB) {
  if (!devA || !devB) return "Please select two developers to compare.";

  const nameA = devA.name || devA.Company || "Developer A";
  const nameB = devB.name || devB.Company || "Developer B";
  const lines = [];

  if (devA.region && devB.region && devA.region !== devB.region) {
    lines.push(`${nameA} operates mainly in ${devA.region}, while ${nameB} focuses on ${devB.region}.`);
  }
  const projA = (devA.reference_projects || devA.projects || []).length || devA.project_count || 0;
  const projB = (devB.reference_projects || devB.projects || []).length || devB.project_count || 0;
  if (projA !== projB) lines.push(`${nameA} lists ${projA} projects, compared to ${projB} for ${nameB}.`);

  if (devA.founded && devB.founded && devA.founded !== devB.founded) {
    lines.push(`${nameA} was founded in ${devA.founded}, while ${nameB} was founded in ${devB.founded}.`);
  }
  if (devA.description && !devB.description) lines.push(`${nameA} provides a detailed company description, unlike ${nameB}.`);
  else if (devB.description && !devA.description) lines.push(`${nameB} provides a detailed company description, unlike ${nameA}.`);

  if (!lines.length) return `Both ${nameA} and ${nameB} appear similar based on available data.`;
  return lines.join(" ");
}

// Main ComparisonPage component
export default function ComparisonPage() {
  const query = useQuery();
  const dev1Name = query.get("dev1");
  const dev2Name = query.get("dev2");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developers, setDevelopers] = useState([]);

  const [analysisText, setAnalysisText] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

// Fetch developers on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getDevelopers();
        if (!mounted) return;
        setDevelopers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const devA = useMemo(() => {
    if (!dev1Name || !developers.length) return null;
    const target = normalize(String(dev1Name));
    return developers.find((d) => normalize(candidateName(d)) === target) || null;
  }, [dev1Name, developers]);

  const devB = useMemo(() => {
    if (!dev2Name || !developers.length) return null;
    const target = normalize(String(dev2Name));
    return developers.find((d) => normalize(candidateName(d)) === target) || null;
  }, [dev2Name, developers]);

  if (error) return (
    <div>
      <NavBar />
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h3>Error</h3>
        <pre style={{ color: "#b91c1c" }}>{String(error.message || error)}</pre>
      </div>
    </div>
  );

  const bothProvided = Boolean(dev1Name && dev2Name);

 // Function to generate AI analysis
  async function generateAIAnalysis() {
    if (!devA || !devB) return;
    setAnalysisError(null);
    setAnalysisText("");
    setLoadingAnalysis(true);

    const endpoint = process.env.REACT_APP_ANALYZE_ENDPOINT || "/api/analyze";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerA: devA, developerB: devB }),
      });

      if (!res.ok) {
        // Try to surface helpful message
        const txt = await res.text();
        throw new Error(`Analysis API returned ${res.status}: ${txt}`);
      }

      const data = await res.json();
      // Expected shape: { analysis: "..." } (string)
      if (data?.analysis) {
        setAnalysisText(data.analysis);
      } else if (data?.result) {
        // Allow alternate naming
        setAnalysisText(data.result);
      } else {
        setAnalysisText("No textual analysis returned by the server.");
      }
    } catch (err) {
      console.error("generateAIAnalysis error:", err);
      setAnalysisError(String(err.message || err));
      // Fallback to local analysis so user still gets value
      try {
        const local = basicAIAnalysis(devA, devB);
        setAnalysisText(local);
      } catch (e2) {
        setAnalysisText("Failed to analyze (and fallback failed).");
      }
    } finally {
      setLoadingAnalysis(false);
    }
  }

  return (
    <div>
      <NavBar />
      <div style={{ minHeight: "80vh", padding: 24, background: "#f7fafc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ background: "#fff", padding: 18, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Compare developers</h2>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                {bothProvided ? "Comparing two developers" : "Select two developers from the map to compare"}
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
              <ProfileCardLarge dev={devA} side="left" />
              <ProfileCardLarge dev={devB} side="right" />
            </div>

            <div>
                <h5 style={{ marginTop: 10 }}>Quick Differences</h5>
                <div style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
                  <DifferenceSummary a={devA} b={devB} />
                </div>

                <div style={{ height: 12 }} />

              </div>

              <div>

                <div style={{ marginTop: 12 }}>
                  <h5 style={{ marginBottom: 6 }}>AI Analysis</h5>
                  <div style={{ marginTop: 8, background: "#fff", padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
                    <p style={{ color: "#6b7280", margin: 0 }}>
                      Tap on the gear icon to have our AI assistant compare the two developers.
                    </p>

                    <div style={{ textAlign: "center", marginTop: 24 }}>
                      <button
                        className={`bob-button ${loadingAnalysis ? "loading" : ""}`}
                        onClick={generateAIAnalysis}
                        disabled={loadingAnalysis}
                        title="Generate AI Analysis"
                      >
                        <Settings className="gear-icon" />
                      </button>
                    </div>

                    {analysisError && <div style={{ color: "#b91c1c", marginTop: 10 }}>{analysisError}</div>}

                    {analysisText && !loadingAnalysis && (
                    <div
                      style={{
                        marginTop: 12,
                        background: "#fff",
                        padding: 18,
                        borderRadius: 8,
                        lineHeight: 1.6,
                      }}
                    >
                      <ReactMarkdown>{analysisText}</ReactMarkdown>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              

            {!bothProvided && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>
                  Tip: open the map and click "Compare" on a second developer to arrive here with both selected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
