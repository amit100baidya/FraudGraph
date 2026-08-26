import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, Layers } from 'lucide-react';

interface GraphToolbarProps {
  layoutName: string;
  setLayoutName: (val: string) => void;
  suspiciousOnly: boolean;
  setSuspiciousOnly: (val: boolean) => void;
  selectedRiskFilter: string;
  setSelectedRiskFilter: (val: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  layoutName,
  setLayoutName,
  suspiciousOnly,
  setSuspiciousOnly,
  selectedRiskFilter,
  setSelectedRiskFilter,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.6rem 1rem',
      background: 'var(--bg-hover)',
      borderBottom: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      {/* Left Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <span>Filters:</span>
        </div>

        {/* Risk Level Filter */}
        <select
          className="input-field"
          value={selectedRiskFilter}
          onChange={(e) => setSelectedRiskFilter(e.target.value)}
          style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 500 }}
        >
          <option value="ALL">All Risk Levels</option>
          <option value="CRITICAL">Critical Risk Only</option>
          <option value="HIGH">High Risk & Above</option>
          <option value="MEDIUM">Medium Risk & Above</option>
        </select>

        {/* Layout Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={13} style={{ color: 'var(--text-muted)' }} />
          <select
            className="input-field"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 500 }}
          >
            <option value="cose">CoSE Force Layout</option>
            <option value="circle">Circular Network</option>
            <option value="concentric">Concentric Topology</option>
            <option value="grid">Grid Array</option>
          </select>
        </div>

        {/* Suspicious Only Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={suspiciousOnly}
            onChange={(e) => setSuspiciousOnly(e.target.checked)}
            style={{ accentColor: 'var(--risk-critical)' }}
          />
          <span style={{ fontWeight: suspiciousOnly ? 600 : 400, color: suspiciousOnly ? 'var(--risk-critical)' : 'var(--text-secondary)' }}>
            Suspicious Paths Only
          </span>
        </label>
      </div>

      {/* Right Graph Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button className="btn-icon" onClick={onZoomIn} title="Zoom In">
          <ZoomIn size={15} />
        </button>
        <button className="btn-icon" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut size={15} />
        </button>
        <button className="btn-icon" onClick={onFit} title="Fit to View">
          <Maximize2 size={15} />
        </button>
        <button className="btn-icon" onClick={onReset} title="Reset Graph Layout">
          <RefreshCw size={15} />
        </button>
      </div>
    </div>
  );
};
