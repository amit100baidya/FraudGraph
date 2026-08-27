import React, { useState } from 'react';
import type { FraudRing } from '../../types';
import { mockFraudRings } from '../../mock/mockData';
import { FraudRingDetail } from './FraudRingDetail';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, Search } from 'lucide-react';

interface FraudRingsPageProps {
  onSelectEntity: (entityId: string) => void;
}

export const FraudRingsPage: React.FC<FraudRingsPageProps> = ({ onSelectEntity }) => {
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (selectedRing) {
    return (
      <FraudRingDetail
        ring={selectedRing}
        onBack={() => setSelectedRing(null)}
        onSelectEntity={onSelectEntity}
      />
    );
  }

  const filteredRings = mockFraudRings.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.primaryClusterType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Fraud Rings & Network Communities</h1>
          <p className="page-subtitle">
            Sub-graph clustering & community detection for synthetic identity syndicates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>

            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter fraud rings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '30px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Analytical Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ring ID</th>
              <th>Syndicate Name / Pattern</th>
              <th>Entities</th>
              <th>Transactions</th>
              <th>Total Volume</th>
              <th>Risk Score</th>
              <th>Confidence</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRings.map((ring) => (
              <tr key={ring.id} onClick={() => setSelectedRing(ring)}>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {ring.id}
                  </span>
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ring.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ring.primaryClusterType}</div>
                  </div>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 600 }}>{ring.entityCount}</span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 600 }}>{ring.transactionCount}</span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--risk-critical)' }}>
                    ₹{(ring.totalVolume / 100000).toFixed(1)}L
                  </span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--risk-critical)' }}>
                    {ring.riskScore}
                  </span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {ring.confidence}%
                  </span>
                </td>
                <td>
                  <StatusBadge type="status" value={ring.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRing(ring);
                    }}
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
