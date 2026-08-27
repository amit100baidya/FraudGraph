import os
import networkx as nx
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Set, Tuple

class HeterogeneousGraphEngine:
    """
    PaySim Graph Intelligence Engine for FraudGraph.
    Builds an Account-to-Account multi-directed graph representing:
    Source Account (nameOrig) -> Transaction -> Destination Account (nameDest).

    Computes leakage-safe graph structural metrics (degrees, unique counterparties,
    transaction velocity) strictly using attributes present in PaySim.
    """

    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.node_types: Dict[str, str] = {}
        self.fraud_labels: Dict[str, int] = {}

    def build_graph_from_dataframe(self, df: pd.DataFrame) -> nx.MultiDiGraph:
        """
        Populates directed transaction graph from PaySim DataFrame.
        Graph structure: Account (nameOrig) -> Transaction -> Account (nameDest).
        """
        self.graph.clear()
        self.node_types.clear()
        self.fraud_labels.clear()

        for idx, row in df.iterrows():
            tx_id = f"TX_{idx}"
            orig_id = str(row["nameOrig"])
            dest_id = str(row["nameDest"])
            is_fraud = int(row.get("isFraud", 0))

            # Register Nodes (PaySim native entities: ACCOUNT and TRANSACTION)
            self._add_node(orig_id, "ACCOUNT")
            self._add_node(dest_id, "ACCOUNT")
            self._add_node(tx_id, "TRANSACTION")

            if is_fraud:
                self.fraud_labels[orig_id] = 1
                self.fraud_labels[dest_id] = 1
                self.fraud_labels[tx_id] = 1

            # Add Directed Edges: Orig -> TX -> Dest
            step = int(row.get("step", 0))
            amount = float(row.get("amount", 0.0))
            tx_type = str(row.get("type", "PAYMENT"))

            self.graph.add_edge(orig_id, tx_id, key="INITIATED", step=step, amount=amount, tx_type=tx_type)
            self.graph.add_edge(tx_id, dest_id, key="TRANSFER_TO", step=step, amount=amount, tx_type=tx_type)

        return self.graph

    def _add_node(self, node_id: str, node_type: str):
        """Helper to set node type attribute."""
        if not self.graph.has_node(node_id):
            self.graph.add_node(node_id, node_type=node_type)
            self.node_types[node_id] = node_type

    def get_entity_graph_score(self, entity_id: str) -> Dict[str, Any]:
        """
        Computes leakage-safe structural graph risk metrics for a given Account.
        Does NOT rely on future target labels.
        """
        if not self.graph.has_node(entity_id):
            return {
                "entity_id": entity_id,
                "node_type": "ACCOUNT",
                "in_degree": 0,
                "out_degree": 0,
                "total_degree": 0,
                "unique_counterparties": 0,
                "graph_risk_score": 0.0
            }

        in_deg = self.graph.in_degree(entity_id)
        out_deg = self.graph.out_degree(entity_id)
        total_deg = self.graph.degree(entity_id)

        # Find unique counterparties through transactions
        neighbors = list(self.graph.neighbors(entity_id)) + list(self.graph.predecessors(entity_id))
        counterparties = set()
        for nbr in neighbors:
            if self.node_types.get(nbr) == "TRANSACTION":
                sub_nbrs = list(self.graph.neighbors(nbr)) + list(self.graph.predecessors(nbr))
                for s_nbr in sub_nbrs:
                    if s_nbr != entity_id and self.node_types.get(s_nbr) == "ACCOUNT":
                        counterparties.add(s_nbr)

        unique_counterparties = len(counterparties)

        # Compute leakage-safe graph structural score (0 - 100) based on degree velocity & counterparty fan-out
        degree_score = min(1.0, total_deg / 20.0) * 50.0
        counterparty_score = min(1.0, unique_counterparties / 10.0) * 50.0
        graph_risk_score = round(degree_score + counterparty_score, 2)

        return {
            "entity_id": entity_id,
            "node_type": self.node_types.get(entity_id, "ACCOUNT"),
            "in_degree": in_deg,
            "out_degree": out_deg,
            "total_degree": total_deg,
            "unique_counterparties": unique_counterparties,
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
            n_type = self.node_types.get(n, "ACCOUNT")
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
