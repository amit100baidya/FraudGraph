import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { OverviewAnalytics } from './types';
import { mockOverviewAnalytics, mockGraphData } from './mock/mockData';

import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { InvestigationWorkspace } from './components/investigation/InvestigationWorkspace';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { FraudRingsPage } from './components/rings/FraudRingsPage';
import { TransactionExplorer } from './components/transactions/TransactionExplorer';
import { EntitiesPage } from './components/entities/EntitiesPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ModelAnalyticsPage } from './components/analytics/ModelAnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [health, setHealth] = useState<{ status: string; service: string; version: string } | null>(null);
  const [analytics, setAnalytics] = useState<OverviewAnalytics>(mockOverviewAnalytics);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('A10294');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check health & fetch overview telemetry
    apiService.getHealth().then((h) => setHealth(h));
    apiService.getOverviewAnalytics().then((data) => setAnalytics(data));
  }, []);

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setActiveTab('investigations');
  };

  const handleSelectTransaction = () => {
    setActiveTab('transactions');
  };

  return (
    <div className="app-layout">
      {/* Permanent Desktop Sidebar (230px) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConnected={Boolean(health)}
      />

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              apiConnected={Boolean(health)}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              className="sidebar-mobile"
            />
          </div>
        </div>
      )}

      {/* Main Viewport Workspace */}
      <div className="main-wrapper">
        {/* Top Navigation Bar (60px) */}
        <TopBar
          activeTab={activeTab}
          onSelectEntity={handleSelectEntity}
          onSelectTransaction={handleSelectTransaction}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Dynamic Content Viewport */}
        <main className="content-viewport">
          {activeTab === 'overview' && (
            <OverviewDashboard
              analytics={analytics}
              onSelectInvestigation={handleSelectEntity}
            />
          )}

          {activeTab === 'investigations' && (
            <InvestigationWorkspace
              entityId={selectedEntityId}
            />
          )}

          {activeTab === 'graph' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h1 className="page-title">Transaction Network Explorer</h1>
                <p className="page-subtitle">
                  Interactive multi-hop neighborhood graph for entity <code style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{selectedEntityId}</code>
                </p>
              </div>

              <GraphCanvas
                graphData={mockGraphData}
                height="640px"
                selectedNodeId={selectedEntityId}
                onNodeClick={(id) => setSelectedEntityId(id)}
              />
            </div>
          )}

          {activeTab === 'rings' && (
            <FraudRingsPage
              onSelectEntity={handleSelectEntity}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionExplorer
              onSelectTransaction={handleSelectTransaction}
              onSelectEntity={handleSelectEntity}
            />
          )}

          {activeTab === 'entities' && (
            <EntitiesPage
              onSelectEntity={handleSelectEntity}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              onSelectEntity={handleSelectEntity}
            />
          )}

          {activeTab === 'analytics' && (
            <ModelAnalyticsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage health={health} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

