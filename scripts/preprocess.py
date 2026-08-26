import os
import sys
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.preprocessing.pipeline import PaySimPipeline

def main():
    parser = argparse.ArgumentParser(description="PaySim Preprocessing & Feature Pipeline Script")
    parser.add_argument("--raw-path", type=str, default=r"C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv", help="Path to raw PaySim CSV")
    parser.add_argument("--output-dir", type=str, default="data/processed", help="Output directory for processed CSVs")
    parser.add_argument("--split-step", type=int, default=355, help="Step boundary for chronological split")
    parser.add_argument("--sample-nrows", type=int, default=None, help="Optional row limit for dev testing")

    args = parser.parse_args()

    print(f"Initializing PaySim Pipeline with raw CSV: {args.raw_path}")
    pipeline = PaySimPipeline(raw_csv_path=args.raw_path)
    
    stats = pipeline.process_and_save(
        output_dir=args.output_dir,
        split_step=args.split_step,
        sample_nrows=args.sample_nrows
    )

    print("\n--- PREPROCESSING COMPLETED ---")
    print(f"Total Rows Processed: {stats['total_rows_processed']:,}")
    print(f"Train Rows: {stats['train_rows']:,} (Fraud: {stats['train_fraud_count']:,} | {stats['train_fraud_pct']}%)")
    print(f"Test Rows:  {stats['test_rows']:,} (Fraud: {stats['test_fraud_count']:,} | {stats['test_fraud_pct']}%)")
    print(f"Saved Train Set: {stats['train_path']}")
    print(f"Saved Test Set:  {stats['test_path']}")

if __name__ == "__main__":
    main()
