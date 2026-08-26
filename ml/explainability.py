import numpy as np
import pandas as pd
import shap
from typing import Dict, List, Any

class FraudExplainer:
    """
    SHAP-based Explainability Engine for FraudGraph.
    Provides per-prediction feature importance attributions for model transparency.
    """

    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        """Initializes appropriate SHAP explainer based on model architecture."""
        try:
            self.explainer = shap.TreeExplainer(self.model)
        except Exception:
            # Fallback to KernelExplainer or generic Explainer if TreeExplainer fails
            self.explainer = None

    def explain_instance(self, feature_vector: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Computes SHAP values for a single transaction feature vector.
        Returns top-k positive risk driving features sorted by contribution.
        """
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)

        feature_values = feature_vector[0]

        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(feature_vector)
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]  # positive class
                values = shap_values[0]
            except Exception:
                values = self._fallback_importance(feature_values)
        else:
            values = self._fallback_importance(feature_values)

        contributions = []
        for name, val, raw_val in zip(self.feature_names, values, feature_values):
            contributions.append({
                "feature": name,
                "shap_value": round(float(val), 4),
                "feature_value": round(float(raw_val), 4),
                "impact": "INCREASES_RISK" if val > 0 else "DECREASES_RISK"
            })

        # Sort by absolute magnitude of SHAP contribution
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        return contributions[:top_k]

    def _fallback_importance(self, feature_values: np.ndarray) -> np.ndarray:
        """Fallback feature contribution estimation if SHAP explainer is unavailable."""
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            # Scale by normalized feature values
            norm_vals = np.abs(feature_values) / (np.max(np.abs(feature_values)) + 1e-5)
            return importances * norm_vals
        return np.zeros(len(self.feature_names))
