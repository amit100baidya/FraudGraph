import React, { useState } from 'react';
import type { Transaction } from '../../types';
import { mockTransactions } from '../../mock/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { TransactionDrawer } from './TransactionDrawer';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionExplorerProps {
  onSelectTransaction?: (txId: string) => void;
  onSelectEntity?: (entityId: string) => void;
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({
  onSelectEntity
}) => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Filter transactions
  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiverId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === 'ALL' || t.riskLevel === riskFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchesSearch && matchesRisk && matchesType;
  });

  const handleExportCSV = () => {
    const headers = ['TransactionID,Sender,Receiver,Amount,Type,Timestamp,FraudProb,RiskLevel,Status\n'];
    const rows = filtered.map(t => `${t.id},${t.senderId},${t.receiverId},${t.amount},${t.type},${t.timestamp},${t.fraudProbability}%,${t.riskLevel},${t.status}`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraudgraph_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Transaction Explorer</h1>
          <p className="page-subtitle">
            Real-time transaction audit ledger & risk probability scoring
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search TXN or Account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '30px', width: '100%' }}
            />
          </div>

          {/* Risk Filter */}
          <select
            className="input-field"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Type Filter */}
          <select
            className="input-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="TRANSFER">Transfer</option>
            <option value="PAYMENT">Payment</option>
            <option value="CASH_OUT">Cash Out</option>
            <option value="DEPOSIT">Deposit</option>
          </select>

          {/* Export CSV */}
          <button className="btn-secondary" onClick={handleExportCSV} title="Export CSV Ledger">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Timestamp</th>
              <th>Fraud Prob.</th>
              <th>Risk Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No matching transactions were found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} onClick={() => setSelectedTx(t)}>
                  <td>
                    <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {t.id}
                    </span>
                  </td>
                  <td>
                    <span className="num-highlight" style={{ fontWeight: 500 }}>{t.senderId}</span>
                  </td>
                  <td>
                    <span className="num-highlight" style={{ fontWeight: 500 }}>{t.receiverId}</span>
                  </td>
                  <td>
                    <span className="num-highlight" style={{ fontWeight: 700, color: t.amount > 50000 ? 'var(--risk-critical)' : 'var(--text-primary)' }}>
                      ₹{t.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.type}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {t.timestamp}
                  </td>
                  <td>
                    <span className="num-highlight" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {t.fraudProbability}%
                    </span>
                  </td>
                  <td>
                    <StatusBadge type="risk" value={t.riskLevel} />
                  </td>
                  <td>
                    <StatusBadge type="status" value={t.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div>Showing <strong>{filtered.length}</strong> of <strong>{transactions.length}</strong> transactions</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn-icon" disabled><ChevronLeft size={14} /></button>
          <button className="btn-icon" disabled><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onSelectEntity={onSelectEntity}
      />
    </div>
  );
};
