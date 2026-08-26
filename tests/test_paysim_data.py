import pytest
import os
import pandas as pd
from ml.preprocessing.pipeline import PaySimPipeline

RAW_CSV_PATH = r"C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv"
SAMPLE_CSV_PATH = r"data/sample/paysim_sample.csv"

def test_raw_dataset_exists():
    """Verify that raw PaySim CSV dataset exists."""
    assert os.path.exists(RAW_CSV_PATH), f"Raw dataset missing at {RAW_CSV_PATH}"

def test_pipeline_schema_validation():
    """Verify schema validation on sample PaySim data."""
    pipeline = PaySimPipeline(raw_csv_path=SAMPLE_CSV_PATH)
    df = pipeline.load_raw_data()
    
    assert len(df) > 0
    assert "step" in df.columns
    assert "isFraud" in df.columns
    assert df.isnull().sum().sum() == 0, "PaySim sample contains unexpected missing values"

def test_behavioral_feature_engineering():
    """Verify that behavioral feature engineering generates correct columns and no NaNs."""
    pipeline = PaySimPipeline(raw_csv_path=SAMPLE_CSV_PATH)
    df_raw = pipeline.load_raw_data(nrows=100)
    df_feat = pipeline.engineer_behavioral_features(df_raw)

    expected_features = [
        "amount_log", "error_balance_orig", "error_balance_dest",
        "is_zero_newbalance_orig", "is_zero_oldbalance_dest",
        "amount_to_oldbalance_orig_ratio", "step_hour", "step_day",
        "is_transfer", "is_cash_out", "is_high_risk_type", "dest_is_merchant"
    ]
    
    for feature in expected_features:
        assert feature in df_feat.columns, f"Missing engineered feature: {feature}"
        assert df_feat[feature].isnull().sum() == 0, f"NaNs found in feature: {feature}"

def test_temporal_train_test_split():
    """Verify strict chronological splitting with zero temporal overlap."""
    pipeline = PaySimPipeline(raw_csv_path=SAMPLE_CSV_PATH)
    df_raw = pipeline.load_raw_data()
    
    split_step = 355
    train_df, test_df = pipeline.temporal_split(df_raw, split_step=split_step)

    assert len(train_df) > 0
    assert len(test_df) > 0

    # Ensure max step in train <= split_step
    assert train_df["step"].max() <= split_step
    # Ensure min step in test > split_step
    assert test_df["step"].min() > split_step
    # Ensure train and test step intersection is completely empty
    train_steps = set(train_df["step"].unique())
    test_steps = set(test_df["step"].unique())
    assert len(train_steps.intersection(test_steps)) == 0, "Temporal leakage detected between train and test steps!"

def test_raw_csv_unmodified():
    """Verify raw PaySim CSV timestamp/integrity remains untouched."""
    pipeline = PaySimPipeline(raw_csv_path=SAMPLE_CSV_PATH)
    initial_mod_time = os.path.getmtime(RAW_CSV_PATH)
    
    # Perform load and feature engineering
    _ = pipeline.load_raw_data(nrows=10)
    
    final_mod_time = os.path.getmtime(RAW_CSV_PATH)
    assert initial_mod_time == final_mod_time, "Raw CSV file was modified during processing!"
