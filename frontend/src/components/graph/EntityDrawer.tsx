import React from 'react';
import type { Entity } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';

interface EntityDrawerProps {
  entity: Entity | null;
  onClose: () => void;
  onOpenWorkspace?: (entityId: string) => void;
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  entity,
  onClose,
  onOpenWorkspace
}) => {
  if (!entity) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-hover)'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Entity Inspection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {entity.id}
              </span>
              <StatusBadge type="risk" value={entity.riskLevel} />
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Risk Metrics Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Risk Score</div>
              <div className="num-highlight" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--risk-critical)' }}>
                {entity.riskScore} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Fraud Probability</div>
              <div className="num-highlight" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {entity.fraudProbability}%
              </div>
            </div>
          </div>

          {/* Key Activity Telemetry */}
          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Entity Telemetry & Volume
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Transactions</div>
                <div className="num-highlight" style={{ fontSize: '15px', fontWeight: 600 }}>{entity.transactionCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Volume</div>
                <div className="num-highlight" style={{ fontSize: '15px', fontWeight: 600 }}>₹{(entity.totalVolume / 100000).toFixed(2)}L</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Connections</div>
                <div className="num-highlight" style={{ fontSize: '15px', fontWeight: 600 }}>{entity.connectedEntitiesCount}</div>
              </div>
            </div>
          </div>

          {/* Risk Factors List */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Detected Risk Factors ({entity.riskFactors.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {entity.riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <AlertTriangle size={14} style={{ color: 'var(--risk-high)', flexShrink: 0 }} />
                  <span>{rf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata info */}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <div>Entity Type: <strong style={{ color: 'var(--text-primary)' }}>{entity.type}</strong></div>
            <div>First Seen: <strong>{entity.createdAt}</strong></div>
            <div>Last Active: <strong>{entity.lastActive}</strong></div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-hover)',
          display: 'flex',
          gap: '0.75rem'
        }}>
          {onOpenWorkspace && (
            <button
              className="btn-primary"
              onClick={() => {
                onOpenWorkspace(entity.id);
                onClose();
              }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Open Full Investigation <ArrowRight size={14} />
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
