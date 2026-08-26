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
  name: 'Primary Node A10294',
  type: 'BANK_ACCOUNT',
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
    title: 'Relationship Anomaly',
    severity: 'HIGH',
    description: 'Multiple accounts share suspicious transaction relationships, IP 192.168.1.104, and Device DEV-8819.',
    impactScore: 12,
    highlightNodeIds: ['A10294', 'DEV-8819', 'IP-104'],
    highlightEdgeIds: ['E5', 'E6']
  }
];

export const mockGraphData: NetworkGraphData = {
  targetId: 'A10294',
  nodes: [
    { id: 'A10294', label: 'A10294 (Origin)', nodeType: 'BANK_ACCOUNT', riskLevel: 'CRITICAL', riskScore: 97, isFraud: true, isTarget: true, amount: 842000 },
    { id: 'A88421', label: 'A88421 (Hub)', nodeType: 'BANK_ACCOUNT', riskLevel: 'HIGH', riskScore: 91, isFraud: true, amount: 72500 },
    { id: 'A77192', label: 'A77192 (Recipient)', nodeType: 'BANK_ACCOUNT', riskLevel: 'HIGH', riskScore: 88, isFraud: true, amount: 48000 },
    { id: 'A55192', label: 'A55192 (Mule)', nodeType: 'BANK_ACCOUNT', riskLevel: 'MEDIUM', riskScore: 76, isFraud: false, amount: 18500 },
    { id: 'MERCH_901', label: 'PayMerchant X', nodeType: 'MERCHANT', riskLevel: 'HIGH', riskScore: 82, isFraud: true, amount: 120000 },
    { id: 'DEV-8819', label: 'Device iPhone 15', nodeType: 'DEVICE', riskLevel: 'CRITICAL', riskScore: 95, isFraud: true },
    { id: 'IP-104', label: 'IP 192.168.1.104', nodeType: 'IP', riskLevel: 'HIGH', riskScore: 89, isFraud: true },
    { id: 'A33910', label: 'A33910 (Legit)', nodeType: 'BANK_ACCOUNT', riskLevel: 'LOW', riskScore: 12, isFraud: false, amount: 2500 },
    { id: 'CARD-4412', label: 'Visa ****4412', nodeType: 'CARD', riskLevel: 'MEDIUM', riskScore: 54, isFraud: false }
  ],
  edges: [
    { id: 'E1', source: 'A10294', target: 'A88421', relationship: 'TRANSFERRED', amount: 48000, isSuspicious: true, evidenceCategory: 'velocity' },
    { id: 'E2', source: 'A88421', target: 'A77192', relationship: 'TRANSFERRED', amount: 72500, isSuspicious: true, evidenceCategory: 'amount' },
    { id: 'E3', source: 'A77192', target: 'MERCH_901', relationship: 'PAYMENT', amount: 120000, isSuspicious: true, evidenceCategory: 'network' },
    { id: 'E4', source: 'A10294', target: 'A55192', relationship: 'TRANSFERRED', amount: 18500, isSuspicious: false, evidenceCategory: 'velocity' },
    { id: 'E5', source: 'A10294', target: 'DEV-8819', relationship: 'USED_DEVICE', isSuspicious: true, evidenceCategory: 'relationship' },
    { id: 'E6', source: 'A88421', target: 'DEV-8819', relationship: 'SHARED_DEVICE', isSuspicious: true, evidenceCategory: 'relationship' },
    { id: 'E7', source: 'A10294', target: 'IP-104', relationship: 'LOGGED_IP', isSuspicious: true, evidenceCategory: 'relationship' },
    { id: 'E8', source: 'A33910', target: 'A10294', relationship: 'TRANSFERRED', amount: 2500, isSuspicious: false },
    { id: 'E9', source: 'A10294', target: 'CARD-4412', relationship: 'CARD_HOLDER', isSuspicious: false }
  ]
};

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-10291',
    senderId: 'A10294',
    senderName: 'Account A10294',
    receiverId: 'A88421',
    receiverName: 'Account A88421',
    amount: 48000,
    type: 'TRANSFER',
    timestamp: '2026-08-26 21:12:04',
    fraudProbability: 97.4,
    riskScore: 97,
    riskLevel: 'CRITICAL',
    status: 'NEW',
    location: 'Mumbai, IN',
    ipAddress: '192.168.1.104',
    deviceId: 'DEV-8819',
    evidenceSummary: {
      mlScore: 0.974,
      behavioralFlags: ['Velocity Spike', 'Rapid Drain'],
      graphFlags: ['High Risk Ring FR-0041', 'Device Reuse']
    }
  },
  {
    id: 'TXN-10292',
    senderId: 'A88421',
    senderName: 'Account A88421',
    receiverId: 'A77192',
    receiverName: 'Account A77192',
    amount: 72500,
    type: 'TRANSFER',
    timestamp: '2026-08-26 21:13:12',
    fraudProbability: 91.2,
    riskScore: 91,
    riskLevel: 'HIGH',
    status: 'INVESTIGATING',
    location: 'Delhi, IN',
    ipAddress: '192.168.1.104',
    deviceId: 'DEV-8819'
  },
  {
    id: 'TXN-10293',
    senderId: 'A77192',
    senderName: 'Account A77192',
    receiverId: 'MERCH_901',
    receiverName: 'PayMerchant X',
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
    senderName: 'Account A10294',
    receiverId: 'A55192',
    receiverName: 'Account A55192',
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
    senderName: 'Account A33910',
    receiverId: 'A10294',
    receiverName: 'Account A10294',
    amount: 2500,
    type: 'DEPOSIT',
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
    entityType: 'BANK_ACCOUNT',
    reason: 'Suspicious network cluster (FR-0041 connection)',
    createdAt: '2 minutes ago',
    status: 'INVESTIGATING',
    riskScore: 97
  },
  {
    id: 'AL-1841',
    riskLevel: 'HIGH',
    entityId: 'A88421',
    entityType: 'BANK_ACCOUNT',
    reason: 'High transaction velocity & volume deviation',
    createdAt: '14 minutes ago',
    status: 'NEW',
    riskScore: 91
  },
  {
    id: 'AL-1840',
    riskLevel: 'HIGH',
    entityId: 'DEV-8819',
    entityType: 'DEVICE',
    reason: 'Multi-account fingerprint anomaly (11 accounts)',
    createdAt: '35 minutes ago',
    status: 'INVESTIGATING',
    riskScore: 95
  },
  {
    id: 'AL-1839',
    riskLevel: 'MEDIUM',
    entityId: 'A55192',
    entityType: 'BANK_ACCOUNT',
    reason: 'Rapid succession micropayments',
    createdAt: '1 hour ago',
    status: 'REVIEWED',
    riskScore: 76
  }
];

