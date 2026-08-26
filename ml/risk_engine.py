import numpy as np
from typing import Dict, Any, List

class RiskFusionEngine:
    """
    Risk Fusion Engine for FraudGraph.
    Fuses Supervised ML risk, Graph structural risk, and Behavioral velocity risk
    into a unified calibrated composite risk score (0 - 100).
    """

    def __init__(self, w_ml: float = 0.50, w_graph: float = 0.35, w_behavior: float = 0.15):
        self.w_ml = w_ml
        self.w_graph = w_graph
        self.w_behavior = w_behavior

    def compute_behavioral_score(self, feature_dict: Dict[str, Any]) -> float:
        """Computes behavioral anomaly score based on financial balance & velocity flags."""
        score = 0.0

        # Balance zeroing (emptied sender account)
        if feature_dict.get("is_zero_newbalance_orig", 0) == 1:
            score += 40.0
        
        # High risk transaction type (TRANSFER or CASH_OUT)
        if feature_dict.get("is_high_risk_type", 0) == 1:
            score += 20.0

        # Large discrepancy between expected and recorded balance
        err_orig = abs(feature_dict.get("error_balance_orig", 0.0))
        if err_orig > 1000.0:
            score += 25.0

        # Amount to old balance ratio high (> 0.8)
        ratio = feature_dict.get("amount_to_oldbalance_orig_ratio", 0.0)
        if ratio > 0.8:
            score += 15.0

        return min(100.0, score)

    def evaluate_transaction_risk(
        self,
        ml_prob: float,
        graph_risk_score: float,
        feature_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Fuses risk scores and returns calibrated composite risk assessment.
        """
        s_ml = float(ml_prob * 100.0)
        s_graph = float(graph_risk_score)
        s_behavior = float(self.compute_behavioral_score(feature_dict))

        r_final = (self.w_ml * s_ml) + (self.w_graph * s_graph) + (self.w_behavior * s_behavior)
        r_final = round(float(np.clip(r_final, 0.0, 100.0)), 2)

        risk_level = self.categorize_risk_level(r_final)
        action = self.recommend_action(r_final)

        return {
            "final_risk_score": r_final,
            "risk_level": risk_level,
            "recommended_action": action,
            "score_breakdown": {
                "ml_risk_score": round(s_ml, 2),
                "graph_risk_score": round(s_graph, 2),
                "behavioral_risk_score": round(s_behavior, 2)
            },
            "fusion_weights": {
                "w_ml": self.w_ml,
                "w_graph": self.w_graph,
                "w_behavior": self.w_behavior
            }
        }

    @staticmethod
    def categorize_risk_level(score: float) -> str:
        if score >= 85.0:
            return "CRITICAL"
        elif score >= 60.0:
            return "HIGH"
        elif score >= 25.0:
            return "MEDIUM"
        return "LOW"

    @staticmethod
    def recommend_action(score: float) -> str:
        if score >= 85.0:
            return "MANUAL_REVIEW"
        elif score >= 60.0:
            return "STEP_UP_VERIFICATION"
        elif score >= 25.0:
            return "MONITOR"
        return "APPROVE"
