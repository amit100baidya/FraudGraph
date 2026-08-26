import os
import sys
import pickle
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
from sklearn.metrics import (
    roc_auc_score, precision_recall_curve, auc,
    f1_score, precision_score, recall_score, confusion_matrix
)

class FraudModelTrainer:
    """
    Supervised Machine Learning Model Trainer for FraudGraph.
    Trains and evaluates XGBoost, Random Forest, and Logistic Regression baseline models.
    Supports saving artifacts and evaluating chronological train/test splits.
    """

    FEATURE_COLS = [
        "amount", "amount_log", "error_balance_orig", "error_balance_dest",
        "is_zero_newbalance_orig", "is_zero_oldbalance_dest",
        "amount_to_oldbalance_orig_ratio", "step_hour", "step_day",
        "is_transfer", "is_cash_out", "is_payment", "is_cash_in", "is_debit",
        "is_high_risk_type", "dest_is_merchant", "orig_total_tx_count",
        "dest_total_tx_count", "orig_is_also_dest", "dest_is_also_orig"
    ]

    TARGET_COL = "isFraud"

    def __init__(self, model_type: str = "xgboost"):
        self.model_type = model_type.lower()
        self.model = None
        self.feature_names = self.FEATURE_COLS

    def prepare_data(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Extracts feature matrices and target vectors from DataFrames."""
        # Ensure missing feature columns are filled with default 0
        for col in self.FEATURE_COLS:
            if col not in train_df.columns:
                train_df[col] = 0
            if col not in test_df.columns:
                test_df[col] = 0

        X_train = train_df[self.FEATURE_COLS].values
        y_train = train_df[self.TARGET_COL].values
        X_test = test_df[self.FEATURE_COLS].values
        y_test = test_df[self.TARGET_COL].values

        return X_train, y_train, X_test, y_test

    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> Any:
        """Trains the chosen classifier model."""
        scale_pos_weight = (len(y_train) - sum(y_train)) / max(1, sum(y_train))

        if self.model_type == "xgboost":
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                scale_pos_weight=scale_pos_weight,
                random_state=42,
                eval_metric="logloss"
            )
        elif self.model_type == "random_forest":
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == "logistic_regression":
            self.model = LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model_type: {self.model_type}")

        self.model.fit(X_train, y_train)
        return self.model

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
        """Evaluates trained model using PR-AUC, ROC-AUC, F1, Precision, and Recall."""
        if self.model is None:
            raise RuntimeError("Model must be trained before evaluation.")

        y_prob = self.model.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= threshold).astype(int)

        roc_auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 0.0
        precision_vec, recall_vec, _ = precision_recall_curve(y_test, y_prob)
        pr_auc = float(auc(recall_vec, precision_vec))

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)

        metrics = {
            "model_type": self.model_type,
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "confusion_matrix": {
                "tn": int(tn), "fp": int(fp),
                "fn": int(fn), "tp": int(tp)
            }
        }
        return metrics

    def save_model(self, output_dir: str = "ml/models") -> Dict[str, str]:
        """Saves model pickle and feature name mapping."""
        os.makedirs(output_dir, exist_ok=True)
        model_path = os.path.join(output_dir, f"{self.model_type}_model.pkl")
        meta_path = os.path.join(output_dir, f"{self.model_type}_metadata.json")

        with open(model_path, "wb") as f:
            pickle.dump(self.model, f)

        meta = {
            "model_type": self.model_type,
            "feature_names": self.feature_names
        }
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        return {"model_path": model_path, "meta_path": meta_path}

    def load_model(self, model_dir: str = "ml/models"):
        """Loads serialized model artifact."""
        model_path = os.path.join(model_dir, f"{self.model_type}_model.pkl")
        meta_path = os.path.join(model_dir, f"{self.model_type}_metadata.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")

        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                meta = json.load(f)
                self.feature_names = meta.get("feature_names", self.FEATURE_COLS)


def main():
    train_path = "data/processed/train.csv"
    test_path = "data/processed/test.csv"

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        print("Processed train/test files not found. Run preprocessing script first.")
        return

    print("Loading processed datasets...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    trainer = FraudModelTrainer(model_type="xgboost")
    X_train, y_train, X_test, y_test = trainer.prepare_data(train_df, test_df)

    print(f"Training XGBoost model on {len(X_train)} samples...")
    trainer.train(X_train, y_train)

    print("Evaluating XGBoost model on chronological test set...")
    metrics = trainer.evaluate(X_test, y_test)
    print("\n--- MODEL EVALUATION RESULTS ---")
    print(json.dumps(metrics, indent=2))

    paths = trainer.save_model("ml/models")
    print(f"\nModel saved to {paths['model_path']}")

if __name__ == "__main__":
    main()
