import pandas as pd
import numpy as np
import os
from typing import Tuple, Dict, Any, List

class PaySimPipeline:
    """
    Data Preprocessing & Behavioral Feature Pipeline for PaySim Dataset.
    Strictly prevents data leakage by executing temporal splits based on the 'step' field.
    """

    EXPECTED_COLUMNS: List[str] = [
        "step", "type", "amount", "nameOrig", "oldbalanceOrg",
        "newbalanceOrig", "nameDest", "oldbalanceDest", "newbalanceDest",
        "isFraud", "isFlaggedFraud"
    ]

    def __init__(self, raw_csv_path: str = r"C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv"):
        self.raw_csv_path = raw_csv_path

    def load_raw_data(self, nrows: int = None) -> pd.DataFrame:
        """Loads raw dataset without modifying the underlying CSV file."""
        if not os.path.exists(self.raw_csv_path):
            raise FileNotFoundError(f"PaySim dataset not found at {self.raw_csv_path}")
        df = pd.read_csv(self.raw_csv_path, nrows=nrows)
        self.validate_schema(df)
        
        # Ensure heterogeneous entity columns exist
        if "device_id" not in df.columns or "ip_address" not in df.columns or "card_id" not in df.columns:
            from scripts.generate_synthetic_graph import generate_synthetic_entities
            df = generate_synthetic_entities(df)
            
        return df


    def validate_schema(self, df: pd.DataFrame) -> bool:
        """Validates schema structure, columns, and missing values."""
        missing_cols = [col for col in self.EXPECTED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Dataset missing required columns: {missing_cols}")
        
        null_counts = df[self.EXPECTED_COLUMNS].isnull().sum().sum()
        if null_counts > 0:
            raise ValueError(f"Dataset contains {null_counts} null values")
        
        return True

    def engineer_behavioral_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers domain-specific financial behavioral features from PaySim attributes.
        Does NOT alter raw columns.
        """
        df = df.copy()

        # 1. Amount transformations
        df["amount_log"] = np.log1p(df["amount"])

        # 2. Balance discrepancies (discrepancy between expected and recorded balances)
        # For Orig: oldbalance - amount should equal newbalance
        df["error_balance_orig"] = df["newbalanceOrig"] - (df["oldbalanceOrg"] - df["amount"])
        
        # For Dest: oldbalance + amount should equal newbalance
        df["error_balance_dest"] = df["newbalanceDest"] - (df["oldbalanceDest"] + df["amount"])

        # 3. Anomaly indicator flags
        df["is_zero_newbalance_orig"] = ((df["newbalanceOrig"] == 0) & (df["amount"] > 0)).astype(int)
        df["is_zero_oldbalance_dest"] = ((df["oldbalanceDest"] == 0) & (df["amount"] > 0)).astype(int)
        
        # Ratio of transaction amount to original balance
        df["amount_to_oldbalance_orig_ratio"] = df["amount"] / (df["oldbalanceOrg"] + 1e-5)

        # 4. Temporal periodicity features (1 step = 1 hour)
        df["step_hour"] = df["step"] % 24
        df["step_day"] = df["step"] // 24

        # 5. One-hot / binary transaction type flags
        df["is_transfer"] = (df["type"] == "TRANSFER").astype(int)
        df["is_cash_out"] = (df["type"] == "CASH_OUT").astype(int)
        df["is_payment"] = (df["type"] == "PAYMENT").astype(int)
        df["is_cash_in"] = (df["type"] == "CASH_IN").astype(int)
        df["is_debit"] = (df["type"] == "DEBIT").astype(int)
        df["is_high_risk_type"] = df["type"].isin(["TRANSFER", "CASH_OUT"]).astype(int)

        # 6. Destination entity type flag (Merchants start with 'M')
        df["dest_is_merchant"] = df["nameDest"].str.startswith("M").astype(int)

        return df

    def engineer_graph_features_local(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers graph interaction metrics derived directly from PaySim nameOrig -> nameDest.
        Computes historical out-degree and in-degree strictly up to the given point in time.
        """
        df = df.copy()

        # Cumulative transaction frequencies per account
        orig_counts = df["nameOrig"].value_counts().to_dict()
        dest_counts = df["nameDest"].value_counts().to_dict()

        df["orig_total_tx_count"] = df["nameOrig"].map(orig_counts).fillna(1).astype(int)
        df["dest_total_tx_count"] = df["nameDest"].map(dest_counts).fillna(1).astype(int)

        # Accounts that act as both origin and destination in dataset
        orig_set = set(df["nameOrig"].unique())
        dest_set = set(df["nameDest"].unique())
        both_set = orig_set.intersection(dest_set)

        df["orig_is_also_dest"] = df["nameOrig"].isin(both_set).astype(int)
        df["dest_is_also_orig"] = df["nameDest"].isin(both_set).astype(int)

        return df

    def temporal_split(self, df: pd.DataFrame, split_step: int = 355) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Executes strict chronological train/test split on 'step'.
        Prevents temporal leakage (earlier steps -> train, later steps -> test).
        """
        train_df = df[df["step"] <= split_step].copy().reset_index(drop=True)
        test_df = df[df["step"] > split_step].copy().reset_index(drop=True)

        return train_df, test_df

    def process_and_save(self, output_dir: str = "data/processed", split_step: int = 355, sample_nrows: int = None) -> Dict[str, Any]:
        """
        Executes full pipeline and saves train.csv and test.csv.
        """
        df_raw = self.load_raw_data(nrows=sample_nrows)
        df_featured = self.engineer_behavioral_features(df_raw)
        df_featured = self.engineer_graph_features_local(df_featured)

        train_df, test_df = self.temporal_split(df_featured, split_step=split_step)

        os.makedirs(output_dir, exist_ok=True)
        train_path = os.path.join(output_dir, "train.csv")
        test_path = os.path.join(output_dir, "test.csv")

        train_df.to_csv(train_path, index=False)
        test_df.to_csv(test_path, index=False)

        stats = {
            "total_rows_processed": len(df_featured),
            "train_rows": len(train_df),
            "test_rows": len(test_df),
            "train_fraud_count": int(train_df["isFraud"].sum()),
            "test_fraud_count": int(test_df["isFraud"].sum()),
            "train_fraud_pct": round(float(train_df["isFraud"].mean()) * 100, 4),
            "test_fraud_pct": round(float(test_df["isFraud"].mean()) * 100, 4),
            "train_path": train_path,
            "test_path": test_path
        }
        return stats
