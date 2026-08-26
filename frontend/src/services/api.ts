import type { 
  OverviewAnalytics, 
  Transaction, 
  Entity, 
  FraudRing, 
  Alert, 
  ModelMetrics, 
  NetworkGraphData 
} from '../types';
import { 
  mockOverviewAnalytics, 
  mockTransactions, 
  mockEntities, 
  mockFraudRings, 
  mockAlerts, 
  mockModelMetrics, 
  mockGraphData,
  mockTargetEntity
} from '../mock/mockData';

const BASE_URL = 'http://localhost:8000';

async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch {
    return fallbackData;
  }
}

export const apiService = {
  getHealth: async (): Promise<{ status: string; service: string; version: string } | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },

  getOverviewAnalytics: async (): Promise<OverviewAnalytics> => {
    return fetchWithFallback<OverviewAnalytics>(
      `${BASE_URL}/api/v1/analytics/overview`,
      mockOverviewAnalytics
    );
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return fetchWithFallback<Transaction[]>(
      `${BASE_URL}/api/v1/transactions`,
      mockTransactions
    );
  },

  getTransactionById: async (id: string): Promise<Transaction | undefined> => {
    const list = await fetchWithFallback<Transaction[]>(
      `${BASE_URL}/api/v1/transactions`,
      mockTransactions
    );
    return list.find(t => t.id === id) || mockTransactions[0];
  },

  getEntityById: async (id: string): Promise<Entity> => {
    const list = await fetchWithFallback<Entity[]>(
      `${BASE_URL}/api/v1/entities`,
      mockEntities
    );
    return list.find(e => e.id === id) || { ...mockTargetEntity, id };
  },

  getEntities: async (): Promise<Entity[]> => {
    return fetchWithFallback<Entity[]>(
      `${BASE_URL}/api/v1/entities`,
      mockEntities
    );
  },

  getGraphSubgraph: async (targetId: string, hops: number = 2): Promise<NetworkGraphData> => {
    return fetchWithFallback<NetworkGraphData>(
      `${BASE_URL}/api/v1/graph/subgraph/${targetId}?hops=${hops}`,
      mockGraphData
    );
  },

  getFraudRings: async (): Promise<FraudRing[]> => {
    return fetchWithFallback<FraudRing[]>(
      `${BASE_URL}/api/v1/clusters`,
      mockFraudRings
    );
  },

  getAlerts: async (): Promise<Alert[]> => {
    return fetchWithFallback<Alert[]>(
      `${BASE_URL}/api/v1/alerts`,
      mockAlerts
    );
  },

  getModelMetrics: async (): Promise<ModelMetrics> => {
    return fetchWithFallback<ModelMetrics>(
      `${BASE_URL}/api/v1/analytics/model`,
      mockModelMetrics
    );
  }
};
