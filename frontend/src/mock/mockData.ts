import type { 
  OverviewAnalytics, 
  Transaction, 
  Entity, 
  FraudRing, 
  Alert, 
  ModelMetrics, 
  ModelComparisonItem, 
  NetworkGraphData,
  EvidenceItem
} from '../types';

export const mockOverviewAnalytics: OverviewAnalytics = {
  amountAtRisk: 2840000,
  highRiskEntities: 184,
  activeInvestigations: 37,
  fraudRate: 2.7,
  riskActivitySeries: [
    { timestamp: '00:00', legitimateCount: 1420, suspiciousCount: 18, confirmedFraudCount: 3, amountAtRisk: 140000 },
    { timestamp: '03:00', legitimateCount: 980, suspiciousCount: 12, confirmedFraudCount: 2, amountAtRisk: 85000 },
    { timestamp: '06:00', legitimateCount: 1150, suspiciousCount: 24, confirmedFraudCount: 5, amountAtRisk: 310000 },
    { timestamp: '09:00', legitimateCount: 2450, suspiciousCount: 45, confirmedFraudCount: 11, amountAtRisk: 620000 },
    { timestamp: '12:00', legitimateCount: 3890, suspiciousCount: 68, confirmedFraudCount: 18, amountAtRisk: 940000 },
    { timestamp: '15:00', legitimateCount: 3410, suspiciousCount: 52, confirmedFraudCount: 14, amountAtRisk: 780000 },
    { timestamp: '18:00', legitimateCount: 2950, suspiciousCount: 38, confirmedFraudCount: 9, amountAtRisk: 490000 },
    { timestamp: '21:00', legitimateCount: 2100, suspiciousCount: 29, confirmedFraudCount: 6, amountAtRisk: 280000 },
  ],
  priorityInvestigations: [
    {
      id: 'INV-1842',
      entityId: 'A10294',
      entityName: 'Account A10294',
      riskLevel: 'CRITICAL',
      riskScore: 97,
      timestamp: '2 mins ago',
      primaryReason: 'Rapid transaction velocity & suspicious network cluster',
      status: 'NEW'
    },
    {
      id: 'INV-1841',
      entityId: 'A88421',
      entityName: 'Account A88421',
      riskLevel: 'HIGH',
      riskScore: 91,
      timestamp: '14 mins ago',
      primaryReason: 'Abnormal transaction amount fan-out',
      status: 'INVESTIGATING'
    },
    {
      id: 'INV-1840',
      entityId: 'A77192',
      entityName: 'Account A77192',
      riskLevel: 'HIGH',
      riskScore: 88,
      timestamp: '42 mins ago',
      primaryReason: 'Multiple accounts sharing device fingerprint',
      status: 'INVESTIGATING'
    },
    {
      id: 'INV-1839',
      entityId: 'A55192',
      entityName: 'Account A55192',
      riskLevel: 'MEDIUM',
      riskScore: 76,
      timestamp: '1 hour ago',
      primaryReason: 'High frequency micropayments sequence',
      status: 'NEW'
    },
    {
      id: 'INV-1838',
      entityId: 'A33910',
      entityName: 'Account A33910',
      riskLevel: 'MEDIUM',
      riskScore: 68,
      timestamp: '2 hours ago',
      primaryReason: 'New device login from high-risk IP range',
      status: 'REVIEWED'
    }
  ]
};

export const mockTargetEntity: Entity = {
  id: 'A10294',
  name: 'Primary Account C10294',
  type: 'ACCOUNT',

  riskScore: 97,
  fraudProbability: 97.4,
  riskLevel: 'CRITICAL',
  transactionCount: 142,
  totalVolume: 842000,
  connectedEntitiesCount: 27,
  status: 'INVESTIGATING',
  createdAt: '2026-08-01',
  lastActive: 'Just now',
  riskFactors: [
    'Rapid transaction velocity',
    'Multiple suspicious connections',
    'Abnormal transaction amount',
    'High-risk network cluster',
    'Unusual transaction sequence'
  ]
};

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'EV-01',
    code: 'network',
    title: 'Network Anomaly',
    severity: 'HIGH',
    description: 'Account belongs to a high-risk transaction community (FR-0041). High connectivity density to previously flagged accounts.',
    impactScore: 38,
    highlightNodeIds: ['A10294', 'A88421', 'A77192', 'MERCH_901'],
    highlightEdgeIds: ['E1', 'E2', 'E3']
  },
  {
    id: 'EV-02',
    code: 'velocity',
    title: 'Transaction Velocity',
    severity: 'HIGH',
    description: '18 transactions occurred within 4 minutes. Bursts exceed historical baseline by 1,420%.',
    impactScore: 29,
    highlightNodeIds: ['A10294', 'A88421', 'A55192'],
    highlightEdgeIds: ['E1', 'E4']
  },
  {
    id: 'EV-03',
    code: 'amount',
    title: 'Amount Deviation',
    severity: 'MEDIUM',
    description: 'Transaction value of ₹72,500 significantly differs from account baseline (mean ₹1,400).',
    impactScore: 18,
    highlightNodeIds: ['A88421', 'A77192'],
    highlightEdgeIds: ['E2']
  },
  {
    id: 'EV-04',
    code: 'relationship',
    title: 'Counterparty Anomaly',
    severity: 'HIGH',
    description: 'Multiple accounts exhibit high-velocity transaction transfers with account A88421.',
    impactScore: 12,
    highlightNodeIds: ['A10294', 'A88421', 'TXN-10291'],
    highlightEdgeIds: ['E1', 'E2']
  }
];

