import networkx as nx
from typing import Dict, List, Any
import numpy as np

class CommunityDetector:
    """
    PaySim Community & Fraud Syndicate Detection Engine.
    Analyzes account-to-account transaction connectivity to detect multi-account collusion clusters,
    high-velocity money laundering subgraphs, and dense transactional components.
    """

    def __init__(self, graph: nx.MultiDiGraph, fraud_labels: Dict[str, int] = None):
        self.graph = graph.to_undirected()
        self.fraud_labels = fraud_labels or {}

    def detect_suspicious_communities(self, min_cluster_size: int = 2) -> List[Dict[str, Any]]:
        """
        Detects connected components / community clusters of accounts and transactions and ranks them by suspicion score.
        """
        if len(self.graph) == 0:
            return []

        # Find connected components on undirected graph representation
        components = [c for c in nx.connected_components(self.graph) if len(c) >= min_cluster_size]

        suspicious_clusters = []
        for cluster_idx, comp_nodes in enumerate(components):
            nodes = list(comp_nodes)
            
            # Categorize PaySim native entities (Accounts & Transactions)
            accounts = [n for n in nodes if not str(n).startswith("TX_")]
            txs = [n for n in nodes if str(n).startswith("TX_")]

            fraud_count = sum(1 for n in nodes if self.fraud_labels.get(n, 0) == 1)
            fraud_density = fraud_count / max(1, len(nodes))

            # Compute Ring Suspicion Score (0 - 100) based on account count & transaction velocity
            account_count = len(accounts)
            tx_ratio = len(txs) / max(1, account_count)
            
            base_score = fraud_density * 60.0
            velocity_bonus = min(30.0, tx_ratio * 10.0)
            size_penalty = min(10.0, account_count * 1.5)

            suspicion_score = round(min(100.0, base_score + velocity_bonus + size_penalty), 2)

            if suspicion_score >= 15.0 or fraud_count > 0:
                suspicious_clusters.append({
                    "cluster_id": f"RING_{cluster_idx + 1:03d}",
                    "suspicion_score": suspicion_score,
                    "risk_level": self._score_to_risk_level(suspicion_score),
                    "total_nodes": len(nodes),
                    "account_count": account_count,
                    "transaction_count": len(txs),
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
