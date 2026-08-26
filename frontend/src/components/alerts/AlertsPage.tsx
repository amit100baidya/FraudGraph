import React, { useState } from 'react';
import type { Alert } from '../../types';
import { mockAlerts } from '../../mock/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, Check, X } from 'lucide-react';

interface AlertsPageProps {
  onSelectEntity: (entityId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectEntity }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filtered = alerts.filter(a => riskFilter === 'ALL' || a.riskLevel === riskFilter);

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleMarkReviewed = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'REVIEWED' } : a));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Threat & Risk Alerts Queue</h1>
          <p className="page-subtitle">
            Real-time automated threat detections requiring analyst triage
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="input-field"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Alert Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Analytical Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Risk Level</th>
              <th>Entity ID</th>
              <th>Trigger Reason</th>
              <th>Created</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((al) => (
              <tr key={al.id}>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--risk-critical)' }}>
                    {al.id}
                  </span>
                </td>
                <td>
                  <StatusBadge type="risk" value={al.riskLevel} />
                </td>
                <td>
                  <span className="num-highlight" style={{ fontWeight: 600 }}>{al.entityId}</span>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{al.reason}</span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{al.createdAt}</span>
                </td>
                <td>
                  <StatusBadge type="status" value={al.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-primary"
                      onClick={() => onSelectEntity(al.entityId)}
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      Investigate <ArrowRight size={12} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleMarkReviewed(al.id)}
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      title="Mark Reviewed"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDismiss(al.id)}
                      style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--risk-critical)' }}
                      title="Dismiss Alert"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
