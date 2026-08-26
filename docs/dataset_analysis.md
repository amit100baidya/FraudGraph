# PaySim Dataset Analysis & Preprocessing Specification

> **Razorpay AI Builder Track — AI Risk Manager**  
> Dataset: PaySim Synthetic Financial Transaction Dataset (`Dataset A — PaySim.csv`)

---

## 1. Dataset Overview & High-Level Statistics

- **File Path**: `C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv`
- **Total Transactions (Rows)**: `6,362,620`
- **Total Features (Columns)**: `11`
- **Missing Values**: `0` across all columns
- **Duplicate Rows**: `0`
- **Class Distribution**:
  - **Legitimate Transactions (`isFraud = 0`)**: `6,354,407` (99.8709%)
  - **Fraudulent Transactions (`isFraud = 1`)**: `8,213` (0.1291%)
  - **Class Imbalance Ratio**: ~773:1 (Extreme imbalanced domain)
- **Legacy Alert System (`isFlaggedFraud`)**:
  - Only `16` transactions flagged out of `8,213` actual fraud cases (Recall: 0.195%). Highlights the failure of simple rule-based thresholds (e.g. single transfer > 200,000).
- **Time Range (`step`)**:
  - `min(step)`: 1, `max(step)`: 743 (743 simulated hours = 30.96 days).

---

## 2. Column Dictionary & Usage Analysis

| Column Name | Data Type | Description / Meaning | ML Usefulness | Graph Usefulness | Leakage Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `step` | `int64` | Unit of time in hours (1 step = 1 hour). | High (hour of day, day of month, velocity windows). | High (temporal sequence of graph edge creation). | Low (must be used for chronological splitting). |
| `type` | `string` | Transaction type (`PAYMENT`, `CASH_IN`, `CASH_OUT`, `TRANSFER`, `DEBIT`). | Critical (fraud occurs ONLY in `TRANSFER` and `CASH_OUT`). | High (edge classification / edge attribute). | Low. |
| `amount` | `float64` | Transaction monetary value in local currency. | Critical (log amount, amount ratio to balance). | Medium (edge weight). | Low. |
| `nameOrig` | `string` | Unique identifier of initiating source account (`C...`). | Low directly (high cardinality), High via aggregations. | Critical (Origin Node ID). | Low (if aggregated backward-in-time only). |
| `oldbalanceOrg` | `float64` | Initial balance of source account before transaction. | Critical (balance drain indicator). | Low. | Low. |
| `newbalanceOrig` | `float64` | New balance of source account after transaction. | Critical (used to compute `error_balance_orig`). | Low. | Low. |
| `nameDest` | `string` | Unique identifier of destination recipient account (`C...` or `M...`). | Low directly (high cardinality), High via aggregations. | Critical (Destination Node ID). | Low (if aggregated backward-in-time only). |
| `oldbalanceDest` | `float64` | Initial balance of destination account before transaction. | High (used to detect empty receiver accounts). | Low. | Low. |
| `newbalanceDest` | `float64` | New balance of destination account after transaction. | High (used to compute `error_balance_dest`). | Low. | Low. |
| `isFraud` | `int64` | Target label (1 = Fraud, 0 = Legitimate). | Target Variable. | Target Variable. | **HIGH**: Must NEVER be used as a feature or to compute graph features on test data. |
| `isFlaggedFraud` | `int64` | Business rule flag (1 if `amount > 200,000` in transfer). | Baseline Comparison. | Low. | Low. |

---

## 3. Fraud Distribution Breakdown

Analysis of fraud occurrence by transaction `type`:

| Transaction Type | Total Count | Fraud Count (`isFraud=1`) | Non-Fraud Count | Fraud Rate (%) |
| :--- | ---: | ---: | ---: | ---: |
| **`CASH_OUT`** | 2,237,500 | **4,116** | 2,233,384 | 0.1839% |
| **`TRANSFER`** | 532,909 | **4,097** | 528,812 | 0.7688% |
| **`PAYMENT`** | 2,151,495 | **0** | 2,151,495 | 0.0000% |
| **`CASH_IN`** | 1,399,284 | **0** | 1,399,284 | 0.0000% |
| **`DEBIT`** | 41,432 | **0** | 41,432 | 0.0000% |
| **Total** | **6,362,620** | **8,213** | **6,354,407** | **0.1291%** |

