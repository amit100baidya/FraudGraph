import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Network, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface NetworkExplorerProps {
  entityId: string;
  onNodeSelect?: (nodeId: string, nodeData: any) => void;
}

export const NetworkExplorer: React.FC<NetworkExplorerProps> = ({ entityId, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [layoutName, setLayoutName] = useState<string>("cose");

  useEffect(() => {
    if (!containerRef.current) return;

    fetchSubgraph(entityId);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [entityId, layoutName]);

  const fetchSubgraph = async (targetId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/graph/subgraph/${targetId}?hops=2`);
      const data = await res.json();

      if (cyRef.current) {
        cyRef.current.destroy();
      }

      const cy = cytoscape({
        container: containerRef.current,
        elements: [...(data.nodes || []), ...(data.edges || [])],
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              color: "#f3f4f6",
              "font-size": "10px",
              "font-family": "Inter, sans-serif",
              "text-valign": "bottom",
              "text-margin-y": 5,
              "background-color": (node: any) => {
                const type = node.data("node_type");
                const isFraud = node.data("is_fraud");
                if (isFraud) return "#ef4444";
                if (type === "USER") return "#3b82f6";
                if (type === "DEVICE") return "#10b981";
                if (type === "IP") return "#f59e0b";
                if (type === "CARD") return "#8b5cf6";
                if (type === "TRANSACTION") return "#06b6d4";
                return "#6b7280";
              },
              width: (node: any) => (node.data("is_target") ? 32 : 22),
              height: (node: any) => (node.data("is_target") ? 32 : 22),
              "border-width": (node: any) => (node.data("is_target") ? 3 : 1),
              "border-color": "#ffffff",
              "border-opacity": 0.9
            }
          },
          {
            selector: "edge",
            style: {
              width: 1.5,
              "line-color": "rgba(255, 255, 255, 0.15)",
              "target-arrow-color": "rgba(255, 255, 255, 0.3)",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(relationship)",
              "font-size": "8px",
              color: "#9ca3af",
              "text-rotation": "autorotate"
            }
          },
          {
            selector: ":selected",
            style: {
              "border-width": 3,
              "border-color": "#38bdf8"
            }
          }
        ],
        layout: {
          name: layoutName
        }
      });


      cy.on("tap", "node", (evt) => {
        const node = evt.target;
        const nData = node.data();
        setSelectedNodeData(nData);
        if (onNodeSelect) {
          onNodeSelect(nData.id, nData);
        }
      });

      cyRef.current = cy;
    } catch (err) {
      console.error("Failed to fetch graph subgraph", err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <div className="glass-card" style={{ padding: "1.25rem", height: "600px", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem" }}>
            <Network className="w-5 h-5 text-sky-400" /> Heterogeneous Network Graph
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Inspecting 2-hop entity neighborhood for <code style={{ color: "#38bdf8" }}>{entityId}</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid var(--border-color)", padding: "0.35rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem" }}
          >
            <option value="cose">CoSE Force-Directed</option>
            <option value="circle">Circle</option>
            <option value="concentric">Concentric</option>
            <option value="grid">Grid</option>
          </select>

          <button onClick={handleZoomIn} title="Zoom In" style={{ padding: "0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "white", cursor: "pointer" }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" style={{ padding: "0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "white", cursor: "pointer" }}>
            <ZoomOut size={16} />
          </button>
          <button onClick={handleFit} title="Fit Graph" style={{ padding: "0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "white", cursor: "pointer" }}>
            <Maximize2 size={16} />
          </button>
          <button onClick={() => fetchSubgraph(entityId)} title="Refresh Graph" style={{ padding: "0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "white", cursor: "pointer" }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11, 15, 25, 0.8)", zIndex: 10, borderRadius: "8px" }}>
            <RefreshCw className="animate-spin" size={24} style={{ color: "#38bdf8" }} />
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Selected Node Drawer */}
      {selectedNodeData && (
        <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Selected Node:</span>
            <strong style={{ marginLeft: "0.5rem", fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{selectedNodeData.id}</strong>
            <span style={{ marginLeft: "1rem", fontSize: "0.8rem", color: selectedNodeData.is_fraud ? "#ef4444" : "#10b981" }}>
              Type: {selectedNodeData.node_type} {selectedNodeData.is_fraud ? "(CONFIRMED FRAUD)" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
