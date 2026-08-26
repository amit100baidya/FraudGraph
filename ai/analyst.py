from typing import Dict, Any
from ai.provider import get_llm_provider, BaseLLMProvider

class AIFraudAnalyst:
    """
    AI Fraud Analyst Layer for FraudGraph.
    Synthesizes structured Evidence Objects into clear, defensive, executive investigation reports.
    """

    def __init__(self, provider: BaseLLMProvider = None):
        self.provider = provider or get_llm_provider()

    def generate_report(self, evidence_object: Dict[str, Any]) -> str:
        """Generates natural language report for the given evidence object."""
        return self.provider.generate_investigation_summary(evidence_object)
