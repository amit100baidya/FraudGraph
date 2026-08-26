import os
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    """Abstract interface for AI Fraud Analyst LLM providers."""

    @abstractmethod
    def generate_investigation_summary(self, evidence_object: Dict[str, Any]) -> str:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Local template-driven Mock Provider.
    Synthesizes defensive, structured natural language summaries based strictly on the Evidence Object.
    """

    def generate_investigation_summary(self, evidence: Dict[str, Any]) -> str:
        tx_id = evidence.get("transaction_id", "N/A")
        orig = evidence.get("orig_account", "N/A")
        dest = evidence.get("dest_account", "N/A")
        amount = evidence.get("amount", 0.0)
        tx_type = evidence.get("tx_type", "TRANSFER")

        risk = evidence.get("risk_assessment", {})
        score = risk.get("final_risk_score", 0.0)
        level = risk.get("risk_level", "LOW")
        action = risk.get("recommended_action", "APPROVE")

        breakdown = risk.get("score_breakdown", {})
        ml_score = breakdown.get("ml_risk_score", 0.0)
        graph_score = breakdown.get("graph_risk_score", 0.0)
        behavior_score = breakdown.get("behavioral_risk_score", 0.0)

        paths = evidence.get("evidence_paths", [])
        path_texts = []
        for p in paths:
            path_texts.append(f"- **[{p.get('severity')}] {p.get('type')}**: {p.get('description')}")

        paths_summary = "\n".join(path_texts) if path_texts else "- No critical structural anomalies detected."

        drivers = evidence.get("top_risk_drivers", [])
        driver_texts = []
        for d in drivers[:3]:
            driver_texts.append(f"`{d.get('feature')}` (value: {d.get('feature_value')}, SHAP: {d.get('shap_value')})")
        drivers_str = ", ".join(driver_texts) if driver_texts else "None"

        summary = f"""### 🛡️ AI Fraud Analyst Investigation Summary

**Transaction Ref**: `{tx_id}`  
**Source Account**: `{orig}` $\\rightarrow$ **Destination**: `{dest}`  
**Amount**: `${amount:,.2f}` | **Type**: `{tx_type}` | **Composite Risk Score**: `{score}/100` (`{level}`)  

---

#### 1. Key Finding & Verdict
Transaction `{tx_id}` exhibits a composite risk score of **{score}/100**, placing it in the **{level}** risk threshold. The recommended defensive action is **`{action}`**.

#### 2. Risk Score Breakdown
- **Supervised ML Model Score**: `{ml_score}/100` (XGBoost behavioral classifier)
- **Heterogeneous Graph Score**: `{graph_score}/100` (Shared entity & neighbor analysis)
- **Behavioral Velocity Score**: `{behavior_score}/100` (Balance discrepancy & type risk)

#### 3. Key Evidence Paths
{paths_summary}

#### 4. Feature Attributions (SHAP)
Primary model drivers elevating risk score: {drivers_str}.

#### 5. Recommended Investigation Guidance
- Review source account `{orig}` for potential account takeover (ATO) or balance drain sequence.
- Inspect shared device/IP nodes connected to `{orig}` for potential syndicate activity.
- Execute recommended action: **`{action}`**.
"""
        return summary.strip()


def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning active LLM provider."""
    # Defaults to MockLLMProvider for offline reliability
    return MockLLMProvider()
