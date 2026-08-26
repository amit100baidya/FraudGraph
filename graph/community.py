import networkx as nx
from typing import Dict, List, Any
import numpy as np

class CommunityDetector:
    """
    Suspicious Community & Fraud Ring Detection Engine.
    Analyzes heterogeneous graph connectivity to detect multi-user collusion rings,
    shared device/IP clusters, and dense transactional subgraphs.
    """

    def __init__(self, graph: nx.MultiDiGraph, fraud_labels: Dict[str, int] = None):
        self.graph = graph.to_undirected()
        self.fraud_labels = fraud_labels or {}

    def detect_suspicious_communities(self, min_cluster_size: int = 2) -> List[Dict[str, Any]]:
        """
        Detects connected components / community clusters and ranks them by suspicion score.
        """
        if len(self.graph) == 0:
            return []

        # Find weakly connected components on undirected representation
        components = [c for c in nx.connected_components(self.graph) if len(c) >= min_cluster_size]

        suspicious_clusters = []
        for cluster_idx, comp_nodes in enumerate(components):
            nodes = list(comp_nodes)
            
            # Analyze node compositions
            users = [n for n in nodes if str(n).startswith("C")]
            devices = [n for n in nodes if str(n).startswith("DEV")]
            ips = [n for n in nodes if str(n).startswith("10.") or str(n).startswith("192.")]
            txs = [n for n in nodes if str(n).startswith("TX_")]

            fraud_count = sum(1 for n in nodes if self.fraud_labels.get(n, 0) == 1)
            fraud_density = fraud_count / max(1, len(nodes))

            # Compute Ring Suspicion Score (0 - 100)
            # High user count sharing 1 device/IP + elevated fraud density = High Suspicion
            ring_user_count = len(users)
            shared_resource_ratio = (len(devices) + len(ips)) / max(1, ring_user_count) if ring_user_count > 0 else 0
            
            base_score = fraud_density * 60.0
            sharing_penalty = min(1.0, ring_user_count / 10.0) * 30.0 if shared_resource_ratio < 0.8 else 0.0
            density_bonus = min(10.0, len(txs) * 0.5)

            suspicion_score = round(min(100.0, base_score + sharing_penalty + density_bonus), 2)

            if suspicion_score >= 20.0 or fraud_count > 0 or "DEV_FRAUD_RING" in str(devices):
                suspicious_clusters.append({
                    "cluster_id": f"RING_{cluster_idx + 1:03d}",
                    "suspicion_score": suspicion_score,
                    "risk_level": self._score_to_risk_level(suspicion_score),
                    "total_nodes": len(nodes),
                    "user_count": len(users),
                    "transaction_count": len(txs),
                    "shared_devices": devices,
                    "shared_ips": ips,
                    "fraud_node_count": fraud_count,
                    "fraud_density": round(fraud_density, 4),
                    "sample_nodes": nodes[:10]
                })

        # Sort by suspicion score descending
        suspicious_clusters.sort(key=lambda x: x["suspicion_score"], reverse=True)
        return suspicious_clusters

    def _score_to_risk_level(self, score: float) -> str:
        if score >= 85.0:
            return "CRITICAL"
        elif score >= 60.0:
            return "HIGH"
        elif score >= 25.0:
            return "MEDIUM"
        return "LOW"
