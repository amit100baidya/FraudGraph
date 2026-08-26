import os
import networkx as nx
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Set, Tuple

class HeterogeneousGraphEngine:
    """
    Graph Intelligence Engine for FraudGraph.
    Builds a heterogeneous NetworkX graph containing Users, Devices, IPs, Cards, and Merchants.
    Computes graph structural metrics, degree anomalies, shared entity links, and neighbor fraud ratios.
    """

    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.node_types: Dict[str, str] = {}
        self.fraud_labels: Dict[str, int] = {}

    def build_graph_from_dataframe(self, df: pd.DataFrame) -> nx.MultiDiGraph:
        """
        Populates heterogeneous multi-directed graph from transaction DataFrame.
        """
        self.graph.clear()
        self.node_types.clear()
        self.fraud_labels.clear()

        for idx, row in df.iterrows():
            tx_id = f"TX_{idx}"
            orig_id = str(row["nameOrig"])
            dest_id = str(row["nameDest"])
            device_id = str(row.get("device_id", "DEV_UNKNOWN"))
            ip_id = str(row.get("ip_address", "127.0.0.1"))
            card_id = str(row.get("card_id", "CARD_UNKNOWN"))
            is_fraud = int(row.get("isFraud", 0))

            # Register Nodes
            self._add_node(orig_id, "USER")
            self._add_node(dest_id, "MERCHANT" if dest_id.startswith("M") else "USER")
            self._add_node(tx_id, "TRANSACTION")
            self._add_node(device_id, "DEVICE")
            self._add_node(ip_id, "IP")
            self._add_node(card_id, "CARD")

            if is_fraud:
                self.fraud_labels[orig_id] = 1
                self.fraud_labels[tx_id] = 1

            # Add Directed Edges
            step = int(row.get("step", 0))
            amount = float(row.get("amount", 0.0))
            tx_type = str(row.get("type", "PAYMENT"))

            # Transaction flow: Orig -> TX -> Dest
            self.graph.add_edge(orig_id, tx_id, key="INITIATED", step=step, amount=amount, tx_type=tx_type)
            self.graph.add_edge(tx_id, dest_id, key="RECEIVED", step=step, amount=amount, tx_type=tx_type)

            # Metadata linkages: Orig/TX -> Entities
            self.graph.add_edge(orig_id, device_id, key="USED_DEVICE")
            self.graph.add_edge(orig_id, ip_id, key="USED_IP")
            self.graph.add_edge(orig_id, card_id, key="USED_CARD")

        return self.graph

    def _add_node(self, node_id: str, node_type: str):
        """Helper to set node type attribute."""
        if not self.graph.has_node(node_id):
            self.graph.add_node(node_id, node_type=node_type)
            self.node_types[node_id] = node_type

    def get_entity_graph_score(self, entity_id: str) -> Dict[str, Any]:
        """
        Computes structural graph risk metrics for a given entity (User, Device, IP, Card).
        """
        if not self.graph.has_node(entity_id):
            return {
                "entity_id": entity_id,
                "degree": 0,
                "shared_users_count": 0,
                "neighbor_fraud_ratio": 0.0,
                "graph_risk_score": 0.0
            }

        neighbors = list(self.graph.neighbors(entity_id)) + list(self.graph.predecessors(entity_id))
        unique_neighbors = set(neighbors)

        # Count connected users
        connected_users = [n for n in unique_neighbors if self.node_types.get(n) == "USER"]
        shared_users_count = len(set(connected_users))

        # Calculate neighbor fraud ratio
        fraud_neighbors = sum(1 for n in unique_neighbors if self.fraud_labels.get(n, 0) == 1)
        neighbor_fraud_ratio = fraud_neighbors / max(1, len(unique_neighbors))

        # Compute graph risk score (0 - 100)
        # Shared device/IP across multiple users + high neighbor fraud ratio raises risk
        risk_from_sharing = min(1.0, max(0.0, (shared_users_count - 1) / 5.0)) * 40.0
        risk_from_fraud_neighbors = neighbor_fraud_ratio * 60.0
        graph_risk_score = round(risk_from_sharing + risk_from_fraud_neighbors, 2)

        return {
            "entity_id": entity_id,
            "node_type": self.node_types.get(entity_id, "UNKNOWN"),
            "degree": self.graph.degree(entity_id),
            "shared_users_count": shared_users_count,
            "neighbor_fraud_ratio": round(neighbor_fraud_ratio, 4),
            "graph_risk_score": graph_risk_score
        }

    def get_subgraph_nodes_and_edges(self, target_id: str, max_hops: int = 2) -> Dict[str, Any]:
        """
        Extracts k-hop neighborhood subgraph formatted for Cytoscape.js visualization.
        """
        if not self.graph.has_node(target_id):
            return {"nodes": [], "edges": []}

        # BFS traversal for k-hop neighborhood
        nodes_at_hops = {target_id}
        current_layer = {target_id}

        for _ in range(max_hops):
            next_layer = set()
            for node in current_layer:
                nbrs = set(self.graph.neighbors(node)).union(set(self.graph.predecessors(node)))
                next_layer.update(nbrs)
            nodes_at_hops.update(next_layer)
            current_layer = next_layer

        subG = self.graph.subgraph(nodes_at_hops)

        cytoscape_nodes = []
        for n in subG.nodes():
            n_type = self.node_types.get(n, "UNKNOWN")
            is_fraud = self.fraud_labels.get(n, 0) == 1
            cytoscape_nodes.append({
                "data": {
                    "id": str(n),
                    "label": str(n),
                    "node_type": n_type,
                    "is_fraud": is_fraud,
                    "is_target": n == target_id
                }
            })

        cytoscape_edges = []
        for u, v, k, d in subG.edges(keys=True, data=True):
            cytoscape_edges.append({
                "data": {
                    "id": f"{u}_{v}_{k}",
                    "source": str(u),
                    "target": str(v),
                    "relationship": k,
                    "amount": d.get("amount", 0.0),
                    "step": d.get("step", 0)
                }
            })

        return {
            "target_id": target_id,
            "nodes": cytoscape_nodes,
            "edges": cytoscape_edges
        }
