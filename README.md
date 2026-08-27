# FraudGraph — Account-to-Account Graph Fraud Intelligence

> **Razorpay AI Builder Internship 2026 — AI Risk Manager Track**  
> FraudGraph combines transaction-level machine learning, behavioral analysis, and account-to-account graph intelligence to detect suspicious transactions and coordinated fraud patterns.

---

## 1. Problem Statement

Traditional transaction fraud detection evaluates each transaction in isolation:
$$\text{Transaction} \xrightarrow{\quad\text{Isolated ML Model}\quad} \text{Fraud / Legitimate}$$

This fails to catch **coordinated fraud patterns**, money-laundering rings, and multi-account collusion operating across financial transaction networks.

---

## 2. Solution Overview

**FraudGraph** connects account transaction relationships into an account-to-account network:
$$\text{Source Account (nameOrig)} \xrightarrow{\quad\text{Transaction}\quad} \text{Destination Account (nameDest)}$$

By fusing transaction-level supervised ML risk scores with leakage-safe graph structural metrics (account connectivity, in/out degree, unique counterparties) and behavioral balance anomalies, FraudGraph detects both single-transaction anomalies and multi-account collusion.

---

## 3. Key Features

- **PaySim Account Graph Engine**: NetworkX multi-directed graph representing Source Accounts, Transactions, and Destination Accounts.
- **Leakage-Safe Feature Pipeline**: Temporal step-based features preventing future target data leakage.
- **Hybrid Risk Scoring**: Weighted combination of supervised ML risk, graph structural risk, and behavioral velocity risk.
- **Explainable AI (SHAP)**: SHAP-based feature attribution for model transparency alongside traceable evidence paths.
- **Evidence-Based Investigation Engine**: Traceable risk objects mapping every flag directly back to raw transactional and graph evidence.
- **AI Fraud Analyst Layer**: LLM-assisted investigation summaries that synthesize risk evidence into clear recommendations.
- **Interactive Security Dashboard**: Modern React + Vite interactive UI with Cytoscape.js account network visualization, analytics metrics, and responsive mobile layout.

---

## 4. Architecture

```
PaySim Transaction Data
       │
       ▼
 Data Validation
       │
       ▼
Feature Engineering
       │
   ┌───┴────────────────────────┐
   │                            │
   ▼                            ▼
ML Risk Model            Graph Engine
(XGBoost / RF)        (Account Network)
   │                            │
   └────────────┬───────────────┘
                │
                ▼
        Risk Fusion Engine
                │
                ▼
         Evidence Engine
                │
                ▼
      AI Investigation Layer
                │
                ▼
         API / Dashboard
```

---

## 5. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy
- **Data & ML**: Pandas, NumPy, Scikit-Learn, XGBoost, Imbalanced-Learn, SHAP, SciPy
- **Graph Processing**: NetworkX (abstracted for scalability)
- **Frontend**: React, Vite, TypeScript, Lucide Icons, Cytoscape.js
- **Database**: SQLite (local dev), PostgreSQL (production-compatible)

---

## 6. Dataset & Privacy Notice

> [!IMPORTANT]
> **Data Privacy Disclaimer**: FraudGraph is an independent research prototype built using the publicly available PaySim dataset. It **does NOT** use, access, or contain any private or proprietary Razorpay transaction data.
>
> PaySim is simulated financial transaction data. The graph currently models account-to-account transaction relationships available in PaySim.

---

## 7. Quick Start & Local Setup

### Prerequisites
- Python 3.11+
- Node.js v18+

### Setup Instructions

1. **Clone repository & prepare environment**:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

2. **Install Backend Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Run Backend API**:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

5. **Run Frontend Dashboard**:
   ```bash
   cd frontend
   npm run dev
   ```
   Dashboard available at: `http://localhost:5173`

6. **Run Streamlit Cloud Application Locally**:
   ```bash
   streamlit run streamlit_app.py
   ```
   Streamlit App available at: `http://localhost:8501`

---

## 8. License

MIT License. See `LICENSE` for details.
