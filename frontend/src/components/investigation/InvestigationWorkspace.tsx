import React, { useState, useEffect } from 'react';
import type { Entity, NetworkGraphData, EvidenceItem } from '../../types';
import { mockTargetEntity, mockGraphData, mockEvidenceItems } from '../../mock/mockData';
import { GraphCanvas } from '../graph/GraphCanvas';
import { EvidenceList } from './EvidenceList';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

interface InvestigationWorkspaceProps {
  entityId: string;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({ entityId }) => {
  const [entity, setEntity] = useState<Entity>(mockTargetEntity);
  const [graphData] = useState<NetworkGraphData>(mockGraphData);
  const [evidenceItems] = useState<EvidenceItem[]>(mockEvidenceItems);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (entityId && entityId !== entity.id) {
      setEntity({ ...mockTargetEntity, id: entityId });
    }
  }, [entityId, entity.id]);

  const handleAction = (actionName: string) => {
    setActionFeedback(`Executed: ${actionName} for account ${entity.id}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Workspace Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">Investigation Workspace</h1>
            <StatusBadge type="risk" value={entity.riskLevel} size="md" />
            <StatusBadge type="status" value={entity.status} size="md" />
          </div>
          <p className="page-subtitle">
            Case #INV-1842 · Deep-dive evidence tracing & graph relationship analysis
          </p>
        </div>

        {/* Action Alert Banner */}
        {actionFeedback && (
          <div style={{
            background: 'var(--risk-low-bg)',
            border: '1px solid var(--risk-low-border)',
            color: 'var(--risk-low)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle size={14} />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* 3-Column Desktop Grid Layout / 1-Column Mobile Layout */}
      <div className="investigation-grid" style={{ display: 'grid', gridTemplateColumns: '270px 1fr 340px', gap: '1rem', alignItems: 'start' }}>

        
        {/* COLUMN 1: LEFT — ENTITY PROFILE */}
        <div className="fintech-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Entity Profile
            </div>
            <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {entity.id}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entity.name}</div>
          </div>

          {/* KPI Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: '6px', padding: '0.6rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Risk Score</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--risk-critical)' }}>
                {entity.riskScore} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '6px', padding: '0.6rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fraud Prob.</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {entity.fraudProbability}%
              </div>
            </div>
          </div>

          {/* Telemetry Numbers */}
          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transactions:</span>
              <strong className="num-highlight">{entity.transactionCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Volume:</span>
              <strong className="num-highlight">₹{(entity.totalVolume / 100000).toFixed(2)}L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connections:</span>
              <strong className="num-highlight">{entity.connectedEntitiesCount}</strong>
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Risk Factors
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {entity.riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <AlertTriangle size={12} style={{ color: 'var(--risk-high)', flexShrink: 0 }} />
                  <span>{rf}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER — INVESTIGATION GRAPH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <GraphCanvas
            graphData={graphData}
            height="620px"
            selectedNodeId={entity.id}
            highlightNodeIds={selectedEvidence ? selectedEvidence.highlightNodeIds : []}
            highlightEdgeIds={selectedEvidence ? selectedEvidence.highlightEdgeIds : []}
          />
          {selectedEvidence && (
            <div style={{
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Filtering Graph by Evidence: <strong>{selectedEvidence.title}</strong></span>
              <button
                className="btn-secondary"
                onClick={() => setSelectedEvidence(null)}
                style={{ padding: '2px 8px', fontSize: '10px' }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* COLUMN 3: RIGHT — RISK INTELLIGENCE & EVIDENCE SYSTEM */}
        <div className="fintech-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Risk Assessment */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Assessment
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '2px' }}>
              <div className="num-highlight" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--risk-critical)', letterSpacing: '-0.02em' }}>
                97 <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
              </div>
              <StatusBadge type="risk" value="CRITICAL" size="md" />
            </div>
          </div>

          {/* Interactive Evidence Breakdown */}
          <EvidenceList
            evidenceItems={evidenceItems}
            selectedEvidenceId={selectedEvidence?.id || null}
            onSelectEvidence={(item) => setSelectedEvidence(item)}
          />

          {/* Recommended Analyst Actions */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended Actions
            </div>

            <button
              className="btn-primary"
              onClick={() => handleAction('Account Freeze')}
              style={{ background: 'var(--risk-critical)', borderColor: 'var(--risk-critical)', justifyContent: 'center' }}
            >
              <Lock size={14} /> Freeze Account {entity.id}
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleAction('Escalate Case')}
              style={{ justifyContent: 'center' }}
            >
              <ShieldAlert size={14} /> Escalate to Risk Ops
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleAction('Mark Reviewed')}
              style={{ justifyContent: 'center' }}
            >
              <CheckCircle size={14} /> Mark Reviewed / Safe
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