### Key Discovery: Fraud Pair Topology
In PaySim, fraudulent activities operate in coordinated pairs:
1. Fraudster takes control of victim account `A` and performs a `TRANSFER` of funds to agent account `B`.
2. Fraudster immediately performs a `CASH_OUT` from agent account `B` to cash out the stolen funds.
3. In 99.2% of fraudulent cases, `newbalanceOrig` becomes `0.00` regardless of initial balance.

---

## 4. Entity & Relationship Graph Topology

- **Source Accounts (`nameOrig`)**: 6,353,307 unique accounts. All start with prefix `C` (Customer).
- **Destination Accounts (`nameDest`)**: 2,722,362 unique accounts.
  - **Customer Destinations (`C...`)**: 571,961 accounts.
  - **Merchant Destinations (`M...`)**: 2,150,401 accounts. (Merchants receive payments only; they never initiate outgoing transactions).
- **Total Unique Node Entities**: `9,073,900` unique accounts.
- **Bi-directional Accounts**: `1,769` accounts appear as both source (`nameOrig`) and destination (`nameDest`).
- **Graph Edges**: Directed multigraph edges `(nameOrig, nameDest)` with attributes `(step, amount, type)`.

---

## 5. Proposed Behavioral Features

1. **`amount_log`**: Logarithm of transaction amount ($\ln(1 + \text{amount})$).
2. **`error_balance_orig`**: $\text{newbalanceOrig} - (\text{oldbalanceOrg} - \text{amount})$.
3. **`error_balance_dest`**: $\text{newbalanceDest} - (\text{oldbalanceDest} + \text{amount})$.
4. **`is_zero_newbalance_orig`**: Flag indicating sender balance was completely emptied.
5. **`is_zero_oldbalance_dest`**: Flag indicating destination balance was zero before transaction.
6. **`amount_to_oldbalance_orig_ratio`**: $\frac{\text{amount}}{\text{oldbalanceOrg} + 10^{-5}}$.
7. **`step_hour`**: Hour of the day ($\text{step} \pmod{24}$).
8. **`is_high_risk_type`**: Binary flag indicating transaction is `TRANSFER` or `CASH_OUT`.

---

## 6. Proposed Graph Features

1. **`dest_in_degree_historical`**: Number of incoming transactions received by `nameDest` up to current `step`.
2. **`orig_out_degree_historical`**: Number of outgoing transactions initiated by `nameOrig` up to current `step`.
3. **`dest_unique_sources`**: Count of distinct `nameOrig` accounts sending money to `nameDest`.
4. **`orig_unique_dests`**: Count of distinct `nameDest` accounts receiving money from `nameOrig`.
5. **`account_is_both_orig_and_dest`**: Flag if account acts as both sender and receiver in historical graph.

---

## 7. Data Leakage Analysis & Prevention Strategy

> [!WARNING]
> Fraud detection models are extremely sensitive to data leakage. The following strict rules are enforced:

1. **Temporal Leakage**: Random train/test splits allow future transactions to leak into training feature aggregations.
   - **Prevention**: Use chronological splitting on `step` (`step <= 355` for training, `step > 355` for test).
2. **Label Leakage**: Using target `isFraud` labels from test transactions to calculate neighbor fraud counts.
   - **Prevention**: Graph features must be purely structural or computed using historical training labels up to `step - 1`.
3. **Future Aggregation Leakage**: Computing overall mean/std account amounts using transactions from future steps.
   - **Prevention**: All rolling/expanding account statistics are calculated strictly backward in time.

---

## 8. Chronological Train/Test Split Strategy

- **Dataset Time Range**: `step 1` to `step 743` (~31 days).
- **Split Boundary**: `step 355` (~80% percentile).
- **Train Set (`step <= 355`)**:
  - Rows: `5,113,884` (80.37%)
  - Fraud Count: `3,963` (Fraud Rate: 0.0775%)
- **Test Set (`step > 355`)**:
  - Rows: `1,248,736` (19.63%)
  - Fraud Count: `4,250` (Fraud Rate: 0.3403%)
