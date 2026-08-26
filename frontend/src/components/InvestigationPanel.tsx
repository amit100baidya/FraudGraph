import React, { useEffect, useState } from "react";
import { Cpu, Activity, FileText } from "lucide-react";


interface InvestigationPanelProps {
  transactionId: string;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({ transactionId }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (transactionId) {
      fetchReport(transactionId);
    }
  }, [transactionId]);

  const fetchReport = async (txId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/investigations/report/${txId}`, {
        method: "POST"
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch investigation report", err);
    } finally {
      setLoading(false);
    }
  };

  if (!transactionId) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
        <FileText size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
        <h3>Select a Transaction to Investigate</h3>
        <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Choose any transaction from the stream or network explorer to generate a deep AI evidence report.
        </p>
      </div>
    );
  }

  if (loading || !reportData) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
        <Activity className="animate-spin" size={32} style={{ margin: "0 auto 1rem", color: "#38bdf8" }} />
        <p>Synthesizing Evidence Object & Executing AI Fraud Analyst Reasoning...</p>
      </div>
    );
  }

  const { evidence_object, report_markdown } = reportData;
  const riskAssessment = evidence_object?.risk_assessment || {};

  const score = riskAssessment.final_risk_score || 0;
  const level = riskAssessment.risk_level || "LOW";
  const action = riskAssessment.recommended_action || "APPROVE";
  const breakdown = riskAssessment.score_breakdown || {};
  const drivers = evidence_object?.top_risk_drivers || [];





  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      {/* Left Column: Risk Fusion & Evidence Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Composite Score Card */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Composite Risk Score</span>
            <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: level === "CRITICAL" ? "#ef4444" : level === "HIGH" ? "#f97316" : "#10b981" }}>
              {score}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>/ 100</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Recommended Defense Action:</span>
            <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{action}</strong>
          </div>
        </div>

        {/* Risk Fusion Breakdown */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Cpu size={16} style={{ color: "#38bdf8" }} /> Multi-Factor Risk Fusion Breakdown
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span>Supervised ML Score (50% Wt)</span>
                <strong>{breakdown.ml_risk_score}/100</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px" }}>
                <div style={{ height: "100%", width: `${breakdown.ml_risk_score}%`, background: "#3b82f6", borderRadius: "999px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span>Graph Intelligence Score (35% Wt)</span>
                <strong>{breakdown.graph_risk_score}/100</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px" }}>
                <div style={{ height: "100%", width: `${breakdown.graph_risk_score}%`, background: "#10b981", borderRadius: "999px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span>Behavioral Velocity Score (15% Wt)</span>
                <strong>{breakdown.behavioral_risk_score}/100</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px" }}>
                <div style={{ height: "100%", width: `${breakdown.behavioral_risk_score}%`, background: "#f59e0b", borderRadius: "999px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* SHAP Top Risk Drivers */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>SHAP Feature Attributions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {drivers.map((d: any, idx: number) => (
              <div key={idx} style={{ padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "6px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <code style={{ color: "#38bdf8" }}>{d.feature}</code>
                <span style={{ color: d.shap_value > 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                  SHAP: {d.shap_value > 0 ? `+${d.shap_value}` : d.shap_value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: AI Executive Report */}
      <div className="glass-card" style={{ padding: "1.5rem", overflowY: "auto", maxHeight: "650px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={18} style={{ color: "#38bdf8" }} /> Executive AI Investigation Report
        </h3>
        <div
          style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", lineHeight: 1.6, fontSize: "0.88rem", color: "#e5e7eb" }}
          dangerouslySetInnerHTML={{ __html: report_markdown.replace(/\n/g, "<br/>") }}
        />
      </div>
    </div>
  );
};
