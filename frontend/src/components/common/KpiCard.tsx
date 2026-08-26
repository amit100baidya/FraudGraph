import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  riskColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  trend,
  trendValue,
  riskColor
}) => {
  return (
    <div className="fintech-card" style={{ padding: '1.15rem' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="num-highlight" style={{ fontSize: '24px', color: riskColor || 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </div>

        {trendValue && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '11px',
            fontWeight: 600,
            color: trend === 'down' ? 'var(--risk-low)' : trend === 'up' ? 'var(--risk-critical)' : 'var(--text-muted)'
          }}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="meta-text" style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
        {subtext}
      </div>
    </div>
  );
};
