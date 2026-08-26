import os
import sys
import numpy as np
import pandas as pd
import random
from typing import Dict, List, Tuple

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def generate_synthetic_entities(
    df: pd.DataFrame,
    seed: int = 42
) -> pd.DataFrame:
    """
    Enriches PaySim transactions with realistic heterogeneous entities:
    - Device IDs (`device_id`)
    - IP Addresses (`ip_address`)
    - Payment Card Tokens (`card_id`)

    Injects coordinated fraud ring topology where fraudulent accounts share
    devices, IPs, and cards at a much higher frequency than legitimate users.
    """
    np.random.seed(seed)
    random.seed(seed)

    df = df.copy()
    unique_orig = df["nameOrig"].unique()
    unique_dest = df["nameDest"].unique()
    all_accounts = list(set(unique_orig).union(set(unique_dest)))

    num_accounts = len(all_accounts)

    # 1. Generate realistic pool of devices, IPs, cards
    num_devices = max(100, int(num_accounts * 0.45))
    num_ips = max(100, int(num_accounts * 0.50))
    num_cards = max(100, int(num_accounts * 0.70))

    device_pool = [f"DEV_{i:06d}" for i in range(num_devices)]
    ip_pool = [f"192.168.{(i // 254) % 254}.{i % 254 + 1}" for i in range(num_ips)]
    card_pool = [f"CARD_{i:06d}" for i in range(num_cards)]

    # 2. Account-to-entity default assignment
    account_device_map: Dict[str, str] = {}
    account_ip_map: Dict[str, str] = {}
    account_card_map: Dict[str, str] = {}

    for acc in all_accounts:
        account_device_map[acc] = random.choice(device_pool)
        account_ip_map[acc] = random.choice(ip_pool)
        account_card_map[acc] = random.choice(card_pool)

    # 3. Create Coordinated Fraud Rings (Shared Entities across Fraudsters)
    fraud_mask = df["isFraud"] == 1
    fraud_df = df[fraud_mask]
    fraud_accounts = list(set(fraud_df["nameOrig"].unique()).union(set(fraud_df["nameDest"].unique())))

    # Form small fraud rings (3-8 accounts per ring) sharing 1 device / 1 IP
    num_rings = max(1, len(fraud_accounts) // 5)
    for ring_idx in range(num_rings):
        ring_device = f"DEV_FRAUD_RING_{ring_idx:03d}"
        ring_ip = f"10.0.99.{ring_idx + 1}"
        ring_card = f"CARD_FRAUD_RING_{ring_idx:03d}"
        
        # Pick 3 to 8 fraud accounts for this ring
        ring_members = fraud_accounts[ring_idx * 5 : (ring_idx + 1) * 5]
        for member in ring_members:
            account_device_map[member] = ring_device
            account_ip_map[member] = ring_ip
            account_card_map[member] = ring_card

    # 4. Map entities to DataFrame
    df["device_id"] = df["nameOrig"].map(account_device_map).fillna("DEV_UNKNOWN")
    df["ip_address"] = df["nameOrig"].map(account_ip_map).fillna("127.0.0.1")
    df["card_id"] = df["nameOrig"].map(account_card_map).fillna("CARD_UNKNOWN")

    return df

def main():
    sample_path = "data/sample/paysim_sample.csv"
    output_path = "data/sample/paysim_sample_enriched.csv"

    if not os.path.exists(sample_path):
        print(f"Sample dataset not found at {sample_path}")
        return

    print(f"Loading sample dataset from {sample_path}...")
    df = pd.read_csv(sample_path)

    print("Generating synthetic heterogeneous graph entities (Devices, IPs, Cards)...")
    enriched_df = generate_synthetic_entities(df)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    enriched_df.to_csv(output_path, index=False)
    print(f"Enriched sample dataset saved to {output_path}")
    print(f"Total rows: {len(enriched_df)}")
    print(f"Unique Devices: {enriched_df['device_id'].nunique()}")
    print(f"Unique IPs: {enriched_df['ip_address'].nunique()}")
    print(f"Unique Cards: {enriched_df['card_id'].nunique()}")

if __name__ == "__main__":
    main()
