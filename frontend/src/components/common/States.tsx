import React from 'react';
import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  height?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Calculating risk intelligence...',
  height = '300px'
}) => {
  return (
    <div style={{
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '2rem'
    }}>
      <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent-primary)' }} />
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {message}
      </span>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  height?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active investigations',
  description = 'Your investigation queue is clear for the selected period.',
  actionText,
  onAction,
  height = '240px'
}) => {
  return (
    <div style={{
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'var(--bg-surface)',
      border: '1px border-dashed var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <Inbox size={28} style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }} />
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '380px' }}>
        {description}
      </div>
      {actionText && onAction && (
        <button className="btn-secondary" onClick={onAction} style={{ marginTop: '0.75rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  reason?: string;
  onRetry?: () => void;
  height?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load transaction network',
  reason = 'Graph service temporarily unavailable or request timed out.',
  onRetry,
  height = '240px'
}) => {
  return (
    <div style={{
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'var(--risk-critical-bg)',
      border: '1px solid var(--risk-critical-border)',
      borderRadius: 'var(--radius-md)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <AlertTriangle size={26} style={{ color: 'var(--risk-critical)', marginBottom: '4px' }} />
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--risk-critical)' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
        Reason: {reason}
      </div>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry} style={{ marginTop: '0.75rem', gap: '6px' }}>
          <RefreshCw size={14} /> Retry Request
        </button>
      )}
    </div>
  );
};
