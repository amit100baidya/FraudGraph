import React from 'react';
import type { EvidenceItem } from '../../types';
import { AlertCircle, ShieldAlert, Zap, TrendingUp, Network } from 'lucide-react';

interface EvidenceListProps {
  evidenceItems: EvidenceItem[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (item: EvidenceItem | null) => void;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidenceItems,
  selectedEvidenceId,
  onSelectEvidence
}) => {
  const getIcon = (code: string) => {
    switch (code) {
      case 'network': return <Network size={16} style={{ color: 'var(--accent-primary)' }} />;
      case 'velocity': return <Zap size={16} style={{ color: 'var(--risk-high)' }} />;
      case 'amount': return <TrendingUp size={16} style={{ color: 'var(--risk-medium)' }} />;
      case 'relationship': return <ShieldAlert size={16} style={{ color: 'var(--risk-critical)' }} />;
      default: return <AlertCircle size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        WHY FLAGGED (CLICK TO INSPECT EVIDENCE)
      </div>

      {evidenceItems.map((item, idx) => {
        const isSelected = selectedEvidenceId === item.id;
        const numberLabel = `0${idx + 1}`;

        return (
          <div
            key={item.id}
            onClick={() => onSelectEvidence(isSelected ? null : item)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
              boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="num-highlight" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {numberLabel}
                </span>
                {getIcon(item.code)}
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {item.title}
                </span>
              </div>

              <span className={`status-badge badge-${item.severity.toLowerCase()}`}>
                {item.severity}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              {item.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>Risk Impact: <strong style={{ color: 'var(--risk-critical)' }}>+{item.impactScore} pts</strong></span>
              <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)', fontWeight: isSelected ? 600 : 400 }}>
                {isSelected ? '● Highlighting Graph' : 'Click to highlight'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