export const mockEntities: Entity[] = [
  mockTargetEntity,
  {
    id: 'A88421',
    name: 'Account A88421',
    type: 'BANK_ACCOUNT',
    riskScore: 91,
    fraudProbability: 91.2,
    riskLevel: 'HIGH',
    transactionCount: 98,
    totalVolume: 540000,
    connectedEntitiesCount: 14,
    status: 'INVESTIGATING',
    createdAt: '2026-08-05',
    lastActive: '14 mins ago',
    riskFactors: ['High transaction velocity', 'Shared IP address']
  },
  {
    id: 'A77192',
    name: 'Account A77192',
    type: 'BANK_ACCOUNT',
    riskScore: 88,
    fraudProbability: 88.0,
    riskLevel: 'HIGH',
    transactionCount: 64,
    totalVolume: 320000,
    connectedEntitiesCount: 9,
    status: 'INVESTIGATING',
    createdAt: '2026-08-10',
    lastActive: '42 mins ago',
    riskFactors: ['High-risk merchant payments']
  },
  {
    id: 'DEV-8819',
    name: 'Device iPhone 15',
    type: 'DEVICE',
    riskScore: 95,
    fraudProbability: 95.1,
    riskLevel: 'CRITICAL',
    transactionCount: 240,
    totalVolume: 1890000,
    connectedEntitiesCount: 11,
    status: 'NEW',
    createdAt: '2026-08-12',
    lastActive: 'Just now',
    riskFactors: ['Multi-account binding', 'Jailbroken device flag']
  },
  {
    id: 'MERCH_901',
    name: 'PayMerchant X',
    type: 'MERCHANT',
    riskScore: 82,
    fraudProbability: 82.4,
    riskLevel: 'HIGH',
    transactionCount: 450,
    totalVolume: 5600000,
    connectedEntitiesCount: 38,
    status: 'REVIEWED',
    createdAt: '2026-07-15',
    lastActive: '5 mins ago',
    riskFactors: ['Abnormal refund rate', 'High dispute ratio']
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
