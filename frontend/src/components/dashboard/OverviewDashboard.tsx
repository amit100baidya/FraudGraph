import React, { useState } from 'react';
import type { OverviewAnalytics } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowUpRight } from 'lucide-react';

interface OverviewDashboardProps {
  analytics: OverviewAnalytics;
  onSelectInvestigation: (entityId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  analytics,
  onSelectInvestigation
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const maxTotal = Math.max(
    ...analytics.riskActivitySeries.map(p => p.legitimateCount + p.suspiciousCount + p.confirmedFraudCount)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Fraud Intelligence</h1>
        <p className="page-subtitle">
          26 August 2026 · Real-time risk monitoring & threat telemetry
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <KpiCard
          title="Amount at Risk"
          value={`₹${(analytics.amountAtRisk / 1000000).toFixed(2)}M`}
          subtext="+14.2% increase from yesterday"
          trend="up"
          trendValue="+14.2%"
          riskColor="var(--risk-critical)"
        />

        <KpiCard
          title="High-Risk Entities"
          value={analytics.highRiskEntities.toString()}
          subtext="27 requiring immediate review"
          trend="up"
          trendValue="+8"
          riskColor="var(--risk-high)"
        />

        <KpiCard
          title="Active Investigations"
          value={analytics.activeInvestigations.toString()}
          subtext="12 critical priority cases"
          trend="neutral"
          trendValue="Stable"
        />

        <KpiCard
          title="Fraud Rate"
          value={`${analytics.fraudRate}%`}
          subtext="Target threshold < 3.0%"
          trend="down"
          trendValue="-0.3%"
          riskColor="var(--risk-low)"
        />
      </div>

      {/* Main Grid: Risk Activity Chart (Left 1.4fr) + Priority Investigations Queue (Right 1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Risk Activity Chart */}
        <div className="fintech-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 className="section-title">Risk Activity</h3>
              <p className="meta-text">24-hour transaction risk category distribution</p>
            </div>
            
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '11px', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94A3B8' }} />
                <span>Legitimate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#D97706' }} />
                <span>Suspicious</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#DC2626' }} />
                <span>Confirmed Fraud</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '20px', paddingBottom: '24px' }}>
            {analytics.riskActivitySeries.map((pt, idx) => {
              const total = pt.legitimateCount + pt.suspiciousCount + pt.confirmedFraudCount;
              const heightPct = (total / maxTotal) * 100;
              const legPct = (pt.legitimateCount / total) * 100;
              const suspPct = (pt.suspiciousCount / total) * 100;
              const fraudPct = (pt.confirmedFraudCount / total) * 100;
              const isHovered = hoveredPoint === idx;

              return (
                <div
                  key={pt.timestamp}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  {/* Tooltip Popup */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: '105%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--text-primary)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      <div style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '3px', marginBottom: '4px' }}>
                        Time: {pt.timestamp}
                      </div>
                      <div>Total Scanned: <span className="num-highlight">{total.toLocaleString()}</span></div>
                      <div style={{ color: '#FCA5A5' }}>Fraud: <span className="num-highlight">{pt.confirmedFraudCount}</span></div>
                      <div style={{ color: '#FDE68A' }}>Suspicious: <span className="num-highlight">{pt.suspiciousCount}</span></div>
                      <div style={{ color: '#93C5FD' }}>Exposure: <span className="num-highlight">₹{(pt.amountAtRisk / 1000).toFixed(0)}k</span></div>
                    </div>
                  )}

                  {/* Stacked Bar */}
                  <div style={{
                    height: `${heightPct}%`,
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    opacity: hoveredPoint !== null && !isHovered ? 0.4 : 1,
                    transition: 'all 150ms ease'
                  }}>
                    {/* Legitimate Segment */}
                    <div style={{ height: `${legPct}%`, background: '#CBD5E1' }} />
                    {/* Suspicious Segment */}
                    <div style={{ height: `${suspPct}%`, background: '#D97706' }} />
                    {/* Confirmed Fraud Segment */}
                    <div style={{ height: `${fraudPct}%`, background: '#DC2626' }} />
                  </div>

                  {/* Timestamp Axis Label */}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: '6px',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isHovered ? 600 : 400
                  }}>
                    {pt.timestamp}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '0.75rem', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>* Time-series data synced with graph anomaly streaming engine</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Live Stream Active</span>
          </div>
        </div>

        {/* Priority Investigations Queue */}
        <div className="fintech-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 className="section-title">Priority Investigations</h3>
              <p className="meta-text">Requires immediate analyst action</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)', padding: '2px 6px', borderRadius: '4px' }}>
              {analytics.priorityInvestigations.length} Queue
            </span>
          </div>

          {/* Investigation Queue List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analytics.priorityInvestigations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectInvestigation(inv.entityId)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-border)';
                  e.currentTarget.style.background = 'var(--accent-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge type="risk" value={inv.riskLevel} />
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {inv.entityId}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {inv.primaryReason}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="num-highlight" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--risk-critical)' }}>
                    {inv.riskScore}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    {inv.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => onSelectInvestigation('A10294')}
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
            >
              Open Active Workspace <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
