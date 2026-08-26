import React from 'react';
import { mockModelMetrics, mockModelComparison } from '../../mock/mockData';
import { KpiCard } from '../common/KpiCard';

export const ModelAnalyticsPage: React.FC = () => {
  const metrics = mockModelMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 className="page-title">Model Analytics & Ablation Benchmarks</h1>
        <p className="page-subtitle">
          Measured model evaluation metrics, precision-recall trade-offs, and graph neural network gain analysis
        </p>
      </div>

      {/* Model Metadata Banner */}
      <div className="fintech-card" style={{ padding: '1.25rem', background: 'var(--accent-light)', borderColor: 'var(--accent-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Production Model</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.name} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-primary)' }}>v{metrics.version}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Trained: {metrics.trainingTimestamp} · Evaluated on holdout validation set
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Dataset Size</div>
              <strong className="num-highlight">{(metrics.datasetSize / 1000000).toFixed(2)}M samples</strong>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Fraud Class Ratio</div>
              <strong className="num-highlight" style={{ color: 'var(--risk-critical)' }}>
                {((metrics.fraudSamples / metrics.datasetSize) * 100).toFixed(2)}% (34.5k)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Precision" value={`${metrics.precision}%`} subtext="True Fraud / Flagged" trend="up" trendValue="+14.4%" riskColor="var(--accent-primary)" />
        <KpiCard title="Recall" value={`${metrics.recall}%`} subtext="Detected Fraud / Total Fraud" trend="up" trendValue="+20.1%" riskColor="var(--risk-low)" />
        <KpiCard title="F1 Score" value={`${metrics.f1Score}%`} subtext="Harmonic Precision-Recall" trend="up" trendValue="+17.5%" riskColor="var(--text-primary)" />
        <KpiCard title="PR-AUC" value={metrics.prAuc.toFixed(3)} subtext="Precision-Recall Area" trend="up" trendValue="+0.177" riskColor="var(--accent-primary)" />
        <KpiCard title="ROC-AUC" value={metrics.rocAuc.toFixed(3)} subtext="Receiver Operating Area" trend="up" trendValue="+0.098" riskColor="var(--risk-low)" />
      </div>

      {/* Grid: Confusion Matrix (Left) + PR & ROC Curves (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>
        
        {/* Confusion Matrix */}
        <div className="fintech-card" style={{ padding: '1.25rem' }}>
          <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Holdout Confusion Matrix</h3>
          <p className="meta-text" style={{ marginBottom: '1rem' }}>Measured classification outcomes on 1.24M transactions</p>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '12px' }}>
            {/* Header Row */}
            <div />
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '6px', borderRadius: '4px' }}>
              Predicted Fraud
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '6px', borderRadius: '4px' }}>
              Predicted Legit
            </div>

            {/* Row 1: Actual Fraud */}
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '12px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Actual Fraud
            </div>
            <div style={{ background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>True Positive (TP)</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--risk-low)' }}>
                {metrics.confusionMatrix.truePositive.toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>False Negative (FN)</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--risk-critical)' }}>
                {metrics.confusionMatrix.falseNegative.toLocaleString()}
              </div>
            </div>

            {/* Row 2: Actual Legit */}
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '12px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Actual Legit
            </div>
            <div style={{ background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>False Positive (FP)</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--risk-high)' }}>
                {metrics.confusionMatrix.falsePositive.toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>True Negative (TN)</div>
              <div className="num-highlight" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {metrics.confusionMatrix.trueNegative.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Precision-Recall Curve & ROC Visualization */}
        <div className="fintech-card" style={{ padding: '1.25rem' }}>
          <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Precision-Recall Curve (PR-AUC: 0.972)</h3>
          <p className="meta-text" style={{ marginBottom: '1rem' }}>Sustained high precision even at 94%+ recall rates</p>

          <div style={{ height: '180px', borderLeft: '2px solid var(--border-strong)', borderBottom: '2px solid var(--border-strong)', position: 'relative', margin: '10px 10px 25px 25px' }}>
            {/* Simple SVG Curve */}
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 10 Q 150 15 280 40 T 360 160"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
              />
              <path
                d="M 0 10 Q 150 15 280 40 T 360 160 L 360 170 L 0 170 Z"
                fill="rgba(37, 99, 235, 0.08)"
              />
              {metrics.prCurve.map((pt, i) => (
                <circle
                  key={i}
                  cx={`${pt.recall * 100}%`}
                  cy={`${(1 - pt.precision) * 300 + 10}px`}
                  r="4"
                  fill="var(--accent-primary)"
                />
              ))}
            </svg>

            <span style={{ position: 'absolute', bottom: '-20px', left: '0', fontSize: '10px', color: 'var(--text-muted)' }}>Recall 0.0</span>
            <span style={{ position: 'absolute', bottom: '-20px', right: '0', fontSize: '10px', color: 'var(--text-muted)' }}>Recall 1.0</span>
            <span style={{ position: 'absolute', top: '0', left: '-25px', fontSize: '10px', color: 'var(--text-muted)' }}>1.0</span>
            <span style={{ position: 'absolute', bottom: '0', left: '-25px', fontSize: '10px', color: 'var(--text-muted)' }}>0.0</span>
          </div>
        </div>

      </div>

      {/* Model Ablation Comparison Table */}
      <div className="fintech-card" style={{ padding: '1.25rem' }}>
        <h3 className="section-title" style={{ marginBottom: '0.4rem' }}>Ablation Benchmark Comparison</h3>
        <p className="meta-text" style={{ marginBottom: '1rem' }}>
          Demonstrates how network topology graph intelligence improves detection over traditional tabular ML models
        </p>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>PR-AUC</th>
                <th>Graph Intelligence Gain</th>
              </tr>
            </thead>
            <tbody>
              {mockModelComparison.map((row, idx) => (
                <tr key={idx} style={{ background: row.modelName.includes('Hybrid') ? 'var(--accent-light)' : 'transparent' }}>
                  <td>
                    <span style={{ fontWeight: 600, color: row.modelName.includes('Hybrid') ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {row.modelName}
                    </span>
                  </td>
                  <td><span className="num-highlight">{row.precision}%</span></td>
                  <td><span className="num-highlight">{row.recall}%</span></td>
                  <td><span className="num-highlight" style={{ fontWeight: 700 }}>{row.f1Score}%</span></td>
                  <td><span className="num-highlight">{row.prAuc}</span></td>
                  <td>
                    <span className="status-badge badge-investigating" style={{
                      background: row.graphGain.includes('Baseline') ? 'var(--bg-subtle)' : 'var(--risk-low-bg)',
                      color: row.graphGain.includes('Baseline') ? 'var(--text-muted)' : 'var(--risk-low)',
                      borderColor: row.graphGain.includes('Baseline') ? 'var(--border-color)' : 'var(--risk-low-border)'
                    }}>
                      {row.graphGain}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
