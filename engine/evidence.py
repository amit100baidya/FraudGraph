import os
from typing import Dict, List, Any

class EvidenceEngine:
    """
    PaySim Evidence Engine for FraudGraph.
    Assembles traceable Evidence Objects mapping risk flags directly back to raw transactional,
    SHAP attributions, graph structural metrics, and account behavioral patterns.
    """

    def compile_evidence(
        self,
        transaction_id: str,
        orig_account: str,
        dest_account: str,
        amount: float,
        tx_type: str,
        step: int,
        risk_fusion_result: Dict[str, Any],
        shap_contributions: List[Dict[str, Any]],
        graph_metrics: Dict[str, Any],
        cluster_info: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Compiles standard Evidence Object payload."""
        
        # Build evidence paths
        evidence_paths = []
        
        # 1. Structural Account Counterparty / Degree Fan-Out
        unique_counterparties = graph_metrics.get("unique_counterparties", 0)
        total_degree = graph_metrics.get("total_degree", 0)
        if unique_counterparties > 3 or total_degree > 10:
            evidence_paths.append({
                "type": "ACCOUNT_DEGREE_ANOMALY",
                "severity": "HIGH" if unique_counterparties > 5 else "MEDIUM",
                "description": f"Account {orig_account} exhibits unusual connectivity with {unique_counterparties} distinct counterparties and total transaction degree of {total_degree}."
            })

        # 2. Behavioral balance drain path
        top_shap_features = [c["feature"] for c in shap_contributions[:3] if c.get("impact") == "INCREASES_RISK"]
        if "is_zero_newbalance_orig" in top_shap_features or "error_balance_orig" in top_shap_features:
            evidence_paths.append({
                "type": "BALANCE_DRAIN_ANOMALY",
                "severity": "HIGH",
                "description": f"Source account balance was completely zeroed out following high-risk {tx_type} transaction."
            })

        # 3. Coordinated Account Cluster membership path
        if cluster_info and cluster_info.get("suspicion_score", 0) > 50.0:
            evidence_paths.append({
                "type": "COORDINATED_RING_MEMBERSHIP",
                "severity": "CRITICAL",
                "description": f"Part of detected suspicious account cluster {cluster_info.get('cluster_id')} with suspicion score {cluster_info.get('suspicion_score')}/100."
            })

        evidence_object = {
            "transaction_id": transaction_id,
            "orig_account": orig_account,
            "dest_account": dest_account,
            "amount": amount,
            "tx_type": tx_type,
            "step": step,
            "risk_assessment": risk_fusion_result,
            "top_risk_drivers": shap_contributions[:5],
            "graph_evidence": graph_metrics,
            "evidence_paths": evidence_paths,
            "cluster_context": cluster_info or {}
        }

        return evidence_object
