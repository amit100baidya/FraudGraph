import pandas as pd
import numpy as np
import json
import os

def inspect_dataset():
    csv_path = r'C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv'
    print(f"Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"Dataset Loaded. Shape: {df.shape}")
    
    # 1. basic properties
    num_rows, num_cols = df.shape
    cols = df.columns.tolist()
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
    missing_vals = df.isnull().sum().to_dict()
    num_duplicates = int(df.duplicated().sum())
    
    # 2. Fraud stats
    fraud_counts = df['isFraud'].value_counts().to_dict()
    total_tx = len(df)
    fraud_cnt = fraud_counts.get(1, 0)
    non_fraud_cnt = fraud_counts.get(0, 0)
    fraud_pct = (fraud_cnt / total_tx) * 100.0
    
    flagged_counts = df['isFlaggedFraud'].value_counts().to_dict()
    
    # 3. Transaction types
    type_counts = df['type'].value_counts().to_dict()
    type_fraud = df.groupby(['type', 'isFraud']).size().unstack(fill_value=0).to_dict(orient='index')
    
    # 4. Numerical statistics
    num_cols_list = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 'step']
    stats_overall = df[num_cols_list].describe().to_dict()
    stats_fraud = df[df['isFraud'] == 1][num_cols_list].describe().to_dict()
    stats_non_fraud = df[df['isFraud'] == 0][num_cols_list].describe().to_dict()
    
    # 5. Accounts & Graph entity analysis
    unique_orig = df['nameOrig'].nunique()
    unique_dest = df['nameDest'].nunique()
    all_accounts = set(df['nameOrig']).union(set(df['nameDest']))
    total_unique_accounts = len(all_accounts)
    
    # Merchant vs Customer destinations
    is_dest_merchant = df['nameDest'].str.startswith('M')
    merchant_dest_count = int(is_dest_merchant.sum())
    customer_dest_count = int((~is_dest_merchant).sum())
    unique_merchants = df[is_dest_merchant]['nameDest'].nunique()
    unique_customer_dests = df[~is_dest_merchant]['nameDest'].nunique()
    
    # Accounts appearing as both source and destination
    orig_set = set(df['nameOrig'])
    dest_set = set(df['nameDest'])
    accounts_both = orig_set.intersection(dest_set)
    count_accounts_both = len(accounts_both)
    
    # Degree statistics
    orig_counts = df['nameOrig'].value_counts()
    dest_counts = df['nameDest'].value_counts()
    
    # Step/Time analysis
    min_step = int(df['step'].min())
    max_step = int(df['step'].max())
    total_steps = max_step - min_step + 1
    # 1 step = 1 hour (PaySim simulation standard)
    days_simulated = total_steps / 24.0
    
    # Step split threshold analysis (80/20 chronological split)
    step_quantiles = df['step'].quantile([0.5, 0.7, 0.8, 0.9]).to_dict()
    split_step = int(df['step'].quantile(0.8))
    train_df = df[df['step'] <= split_step]
    test_df = df[df['step'] > split_step]
    
    train_fraud = int(train_df['isFraud'].sum())
    test_fraud = int(test_df['isFraud'].sum())
    
    profile = {
        "dataset_name": "PaySim Synthetic Financial Fraud Dataset",
        "file_path": csv_path,
        "num_rows": num_rows,
        "num_columns": num_cols,
        "columns": cols,
        "data_types": dtypes,
        "missing_values": missing_vals,
        "duplicate_rows": num_duplicates,
        "fraud_summary": {
            "total_transactions": total_tx,
            "fraud_count": fraud_cnt,
            "non_fraud_count": non_fraud_cnt,
            "fraud_percentage": round(fraud_pct, 4),
            "is_flagged_fraud_counts": flagged_counts
        },
        "transaction_types": {
            "overall": type_counts,
            "fraud_breakdown": type_fraud
        },
        "numerical_stats": {
            "overall": stats_overall,
            "fraud": stats_fraud,
            "non_fraud": stats_non_fraud
        },
        "time_range": {
            "min_step": min_step,
            "max_step": max_step,
            "total_steps": total_steps,
            "estimated_days": round(days_simulated, 2),
            "step_80th_percentile": split_step,
            "train_set_rows": len(train_df),
            "test_set_rows": len(test_df),
            "train_fraud_count": train_fraud,
            "train_fraud_pct": round(train_fraud / len(train_df) * 100, 4),
            "test_fraud_count": test_fraud,
            "test_fraud_pct": round(test_fraud / len(test_df) * 100, 4)
        },
        "graph_entities": {
            "unique_source_accounts_nameOrig": unique_orig,
            "unique_dest_accounts_nameDest": unique_dest,
            "total_unique_accounts": total_unique_accounts,
            "merchant_destinations_count": merchant_dest_count,
            "customer_destinations_count": customer_dest_count,
            "unique_merchant_accounts": unique_merchants,
            "unique_customer_destinations": unique_customer_dests,
            "accounts_both_orig_and_dest": count_accounts_both,
            "max_orig_transactions": int(orig_counts.max()),
            "max_dest_transactions": int(dest_counts.max())
        }
    }
    
    # Save JSON profile
    os.makedirs('docs', exist_ok=True)
    with open('docs/dataset_profile.json', 'w') as f:
        json.dump(profile, f, indent=2)
    print("Saved docs/dataset_profile.json")
    
    # Generate reproducible sample dataset (data/sample/paysim_sample.csv)
    # Stratified sample: include ALL fraud cases + 10,000 random non-fraud cases for dev testing
    os.makedirs('data/sample', exist_ok=True)
    fraud_sample = df[df['isFraud'] == 1]
    non_fraud_sample = df[df['isFraud'] == 0].sample(n=10000, random_state=42)
    sample_df = pd.concat([fraud_sample, non_fraud_sample]).sort_values(by='step').reset_index(drop=True)
    sample_df.to_csv('data/sample/paysim_sample.csv', index=False)
    print(f"Saved data/sample/paysim_sample.csv with {len(sample_df)} rows ({len(fraud_sample)} fraud, 10000 non-fraud).")
    
    return profile

if __name__ == '__main__':
    profile = inspect_dataset()
    print("\n--- SUMMARY METRICS ---")
    print(f"Total Rows: {profile['num_rows']:,}")
    print(f"Fraud Rate: {profile['fraud_summary']['fraud_percentage']}% ({profile['fraud_summary']['fraud_count']:,} rows)")
    print(f"Transaction Types: {profile['transaction_types']['overall']}")
    print(f"Fraud Types: {profile['transaction_types']['fraud_breakdown']}")
    print(f"Unique Sources: {profile['graph_entities']['unique_source_accounts_nameOrig']:,}")
    print(f"Unique Destinations: {profile['graph_entities']['unique_dest_accounts_nameDest']:,}")
    print(f"Accounts both Orig & Dest: {profile['graph_entities']['accounts_both_orig_and_dest']:,}")
