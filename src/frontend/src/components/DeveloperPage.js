import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import DeveloperCard from "./DeveloperCard";
import { getDevelopers } from "../services/api";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const PageContainer = ({ children }) => (
  <div style={{ minHeight: "80vh", padding: 24, background: "#f7fafc" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
  </div>
);

// Helpers for tolerant matching
const candidateName = (d) =>
  d?.name ?? d?.Company ?? d?.company ?? (d?.raw && d.raw.name) ?? "";

const normalize = (s) =>
  String(s || "")
    .normalize("NFKD") // separate accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^0-9a-z ]/gi, " ") // keep alphanumerics and spaces
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .toLowerCase();

export default function DeveloperPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const devName = query.get("dev");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developers, setDevelopers] = useState([]);

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

  const developer = useMemo(() => {
    if (!devName || !developers.length) return null;
    // URLSearchParams.get usually returns decoded strings; still defensive:
    const target = normalize(String(devName));
    // debug: uncomment line below to inspect names during development
    // console.log("developer list names:", developers.map((d) => candidateName(d)));
    return (
      developers.find((d) => {
        return normalize(candidateName(d)) === target;
      }) || null
    );
  }, [devName, developers]);

  if (error)
    return (
      <div>
        <NavBar />
        <PageContainer>
          <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
            <h3>Error</h3>
            <pre style={{ color: "#b91c1c" }}>{String(error.message || error)}</pre>
          </div>
        </PageContainer>
      </div>
    );

  if (!developer)
    return (
      <div>
        <NavBar />
        <PageContainer>
          <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
            <h3>Developer not found</h3>
            <p>
              No developer found with name <strong>{devName}</strong>.
            </p>
          </div>
        </PageContainer>
      </div>
    );

  const prettyName = developer?.name || developer?.Company || devName;

  return (
    <div>
      <NavBar />
      <PageContainer>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: "0 0 420px" }}>
            <DeveloperCard dev={developer} isActive />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ background: "#fff", padding: 18, borderRadius: 8 }}>
              <h2 style={{ marginTop: 0 }}>{prettyName}</h2>

              {developer.description && (
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "4px 0" }}>Overview</h4>
                  <p style={{ margin: 0 }}>{developer.description}</p>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {developer.region && (
                  <div>
                    <strong>Region</strong>
                    <div>{developer.region}</div>
                  </div>
                )}
                {developer.project_size && (
                  <div>
                    <strong>Project size</strong>
                    <div>{developer.project_size}</div>
                  </div>
                )}
                {developer.services && (
                  <div>
                    <strong>Services</strong>
                    <div>{developer.services}</div>
                  </div>
                )}
                {developer.website && (
                  <div>
                    <strong>Website</strong>
                    <div>
                      <a
                        href={developer.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {developer.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <details style={{ marginTop: 12 }}>
                <summary>Raw data</summary>
                <pre style={{ maxHeight: 220, overflow: "auto" }}>
                  {JSON.stringify(developer, null, 2)}
                </pre>
              </details>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ background: "#fff", padding: 18, borderRadius: 8 }}>
                <h4 style={{ marginTop: 0 }}>AI notes / highlights</h4>
                <p style={{ color: "#555", margin: 0 }}>
                  This area is reserved for future AI-driven analysis of the
                  developer — strengths, weaknesses, similar projects, and
                  suggested comparison points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
