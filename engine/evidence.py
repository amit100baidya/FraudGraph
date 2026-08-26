import os
from typing import Dict, List, Any

class EvidenceEngine:
    """
    Evidence Engine for FraudGraph.
    Assembles traceable Evidence Objects mapping risk flags directly back to raw transactional,
    SHAP, graph structural, and behavioral evidence paths.
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
        
        # 1. Structural device/IP sharing paths
        shared_users = graph_metrics.get("shared_users_count", 0)
        if shared_users > 1:
            evidence_paths.append({
                "type": "SHARED_ENTITY_LINK",
                "severity": "HIGH" if shared_users > 3 else "MEDIUM",
                "description": f"Account {orig_account} shares Device/IP resources with {shared_users - 1} other distinct customer accounts."
            })

        # 2. Fraud neighbor paths
        fraud_ratio = graph_metrics.get("neighbor_fraud_ratio", 0.0)
        if fraud_ratio > 0.0:
            evidence_paths.append({
                "type": "FRAUD_NEIGHBOR_EXPOSURE",
                "severity": "CRITICAL" if fraud_ratio >= 0.5 else "HIGH",
                "description": f"{round(fraud_ratio * 100, 1)}% of direct graph 2-hop neighbors have confirmed historical fraud flags."
            })

        # 3. Behavioral balance drain path
        top_shap_features = [c["feature"] for c in shap_contributions[:3] if c["impact"] == "INCREASES_RISK"]
        if "is_zero_newbalance_orig" in top_shap_features or "error_balance_orig" in top_shap_features:
            evidence_paths.append({
                "type": "BALANCE_DRAIN_ANOMALY",
                "severity": "HIGH",
                "description": f"Source account balance was completely zeroed out following high-risk {tx_type} transaction."
            })

        # 4. Ring membership path
        if cluster_info and cluster_info.get("suspicion_score", 0) > 50.0:
            evidence_paths.append({
                "type": "COORDINATED_RING_MEMBERSHIP",
                "severity": "CRITICAL",
                "description": f"Part of detected suspicious cluster {cluster_info.get('cluster_id')} with ring suspicion score {cluster_info.get('suspicion_score')}/100."
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
