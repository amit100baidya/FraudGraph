import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Network, 
  Layers, 
  ListFilter, 
  UserCheck, 
  Bell, 
  BarChart3, 
  Settings,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, apiConnected = true }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'investigations', label: 'Investigations', icon: FileText },
    { id: 'graph', label: 'Transaction Network', icon: Network },
    { id: 'rings', label: 'Fraud Rings', icon: Layers },
    { id: 'transactions', label: 'Transactions', icon: ListFilter },
    { id: 'entities', label: 'Entities', icon: UserCheck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 3 },
    { id: 'analytics', label: 'Model Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar-desktop">
      {/* Brand Header */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              FRAUDGRAPH
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              Graph Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.55rem 0.75rem',
                margin: '2px 0',
                borderRadius: '6px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: item.id === 'alerts' ? 'var(--risk-critical-bg)' : 'var(--bg-subtle)',
                  color: item.id === 'alerts' ? 'var(--risk-critical)' : 'var(--text-muted)',
                  border: item.id === 'alerts' ? '1px solid var(--risk-critical-border)' : '1px solid var(--border-color)',
                  borderRadius: '9999px',
                  padding: '1px 6px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Analyst Profile */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '11px', fontWeight: 500 }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: apiConnected ? '#16A34A' : '#D97706',
            display: 'inline-block'
          }} />
          <span style={{ color: 'var(--text-muted)' }}>
            {apiConnected ? 'System Operational' : 'Mock Mode Active'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600
          }}>
            AV
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Alex Vance
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Senior Fraud Analyst
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
