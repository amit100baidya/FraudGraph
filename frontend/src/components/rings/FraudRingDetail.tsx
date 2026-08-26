import React from 'react';
import type { FraudRing } from '../../types';
import { GraphCanvas } from '../graph/GraphCanvas';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface FraudRingDetailProps {
  ring: FraudRing;
  onBack: () => void;
  onSelectEntity: (entityId: string) => void;
}

export const FraudRingDetail: React.FC<FraudRingDetailProps> = ({ ring, onBack, onSelectEntity }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={onBack} title="Back to Fraud Rings">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 className="page-title">{ring.name} ({ring.id})</h1>
              <StatusBadge type="risk" value="CRITICAL" size="md" />
              <StatusBadge type="status" value={ring.status} size="md" />
            </div>
            <p className="page-subtitle">
              Detected on {ring.createdAt} · {ring.primaryClusterType}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Community Risk Score</div>
            <div className="num-highlight" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--risk-critical)' }}>
              {ring.riskScore} <span style={{ fontSize: '12px', fontWeight: 400 }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GNN Confidence</div>
            <div className="num-highlight" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {ring.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Left (Ring summary), Center (Interactive Graph), Right (Evidence) */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEFT: RING SUMMARY */}
        <div className="fintech-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="section-title">Ring Metrics Summary</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Entities</div>
              <div className="num-highlight" style={{ fontSize: '16px', fontWeight: 700 }}>{ring.entityCount}</div>
            </div>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Transactions</div>
              <div className="num-highlight" style={{ fontSize: '16px', fontWeight: 700 }}>{ring.transactionCount}</div>
            </div>
          </div>

          <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Transaction Volume</div>
            <div className="num-highlight" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--risk-critical)' }}>
              ₹{(ring.totalVolume / 100000).toFixed(2)} Lakhs
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Key Entities in Ring ({ring.entities.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {ring.entities.map(ent => (
                <button
                  key={ent}
                  className="btn-secondary"
                  onClick={() => onSelectEntity(ent)}
                  style={{ padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                >
                  {ent}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: LARGE INTERACTIVE GRAPH */}
        <div>
          <GraphCanvas
            graphData={ring.graphData}
            height="580px"
            onNodeClick={(nodeId) => onSelectEntity(nodeId)}
          />
        </div>

        {/* RIGHT: EVIDENCE BREAKDOWN */}
        <div className="fintech-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="section-title">Community Evidence</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ring.keyEvidence.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  color: 'var(--text-primary)'
                }}
              >
                <AlertTriangle size={14} style={{ color: 'var(--risk-critical)', flexShrink: 0, marginTop: '2px' }} />
                <span>{ev}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn-primary"
              onClick={() => onSelectEntity(ring.entities[0] || 'A10294')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Investigate Primary Node ({ring.entities[0]})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
