export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type InvestigationStatus = 'NEW' | 'INVESTIGATING' | 'REVIEWED' | 'CONFIRMED';
export type TransactionType = 'TRANSFER' | 'PAYMENT' | 'CASH_OUT' | 'DEBIT' | 'DEPOSIT';
export type EntityType = 'USER' | 'MERCHANT' | 'DEVICE' | 'IP' | 'CARD' | 'BANK_ACCOUNT';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  riskScore: number; // 0-100
  fraudProbability: number; // 0-100 %
  riskLevel: RiskLevel;
  transactionCount: number;
  totalVolume: number; // in INR / rupees
  connectedEntitiesCount: number;
  status: InvestigationStatus;
  riskFactors: string[];
  createdAt: string;
  lastActive: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  type: TransactionType;
  timestamp: string;
  fraudProbability: number; // 0-100 %
  riskLevel: RiskLevel;
  riskScore: number;
  status: InvestigationStatus;
  location?: string;
  ipAddress?: string;
  deviceId?: string;
  evidenceSummary?: {
    mlScore: number;
    behavioralFlags: string[];
    graphFlags: string[];
  };
}

export interface GraphNode {
  id: string;
  label: string;
  nodeType: EntityType;
  riskLevel: RiskLevel;
  riskScore: number;
  isFraud: boolean;
  isTarget?: boolean;
  amount?: number;
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string; // e.g. "TRANSFERRED", "SHARED_IP", "USED_DEVICE"
  amount?: number;
  timestamp?: string;
  isSuspicious?: boolean;
  evidenceCategory?: 'network' | 'velocity' | 'amount' | 'relationship';
}

export interface NetworkGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  targetId?: string;
}

export interface EvidenceItem {
  id: string;
  code: 'network' | 'velocity' | 'amount' | 'relationship';
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  impactScore: number; // e.g. +34 points
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
}

export interface PriorityInvestigation {
  id: string;
  entityId: string;
  entityName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  timestamp: string;
  primaryReason: string;
  status: InvestigationStatus;
}

export interface FraudRing {
  id: string; // e.g. FR-0041
  name: string;
  entityCount: number;
  transactionCount: number;
  totalVolume: number;
  riskScore: number;
  confidence: number; // e.g. 94%
  status: InvestigationStatus;
  primaryClusterType: string;
  entities: string[];
  keyEvidence: string[];
  graphData: NetworkGraphData;
  createdAt: string;
}

export interface Alert {
  id: string; // e.g. AL-1842
  riskLevel: RiskLevel;
  entityId: string;
  entityType: EntityType;
  reason: string;
  createdAt: string;
  status: InvestigationStatus;
  riskScore: number;
}

export interface ModelMetrics {
  name: string;
  version: string;
  trainingTimestamp: string;
  datasetSize: number;
  fraudSamples: number;
  nonFraudSamples: number;
  precision: number;
  recall: number;
  f1Score: number;
  prAuc: number;
  rocAuc: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  prCurve: { recall: number; precision: number }[];
  rocCurve: { fpr: number; tpr: number }[];
}

export interface ModelComparisonItem {
  modelName: string;
  precision: number;
  recall: number;
  f1Score: number;
  prAuc: number;
  graphGain: string;
}

export interface RiskActivityPoint {
  timestamp: string;
  legitimateCount: number;
  suspiciousCount: number;
  confirmedFraudCount: number;
  amountAtRisk: number;
}

export interface OverviewAnalytics {
  amountAtRisk: number; // e.g. 2840000 (2.84M)
  highRiskEntities: number; // e.g. 184
  activeInvestigations: number; // e.g. 37
  fraudRate: number; // e.g. 2.7
  riskActivitySeries: RiskActivityPoint[];
  priorityInvestigations: PriorityInvestigation[];
}