export const mockGraphData: NetworkGraphData = {
  targetId: 'A10294',
  nodes: [
    { id: 'A10294', label: 'C10294 (Origin)', nodeType: 'ACCOUNT', riskLevel: 'CRITICAL', riskScore: 97, isFraud: true, isTarget: true, amount: 842000 },
    { id: 'A88421', label: 'C88421 (Hub)', nodeType: 'ACCOUNT', riskLevel: 'HIGH', riskScore: 91, isFraud: true, amount: 72500 },
    { id: 'A77192', label: 'C77192 (Recipient)', nodeType: 'ACCOUNT', riskLevel: 'HIGH', riskScore: 88, isFraud: true, amount: 48000 },
    { id: 'A55192', label: 'C55192 (Mule)', nodeType: 'ACCOUNT', riskLevel: 'MEDIUM', riskScore: 76, isFraud: false, amount: 18500 },
    { id: 'M90012', label: 'M90012 (Dest Merchant)', nodeType: 'ACCOUNT', riskLevel: 'HIGH', riskScore: 82, isFraud: true, amount: 120000 },
    { id: 'TXN-10291', label: 'TX_10291 (Transfer)', nodeType: 'TRANSACTION', riskLevel: 'CRITICAL', riskScore: 95, isFraud: true, amount: 48000 },
    { id: 'TXN-10292', label: 'TX_10292 (Cash Out)', nodeType: 'TRANSACTION', riskLevel: 'HIGH', riskScore: 89, isFraud: true, amount: 72500 },
    { id: 'A33910', label: 'C33910 (Legit)', nodeType: 'ACCOUNT', riskLevel: 'LOW', riskScore: 12, isFraud: false, amount: 2500 }
  ],
  edges: [
    { id: 'E1', source: 'A10294', target: 'TXN-10291', relationship: 'INITIATED', amount: 48000, isSuspicious: true, evidenceCategory: 'velocity' },
    { id: 'E2', source: 'TXN-10291', target: 'A88421', relationship: 'TRANSFER_TO', amount: 48000, isSuspicious: true, evidenceCategory: 'amount' },
    { id: 'E3', source: 'A88421', target: 'TXN-10292', relationship: 'INITIATED', amount: 72500, isSuspicious: true, evidenceCategory: 'network' },
    { id: 'E4', source: 'TXN-10292', target: 'M90012', relationship: 'PAYMENT_TO', amount: 72500, isSuspicious: true, evidenceCategory: 'velocity' },
    { id: 'E5', source: 'A10294', target: 'A55192', relationship: 'TRANSFERRED', amount: 18500, isSuspicious: false, evidenceCategory: 'relationship' },
    { id: 'E6', source: 'A33910', target: 'A10294', relationship: 'TRANSFERRED', amount: 2500, isSuspicious: false }
  ]
};

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-10291',
    senderId: 'A10294',
    senderName: 'Account C10294',
    receiverId: 'A88421',
    receiverName: 'Account C88421',
    amount: 48000,
    type: 'TRANSFER',
    timestamp: '2026-08-26 21:12:04',
    fraudProbability: 97.4,
    riskScore: 97,
    riskLevel: 'CRITICAL',
    status: 'NEW',
    evidenceSummary: {
      mlScore: 0.974,
      behavioralFlags: ['Velocity Spike', 'Rapid Balance Drain'],
      graphFlags: ['High Risk Account Cluster FR-0041', 'Counterparty Fan-Out']
    }
  },
  {
    id: 'TXN-10292',
    senderId: 'A88421',
    senderName: 'Account C88421',
    receiverId: 'A77192',
    receiverName: 'Account C77192',
    amount: 72500,
    type: 'TRANSFER',
    timestamp: '2026-08-26 21:13:12',
    fraudProbability: 91.2,
    riskScore: 91,
    riskLevel: 'HIGH',
    status: 'INVESTIGATING'
  },
  {
    id: 'TXN-10293',
    senderId: 'A77192',
    senderName: 'Account C77192',
    receiverId: 'M90012',
    receiverName: 'Account M90012',
    amount: 120000,
    type: 'PAYMENT',
    timestamp: '2026-08-26 21:14:40',
    fraudProbability: 88.0,
    riskScore: 88,
    riskLevel: 'HIGH',
    status: 'INVESTIGATING'
  },
  {
    id: 'TXN-10294',
    senderId: 'A10294',
    senderName: 'Account C10294',
    receiverId: 'A55192',
    receiverName: 'Account C55192',
    amount: 18500,
    type: 'TRANSFER',
    timestamp: '2026-08-26 21:05:10',
    fraudProbability: 76.5,
    riskScore: 76,
    riskLevel: 'MEDIUM',
    status: 'NEW'
  },
  {
    id: 'TXN-10295',
    senderId: 'A33910',
    senderName: 'Account C33910',
    receiverId: 'A10294',
    receiverName: 'Account C10294',
    amount: 2500,
    type: 'CASH_IN',
    timestamp: '2026-08-26 20:45:00',
    fraudProbability: 12.1,
    riskScore: 12,
    riskLevel: 'LOW',
    status: 'REVIEWED'
  },
  {
    id: 'TXN-10296',
    senderId: 'A99120',
    senderName: 'Account A99120',
    receiverId: 'MERCH_901',
    receiverName: 'PayMerchant X',
    amount: 340000,
    type: 'CASH_OUT',
    timestamp: '2026-08-26 19:30:15',
    fraudProbability: 94.8,
    riskScore: 95,
    riskLevel: 'CRITICAL',
    status: 'CONFIRMED'
  }
];

