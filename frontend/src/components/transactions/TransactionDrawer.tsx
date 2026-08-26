import React from 'react';
import type { Transaction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { X, ArrowRight } from 'lucide-react';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSelectEntity?: (entityId: string) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onSelectEntity
}) => {
  if (!transaction) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-hover)'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transaction Inspection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {transaction.id}
              </span>
              <StatusBadge type="risk" value={transaction.riskLevel} />
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Amount Card */}
          <div style={{ padding: '1rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction Amount</div>
            <div className="num-highlight" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--risk-critical)', marginTop: '2px' }}>
              ₹{transaction.amount.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Type: <strong>{transaction.type}</strong> · {transaction.timestamp}
            </div>
          </div>

          {/* Sender / Receiver Transfer Link */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sender Account</div>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (onSelectEntity) onSelectEntity(transaction.senderId);
                  onClose();
                }}
                style={{ padding: '4px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}
              >
                {transaction.senderId}
              </button>
            </div>

            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Receiver Account</div>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (onSelectEntity) onSelectEntity(transaction.receiverId);
                  onClose();
                }}
                style={{ padding: '4px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}
              >
                {transaction.receiverId}
              </button>
            </div>
          </div>

          {/* Evidence Analysis */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Multimodal Risk Signals
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '2px' }}>ML GNN Probability</div>
                <div>Fraud Score: <strong className="num-highlight">{transaction.fraudProbability}%</strong> (Model v2.4.1)</div>
              </div>

              {transaction.evidenceSummary?.behavioralFlags && (
                <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--risk-high)', marginBottom: '2px' }}>Behavioral Anomaly Signals</div>
                  <div>{transaction.evidenceSummary.behavioralFlags.join(' · ')}</div>
                </div>
              )}

              {transaction.evidenceSummary?.graphFlags && (
                <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--risk-critical)', marginBottom: '2px' }}>Graph Topology Flags</div>
                  <div>{transaction.evidenceSummary.graphFlags.join(' · ')}</div>
                </div>
              )}
            </div>
          </div>

          {/* Network Details */}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            {transaction.ipAddress && <div>IP Address: <strong style={{ color: 'var(--text-primary)' }}>{transaction.ipAddress}</strong></div>}
            {transaction.deviceId && <div>Device Fingerprint: <strong style={{ color: 'var(--text-primary)' }}>{transaction.deviceId}</strong></div>}
            {transaction.location && <div>Location Geo: <strong style={{ color: 'var(--text-primary)' }}>{transaction.location}</strong></div>}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-hover)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            className="btn-primary"
            onClick={() => {
              if (onSelectEntity) onSelectEntity(transaction.senderId);
              onClose();
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Investigate Sender <ArrowRight size={14} />
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
