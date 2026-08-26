import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronRight, UserCheck } from 'lucide-react';
import { mockTransactions, mockEntities } from '../../mock/mockData';

interface TopBarProps {
  activeTab: string;
  onSelectEntity?: (entityId: string) => void;
  onSelectTransaction?: (txId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onSelectEntity, onSelectTransaction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Overview / Real-Time Fraud Intelligence';
      case 'investigations': return 'Investigations / Case #INV-1842 (Account A10294)';
      case 'graph': return 'Transaction Network / Heterogeneous Entity Neighborhood';
      case 'rings': return 'Fraud Rings / Network Communities Discovery';
      case 'transactions': return 'Transactions / Transaction Explorer & Ledger';
      case 'entities': return 'Entities / Account & Identity Intelligence';
      case 'alerts': return 'Alerts / Active Threat & Risk Queue';
      case 'analytics': return 'Model Analytics / Model Ablation & Performance';
      case 'settings': return 'Settings / Engine Configuration';
      default: return 'Overview / Dashboard';
    }
  };

  // Filter search results
  const filteredEntities = searchQuery.trim()
    ? mockEntities.filter(e => e.id.toLowerCase().includes(searchQuery.toLowerCase()) || e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredTxns = searchQuery.trim()
    ? mockTransactions.filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.senderId.toLowerCase().includes(searchQuery.toLowerCase()) || t.receiverId.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasResults = filteredEntities.length > 0 || filteredTxns.length > 0;

  return (
    <header className="topbar-container">
      {/* Left: Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px', color: 'var(--text-muted)' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FraudGraph</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-secondary)' }}>{getBreadcrumb()}</span>
      </div>

      {/* Center: Global Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-app)',
          border: isSearchFocused ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '5px 10px',
          boxShadow: isSearchFocused ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'all 150ms ease'
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search transaction, account, entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '12px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            padding: '0.5rem',
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {!hasResults && (
              <div style={{ padding: '0.75rem', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No matching transactions or entities found for "{searchQuery}"
              </div>
            )}

            {filteredEntities.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '4px 8px' }}>
                  Entities ({filteredEntities.length})
                </div>
                {filteredEntities.map(e => (
                  <div
                    key={e.id}
                    onClick={() => {
                      if (onSelectEntity) onSelectEntity(e.id);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={13} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({e.name})</span>
                    </div>
                    <span className={`status-badge badge-${e.riskLevel.toLowerCase()}`}>
                      Risk {e.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredTxns.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '4px 8px' }}>
                  Transactions ({filteredTxns.length})
                </div>
                {filteredTxns.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (onSelectTransaction) onSelectTransaction(t.id);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{t.id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{t.amount.toLocaleString()}</span>
                    </div>
                    <span className={`status-badge badge-${t.riskLevel.toLowerCase()}`}>
                      {t.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Date Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          background: 'var(--bg-app)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)'
        }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span>26 August 2026</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="btn-icon"
          title="Alert Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--risk-critical)'
          }} />
        </button>

        {/* Analyst Profile Badge */}
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-color)'
        }}>
          Risk Ops
        </div>
      </div>
    </header>
  );
};
