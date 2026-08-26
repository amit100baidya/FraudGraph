import React from 'react';
import type { RiskLevel, InvestigationStatus } from '../../types';

interface StatusBadgeProps {
  type: 'risk' | 'status';
  value: RiskLevel | InvestigationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const valUpper = value.toUpperCase();

  let className = 'status-badge ';
  if (type === 'risk') {
    switch (valUpper) {
      case 'CRITICAL': className += 'badge-critical'; break;
      case 'HIGH': className += 'badge-high'; break;
      case 'MEDIUM': className += 'badge-medium'; break;
      case 'LOW': className += 'badge-low'; break;
      default: className += 'badge-reviewed'; break;
    }
  } else {
    switch (valUpper) {
      case 'INVESTIGATING': className += 'badge-investigating'; break;
      case 'NEW': className += 'badge-new'; break;
      case 'REVIEWED': className += 'badge-reviewed'; break;
      case 'CONFIRMED': className += 'badge-confirmed'; break;
      default: className += 'badge-reviewed'; break;
    }
  }

  const padding = size === 'md' ? '4px 10px' : '2px 8px';
  const fontSize = size === 'md' ? '12px' : '11px';

  return (
    <span className={className} style={{ padding, fontSize }}>
      {valUpper}
    </span>
  );
};
