import React, { useState } from 'react';
import type { Entity } from '../../types';
import { mockEntities } from '../../mock/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { EntityDrawer } from '../graph/EntityDrawer';
import { Search, ArrowRight } from 'lucide-react';

interface EntitiesPageProps {
  onSelectEntity: (entityId: string) => void;
}

export const EntitiesPage: React.FC<EntitiesPageProps> = ({ onSelectEntity }) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = mockEntities.filter(e =>
    e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Entity Explorer</h1>
          <p className="page-subtitle">
            Account, Device, Merchant & IP identity intelligence ledger
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Account ID, Device, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '30px', width: '100%' }}
          />
        </div>
      </div>

      {/* Analytical Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entity ID</th>
              <th>Name / Label</th>
              <th>Type</th>
              <th>Risk Score</th>
              <th>Fraud Prob.</th>
              <th>Tx Count</th>
              <th>Total Volume</th>
              <th>Connections</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ent) => (
              <tr key={ent.id} onClick={() => setSelectedEntity(ent)}>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {ent.id}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{ent.name}</span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{ent.type}</span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: ent.riskScore > 80 ? 'var(--risk-critical)' : 'var(--risk-medium)' }}>
                    {ent.riskScore}
                  </span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {ent.fraudProbability}%
                  </span>
                </td>
                <td>
                  <span className="num-highlight">{ent.transactionCount}</span>
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700 }}>
                    ₹{(ent.totalVolume / 100000).toFixed(1)}L
                  </span>
                </td>
                <td>
                  <span className="num-highlight">{ent.connectedEntitiesCount}</span>
                </td>
                <td>
                  <StatusBadge type="status" value={ent.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntity(ent.id);
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

      <EntityDrawer
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onOpenWorkspace={onSelectEntity}
      />
    </div>
  );
};
