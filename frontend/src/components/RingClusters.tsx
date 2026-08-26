import React, { useEffect, useState } from "react";
import { Layers } from "lucide-react";

interface RingClustersProps {
  onSelectEntity: (entityId: string) => void;
}

export const RingClusters: React.FC<RingClustersProps> = ({ onSelectEntity }) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);



  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/graph/clusters/suspicious");
      const data = await res.json();
      setClusters(data.clusters || []);
    } catch (err) {
      console.error("Failed to fetch suspicious clusters", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Layers className="text-sky-400" /> Suspicious Community Ring Clusters
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Multi-user collusion networks sharing physical devices, IP subnets, or payment cards
        </p>
      </div>

      {loading && <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", padding: "1rem 0" }}>Detecting multi-user fraud rings...</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>

        {clusters.map((c) => (
          <div
            key={c.cluster_id}
            style={{
              padding: "1.25rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38bdf8" }}>{c.cluster_id}</span>
              <span className={`badge badge-${c.risk_level.toLowerCase()}`}>{c.risk_level} ({c.suspicion_score}/100)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <div>Users Involved: <strong style={{ color: "white" }}>{c.user_count}</strong></div>
              <div>Transactions: <strong style={{ color: "white" }}>{c.transaction_count}</strong></div>
              <div>Confirmed Fraud Nodes: <strong style={{ color: "#ef4444" }}>{c.fraud_node_count}</strong></div>
              <div>Fraud Density: <strong style={{ color: "white" }}>{roundPct(c.fraud_density)}%</strong></div>
            </div>

            <div style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Shared Resources: </span>
              <span style={{ fontFamily: "var(--font-mono)", color: "#10b981" }}>
                {c.shared_devices.concat(c.shared_ips).slice(0, 2).join(", ") || "Shared Graph Edges"}
              </span>
            </div>

            <button
              onClick={() => onSelectEntity(c.sample_nodes[0])}
              style={{
                background: "rgba(56, 189, 248, 0.1)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "0.4rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600
              }}
            >
              Explore Network Topology
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function roundPct(val: number): number {
  return Math.round((val || 0) * 100);
}
