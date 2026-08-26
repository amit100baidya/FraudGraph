# FraudGraph — System Architecture Specification

## 1. System High-Level Overview

FraudGraph is designed as a modular, defense-in-depth risk management engine. The system decouples model training, graph analysis, risk fusion, evidence extraction, and natural language explanation into distinct micro-services or modular packages.

```
                    ┌────────────────────────┐
                    │ Raw Transaction Stream │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ Data Validation Layer  │
                    │   (Pydantic & Pandera) │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ Feature Pipeline Engine│
                    └─────┬────────────┬─────┘
                          │            │
         ┌────────────────┘            └────────────────┐
         ▼                                              ▼
┌───────────────────┐                         ┌───────────────────┐
│ ML Risk Engine    │                         │ Graph Engine      │
│ (Scikit-Learn/XGB)│                         │ (NetworkX Graph)  │
└────────┬──────────┘                         └─────────┬─────────┘
         │                                              │
         │   ML Probability Score                       │  Graph Features &
         │   & SHAP Values                              │  Community Metrics
         └────────────────┐            ┌────────────────┘
                          ▼            ▼
                    ┌────────────────────────┐
                    │   Risk Fusion Engine   │
                    │  (Calibrated Scoring)  │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │    Evidence Engine     │
                    │  (Structured Evidence) │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ AI Fraud Analyst Layer │
                    │   (LLM Summarization)  │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ FastAPI REST Services  │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ React + Cytoscape UI   │
                    └────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Backend Layer (`backend/`)
- **Framework**: FastAPI with Pydantic v2 schemas.
- **REST Endpoints**:
  - `/api/v1/health`: System health and status checks.
  - `/api/v1/transactions`: Ingestion, listing, and transaction lookup.
  - `/api/v1/risk`: Real-time risk evaluation and score breakdown.
  - `/api/v1/graph`: Graph neighborhood, subgraph, and entity queries.
  - `/api/v1/investigations`: Investigation report generation and feedback.
  - `/api/v1/analytics`: Model performance metrics, confusion matrices, and ablation comparisons.

### 2.2 Machine Learning Layer (`ml/`)
- **Features**: Velocity features (1h, 24h transaction counts/amounts), amount Z-score deviations, temporal flags (hour, day, weekend).
- **Models**: Baseline Logistic Regression, Random Forest, XGBoost classifier.
- **Explainability**: SHAP TreeExplainer / KernelExplainer to calculate per-prediction feature attributions.

### 2.3 Graph Engine Layer (`graph/`)
- **Heterogeneous Graph Nodes**: User, Transaction, Device, IP Address, Card/Payment Instrument, Merchant.
- **Edges**: `USER_PERFORMED_TRANSACTION`, `TRANSACTION_USED_DEVICE`, `TRANSACTION_USED_IP`, `TRANSACTION_USED_CARD`, `TRANSACTION_TO_MERCHANT`.
- **Graph Metrics**: Shared entity degree (number of distinct users sharing a device/IP/card), connected component size, Louvain/Greedy Modularity community detection, fraction of known fraudulent neighbors within 2-hops.

### 2.4 Risk Fusion & Evidence Engine
- **Risk Fusion Score**:
  $$R_{\text{final}} = w_{\text{ml}} \cdot S_{\text{ml}} + w_{\text{graph}} \cdot S_{\text{graph}} + w_{\text{behavior}} \cdot S_{\text{behavior}}$$
- **Calibrated Risk Levels**:
  - `0 - 24`: LOW
  - `25 - 59`: MEDIUM
  - `60 - 84`: HIGH
  - `85 - 100`: CRITICAL
- **Evidence Object**: Standard JSON payload containing top SHAP features, structural graph paths (e.g. `User A -> Device X <- User B (Fraud)`), and recommended actions (`APPROVE`, `MONITOR`, `STEP_UP_VERIFICATION`, `MANUAL_REVIEW`).

### 2.5 AI Fraud Analyst Layer (`ai/`)
- Standardized prompt templates accepting the structured Evidence Object.
- Provider abstraction pattern (`ai/provider.py`) supporting Mock Provider, OpenAI, Anthropic, or Google Gemini.
- Strictly defensive output instructions prohibiting hallucination of unlisted entities or risk scores.

### 2.6 Interactive Web Dashboard (`frontend/`)
- Single Page Application (SPA) built with React and Vite.
- Views: Dashboard Overview, Transaction Explorer, Graph Explorer (Cytoscape.js), Investigation Report, Model Performance & Ablation, Suspicious Cluster Browser.