export const mockFraudRings: FraudRing[] = [
  {
    id: 'FR-0041',
    name: 'Mule Ring Alpha-18',
    entityCount: 18,
    transactionCount: 74,
    totalVolume: 1240000,
    riskScore: 96,
    confidence: 94,
    status: 'INVESTIGATING',
    primaryClusterType: 'Rapid Layered Transfer Ring',
    entities: ['A10294', 'A88421', 'A77192', 'MERCH_901', 'DEV-8819', 'IP-104'],
    keyEvidence: [
      'Circular payment flow detected among 4 nodes',
      'Shared device fingerprint across 11 accounts',
      'Velocity: > 15 transactions per minute',
      'High similarity embedding in GNN vector space'
    ],
    createdAt: '2026-08-24',
    graphData: mockGraphData
  },
  {
    id: 'FR-0038',
    name: 'Card-Testing Cluster Beta',
    entityCount: 11,
    transactionCount: 39,
    totalVolume: 780000,
    riskScore: 91,
    confidence: 89,
    status: 'NEW',
    primaryClusterType: 'Micropayment Velocity Ring',
    entities: ['A55192', 'CARD-4412', 'MERCH_901'],
    keyEvidence: [
      'Low value sequential authorization bursts',
      'IP address hopping across 5 subnets within 10 mins'
    ],
    createdAt: '2026-08-25',
    graphData: mockGraphData
  },
  {
    id: 'FR-0032',
    name: 'Merchant Cashout Syndicate',
    entityCount: 24,
    transactionCount: 112,
    totalVolume: 3400000,
    riskScore: 88,
    confidence: 92,
    status: 'CONFIRMED',
    primaryClusterType: 'Synthetic Identity Cashout',
    entities: ['A99120', 'MERCH_901'],
    keyEvidence: [
      'Immediate cashout upon large credit transfers',
      'Fabricated KYC documentation signatures'
    ],
    createdAt: '2026-08-20',
    graphData: mockGraphData
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'AL-1842',
    riskLevel: 'CRITICAL',
    entityId: 'A10294',
    entityType: 'ACCOUNT',
    reason: 'Suspicious network cluster (FR-0041 connection)',
    createdAt: '2 minutes ago',
    status: 'INVESTIGATING',
    riskScore: 97
  },
  {
    id: 'AL-1841',
    riskLevel: 'HIGH',
    entityId: 'A88421',
    entityType: 'ACCOUNT',
    reason: 'High transaction velocity & volume deviation',
    createdAt: '14 minutes ago',
    status: 'NEW',
    riskScore: 91
  },
  {
    id: 'AL-1840',
    riskLevel: 'HIGH',
    entityId: 'A77192',
    entityType: 'ACCOUNT',
    reason: 'Multi-account counterparty anomaly',
    createdAt: '35 minutes ago',
    status: 'INVESTIGATING',
    riskScore: 88
  },
  {
    id: 'AL-1839',
    riskLevel: 'MEDIUM',
    entityId: 'A55192',
    entityType: 'ACCOUNT',
    reason: 'Rapid succession transfer payments',
    createdAt: '1 hour ago',
    status: 'REVIEWED',
    riskScore: 76
  }
];

