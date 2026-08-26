# FraudGraph — Graph-Based Fraud & Abuse Ring Detection

> **Razorpay AI Builder Internship 2026 — AI Risk Manager Track**  
> An intelligent defense system combining machine learning risk scoring, heterogeneous graph relationship intelligence, behavioral anomaly detection, SHAP explainability, and AI-assisted investigation summaries.

---

## 1. Problem Statement

Traditional transaction fraud detection evaluates each transaction in isolation:
$$\text{Transaction} \xrightarrow{\quad\text{ML Model}\quad} \text{Fraud / Legitimate}$$

This fails to catch **coordinated fraud rings**, syndicates, and abuse networks operating across multiple accounts using shared resources (such as shared physical devices, IP subnets, or compromised payment instruments).

---

## 2. Solution Overview

**FraudGraph** connects entity relationships into a heterogeneous graph network:
$$\text{User} \longleftrightarrow \text{Device} \longleftrightarrow \text{IP} \longleftrightarrow \text{Payment Instrument} \longleftrightarrow \text{Merchant}$$

By fusing transaction-level supervised ML scores with graph structural metrics (community detection, shared entity count, degree anomalies) and behavioral velocity signals, FraudGraph detects both single-transaction anomalies and multi-user fraudulent collusion.

---

## 3. Key Features

- **Heterogeneous Graph Engine**: NetworkX representation of Users, Transactions, Devices, IPs, Cards, and Merchants.
- **Hybrid Risk Scoring**: Weighted combination of supervised ML risk, graph structural risk, and behavioral velocity risk.
- **Explainable AI (XAI)**: SHAP-based feature attribution for model transparency alongside graph evidence paths.
- **Evidence-Based Investigation Engine**: Traceable risk objects mapping every flag directly back to raw transactional and graph evidence.
- **AI Fraud Analyst Layer**: LLM-assisted investigation summaries that synthesize risk evidence into clear, defensive action recommendations without making automated blocking decisions.
- **Interactive Security Dashboard**: Modern React + Vite interactive UI with Cytoscape.js network graph visualization, analytics metrics, and investigation workflows.

---

## 4. Architecture

```
Transaction Data
       │
       ▼
 Data Validation
       │
       ▼
 Preprocessing & Feature Engineering
       │
   ┌───┴────────────────────────┐
   │                            │
   ▼                            ▼
ML Risk Model            Graph Engine
(XGBoost / RF)      (NetworkX & Communities)
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
      AI Fraud Analyst Layer
                │
                ▼
         API / Dashboard
```

---

## 5. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy
- **Data & ML**: Pandas, NumPy, Scikit-Learn, XGBoost, Imbalanced-Learn, SHAP, SciPy
- **Graph Processing**: NetworkX (abstracted to support Neo4j extension)
- **Frontend**: React, Vite, TypeScript, Lucide Icons, Cytoscape.js
- **Database**: SQLite (local dev), PostgreSQL (production-compatible)

---

## 6. Dataset & Data Privacy Notice

> [!IMPORTANT]
> **Data Privacy Disclaimer**: FraudGraph is an independent research prototype developed for the Razorpay AI Builder Internship application. It **does NOT** use, access, or contain any private or proprietary Razorpay transaction data.
>
> All experiments and demonstration datasets use either anonymized public benchmarks (e.g. IEEE-CIS, PaySim) or transparently generated synthetic relationship layers designed solely to demonstrate graph fraud detection capabilities.

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

## 8. Live Cloud Hosting Options

1. **Streamlit Community Cloud (Free 1-Click Python Hosting)**:
   - Deploy `streamlit_app.py` directly from GitHub on [share.streamlit.io](https://share.streamlit.io/). No server management needed.
2. **GitHub Pages (Free React Frontend Hosting)**:
   - Automated GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the React dashboard to GitHub Pages on push to `main`.


---

## 8. Development Phases & Status

- [x] **Phase 1**: Project Discovery & Foundation (Structure, FastAPI Shell, React Shell, Health APIs)
- [x] **Phase 2**: Dataset Strategy, Synthetic Graph Generator & Data Pipeline
- [x] **Phase 3**: Baseline ML Model & Feature Engineering
- [x] **Phase 4**: Graph Engine & Suspicious Community Detection
- [x] **Phase 5**: Hybrid Risk Engine & SHAP Explainability
- [x] **Phase 6**: Evidence Engine & AI Analyst Layer
- [x] **Phase 7**: REST API Implementation
- [x] **Phase 8**: Interactive React Dashboard & Network Explorer
- [x] **Phase 9**: Evaluation Suite & Ablation Study
- [x] **Phase 10**: End-to-End Testing & Verification


---

## 9. License

MIT License. See `LICENSE` for details.
