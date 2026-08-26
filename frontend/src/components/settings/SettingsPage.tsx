import React, { useState } from 'react';
import { Server, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  health: { status: string; service: string; version: string } | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health }) => {
  const [riskThreshold, setRiskThreshold] = useState<number>(85);
  const [autoFreeze, setAutoFreeze] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Engine & Security Settings</h1>
        <p className="page-subtitle">
          Configure detection thresholds, API endpoints, and analyst permissions
        </p>
      </div>

      {/* Backend API Connection Health */}
      <div className="fintech-card" style={{ padding: '1.25rem' }}>
        <h3 className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} style={{ color: 'var(--accent-primary)' }} /> FastAPI Backend Service Status
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Endpoint: http://localhost:8000</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {health ? `Connected · Version ${health.version}` : 'Offline · Running in Client-Side Mock Mode'}
            </div>
          </div>

          <span className={`status-badge ${health ? 'badge-low' : 'badge-medium'}`}>
            {health ? 'OPERATIONAL' : 'MOCK FALLBACK'}
          </span>
        </div>
      </div>

      {/* Fraud Threshold Config */}
      <div className="fintech-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 className="section-title">Detection Sensitivity Thresholds</h3>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '0.4rem' }}>
            <span>Critical Alert Score Cutoff:</span>
            <strong className="num-highlight" style={{ color: 'var(--risk-critical)' }}>{riskThreshold} / 100</strong>
          </div>
          <input
            type="range"
            min="50"
            max="98"
            value={riskThreshold}
            onChange={(e) => setRiskThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>50 (High Sensitivity)</span>
            <span>98 (Low False Positive)</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Automated High-Risk Freeze</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically place hold on accounts scoring &gt; 95</div>
          </div>
          <input
            type="checkbox"
            checked={autoFreeze}
            onChange={(e) => setAutoFreeze(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
          />
        </div>

        {/* Save Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn-primary" onClick={handleSave}>
            Save Configuration Settings
          </button>
          {savedFeedback && (
            <span style={{ fontSize: '12px', color: 'var(--risk-low)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Saved Successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