export const mockEntities: Entity[] = [
  mockTargetEntity,
  {
    id: 'A88421',
    name: 'Account C88421',
    type: 'ACCOUNT',
    riskScore: 91,
    fraudProbability: 91.2,
    riskLevel: 'HIGH',
    transactionCount: 98,
    totalVolume: 540000,
    connectedEntitiesCount: 14,
    status: 'INVESTIGATING',
    createdAt: '2026-08-05',
    lastActive: '14 mins ago',
    riskFactors: ['High transaction velocity', 'Rapid balance zeroing']
  },
  {
    id: 'A77192',
    name: 'Account C77192',
    type: 'ACCOUNT',
    riskScore: 88,
    fraudProbability: 88.0,
    riskLevel: 'HIGH',
    transactionCount: 64,
    totalVolume: 320000,
    connectedEntitiesCount: 9,
    status: 'INVESTIGATING',
    createdAt: '2026-08-10',
    lastActive: '42 mins ago',
    riskFactors: ['High-risk transfer outflow']
  },
  {
    id: 'M90012',
    name: 'Account M90012 (Merchant Dest)',
    type: 'ACCOUNT',
    riskScore: 82,
    fraudProbability: 82.4,
    riskLevel: 'HIGH',
    transactionCount: 450,
    totalVolume: 5600000,
    connectedEntitiesCount: 38,
    status: 'REVIEWED',
    createdAt: '2026-07-15',
    lastActive: '5 mins ago',
    riskFactors: ['Abnormal inflow velocity', 'High dispute ratio']
  }
];


export const mockModelMetrics: ModelMetrics = {
  name: 'FraudGraph Hybrid (GNN + XGBoost)',
  version: '2.4.1',
  trainingTimestamp: '2026-08-20 04:00:00 UTC',
  datasetSize: 1240000,
  fraudSamples: 34500,
  nonFraudSamples: 1205500,
  precision: 96.8,
  recall: 94.2,
  f1Score: 95.5,
  prAuc: 0.972,
  rocAuc: 0.988,
  falsePositiveRate: 0.8,
  falseNegativeRate: 5.8,
  confusionMatrix: {
    truePositive: 32499,
    falsePositive: 1075,
    trueNegative: 1204425,
    falseNegative: 2001
  },
  prCurve: [
    { recall: 0.1, precision: 0.99 },
    { recall: 0.3, precision: 0.99 },
    { recall: 0.5, precision: 0.985 },
    { recall: 0.7, precision: 0.978 },
    { recall: 0.85, precision: 0.965 },
    { recall: 0.942, precision: 0.968 },
    { recall: 0.98, precision: 0.82 },
    { recall: 1.0, precision: 0.45 }
  ],
  rocCurve: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.002, tpr: 0.65 },
    { fpr: 0.005, tpr: 0.88 },
    { fpr: 0.008, tpr: 0.942 },
    { fpr: 0.02, tpr: 0.975 },
    { fpr: 0.05, tpr: 0.991 },
    { fpr: 1.0, tpr: 1.0 }
  ]
};

export const mockModelComparison: ModelComparisonItem[] = [
  {
    modelName: 'Baseline ML (XGBoost Tabular)',
    precision: 82.4,
    recall: 74.1,
    f1Score: 78.0,
    prAuc: 0.795,
    graphGain: 'Baseline'
  },
  {
    modelName: 'Behavioral ML (LSTM Sequence)',
    precision: 88.9,
    recall: 82.5,
    f1Score: 85.6,
    prAuc: 0.864,
    graphGain: '+7.6% F1'
  },
  {
    modelName: 'FraudGraph Hybrid (GNN + XGBoost)',
    precision: 96.8,
    recall: 94.2,
    f1Score: 95.5,
    prAuc: 0.972,
    graphGain: '+17.5% F1 over Baseline'
  }
];
