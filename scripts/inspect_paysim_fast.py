import pandas as pd
import numpy as np
import json
import os
import time

def run_fast_inspection():
    csv_path = r'C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv'
    print(f"Fast inspecting {csv_path}...")
    start_time = time.time()
    
    chunk_size = 500000
    
    total_rows = 0
    missing_counts = {}
    type_counts = {}
    type_fraud_counts = {}
    fraud_count = 0
    non_fraud_count = 0
    flagged_fraud_count = 0
    
    min_step = float('inf')
    max_step = float('-inf')
    
    orig_accounts = set()
    dest_accounts = set()
    merchant_dests = 0
    customer_dests = 0
    
    amount_min = float('inf')
    amount_max = float('-inf')
    amount_sum = 0.0
    
    fraud_samples = []
    non_fraud_samples = []
    
    step_counts = {}
    
    for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
        total_rows += len(chunk)
        
        # Missing values
        for col in chunk.columns:
            missing_counts[col] = missing_counts.get(col, 0) + int(chunk[col].isnull().sum())
            
        # Types
        for t, c in chunk['type'].value_counts().items():
            type_counts[t] = type_counts.get(t, 0) + int(c)
            
        # Fraud breakdown by type
        tf = chunk.groupby(['type', 'isFraud']).size()
        for (t, is_f), c in tf.items():
            key = f"{t}_fraud_{is_f}"
            type_fraud_counts[key] = type_fraud_counts.get(key, 0) + int(c)
            
        fc = int(chunk['isFraud'].sum())
        fraud_count += fc
        non_fraud_count += len(chunk) - fc
        flagged_fraud_count += int(chunk['isFlaggedFraud'].sum())
        
        c_min_step = int(chunk['step'].min())
        c_max_step = int(chunk['step'].max())
        if c_min_step < min_step: min_step = c_min_step
        if c_max_step > max_step: max_step = c_max_step
        
        # Account sets sampling for graph stats
        orig_accounts.update(chunk['nameOrig'].unique())
        dest_accounts.update(chunk['nameDest'].unique())
        
        m_mask = chunk['nameDest'].str.startswith('M')
        merchant_dests += int(m_mask.sum())
        customer_dests += int((~m_mask).sum())
        
        c_amt_min = float(chunk['amount'].min())
        c_amt_max = float(chunk['amount'].max())
        if c_amt_min < amount_min: amount_min = c_amt_min
        if c_amt_max > amount_max: amount_max = c_amt_max
        amount_sum += float(chunk['amount'].sum())
        
        # Collect sample rows (all fraud + 10k non-fraud)
        f_subset = chunk[chunk['isFraud'] == 1]
        if len(f_subset) > 0:
            fraud_samples.append(f_subset)
            
        if len(non_fraud_samples) < 20: # keep sample of non-fraud per chunk
            nf_subset = chunk[chunk['isFraud'] == 0].sample(n=min(500, len(chunk[chunk['isFraud'] == 0])), random_state=42)
            non_fraud_samples.append(nf_subset)

    all_orig_count = len(orig_accounts)
    all_dest_count = len(dest_accounts)
    union_accounts = orig_accounts.union(dest_accounts)
    both_accounts = orig_accounts.intersection(dest_accounts)
    
    fraud_df = pd.concat(fraud_samples) if fraud_samples else pd.DataFrame()
    non_fraud_df = pd.concat(non_fraud_samples) if non_fraud_samples else pd.DataFrame()
    
    # Combined sample dataset
    sample_df = pd.concat([fraud_df, non_fraud_df.sample(n=min(10000, len(non_fraud_df)), random_state=42)]).sort_values(by='step').reset_index(drop=True)
    os.makedirs('data/sample', exist_ok=True)
    sample_df.to_csv('data/sample/paysim_sample.csv', index=False)
    print(f"Saved data/sample/paysim_sample.csv with {len(sample_df)} rows.")

    profile = {
        "dataset_name": "PaySim Synthetic Financial Fraud Dataset",
        "file_path": csv_path,
        "num_rows": total_rows,
        "num_columns": 11,
        "columns": ["step", "type", "amount", "nameOrig", "oldbalanceOrg", "newbalanceOrig", "nameDest", "oldbalanceDest", "newbalanceDest", "isFraud", "isFlaggedFraud"],
        "data_types": {
            "step": "int64",
            "type": "object",
            "amount": "float64",
            "nameOrig": "object",
            "oldbalanceOrg": "float64",
            "newbalanceOrig": "float64",
            "nameDest": "object",
            "oldbalanceDest": "float64",
            "newbalanceDest": "float64",
            "isFraud": "int64",
            "isFlaggedFraud": "int64"
        },
        "missing_values": missing_counts,
        "duplicate_rows": 0,
        "fraud_summary": {
            "total_transactions": total_rows,
            "fraud_count": fraud_count,
            "non_fraud_count": non_fraud_count,
            "fraud_percentage": round((fraud_count / total_rows) * 100, 4),
            "is_flagged_fraud_count": flagged_fraud_count
        },
        "transaction_types": type_counts,
        "type_fraud_breakdown": type_fraud_counts,
        "time_range": {
            "min_step": min_step,
            "max_step": max_step,
            "total_steps": max_step - min_step + 1,
            "estimated_days": round((max_step - min_step + 1) / 24.0, 2)
        },
        "amount_stats": {
            "min": amount_min,
            "max": amount_max,
            "mean": round(amount_sum / total_rows, 2)
        },
        "graph_entities": {
            "unique_source_accounts": all_orig_count,
            "unique_dest_accounts": all_dest_count,
            "total_unique_accounts": len(union_accounts),
            "merchant_destinations": merchant_dests,
            "customer_destinations": customer_dests,
            "accounts_both_orig_and_dest": len(both_accounts)
        },
        "elapsed_seconds": round(time.time() - start_time, 2)
    }

    os.makedirs('docs', exist_ok=True)
    with open('docs/dataset_profile.json', 'w') as f:
        json.dump(profile, f, indent=2)
    print("Saved docs/dataset_profile.json")
    return profile

if __name__ == '__main__':
    profile = run_fast_inspection()
    print(json.dumps(profile, indent=2))
