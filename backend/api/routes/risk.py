from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import numpy as np
from backend.services import container

router = APIRouter(prefix="/api/v1/risk", tags=["Risk Scoring"])

class RiskEvaluationRequest(BaseModel):
    transaction_id: Optional[str] = None
    step: int = 1
    type: str = "TRANSFER"
    amount: float = 1000.0
    nameOrig: str = "C1000000"
    oldbalanceOrg: float = 1000.0
    newbalanceOrig: float = 0.0
    nameDest: str = "C2000000"
    oldbalanceDest: float = 0.0
    newbalanceDest: float = 1000.0


@router.get("/{transaction_id}")
async def get_risk_score(transaction_id: str):
    container.initialize()
    df = container.df_data

    try:
        idx = int(transaction_id.replace("TX_", ""))
        if idx < 0 or idx >= len(df):
            raise ValueError()
        row = df.iloc[idx]
    except Exception:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")

    # Feature vector construction
    feat_dict = {col: row[col] for col in container.model_trainer.feature_names if col in row}
    feat_vector = np.array([[row.get(col, 0.0) for col in container.model_trainer.feature_names]])

    # ML Score
    ml_prob = float(container.model_trainer.model.predict_proba(feat_vector)[0, 1]) if container.model_trainer.model else 0.0

    # Graph Score
    orig_id = str(row["nameOrig"])
    graph_metrics = container.graph_engine.get_entity_graph_score(orig_id)

    # Risk Fusion
    risk_result = container.risk_engine.evaluate_transaction_risk(
        ml_prob=ml_prob,
        graph_risk_score=graph_metrics["graph_risk_score"],
        feature_dict=feat_dict
    )

    # SHAP Explanations
    shap_contribs = container.explainer.explain_instance(feat_vector[0], top_k=5) if container.explainer else []

    return {
        "transaction_id": transaction_id,
        "risk_assessment": risk_result,
        "graph_metrics": graph_metrics,
        "top_risk_drivers": shap_contribs
    }

@router.post("/evaluate")
async def evaluate_transaction(payload: RiskEvaluationRequest):
    container.initialize()

    # Engineer temporary features
    amount = payload.amount
    error_orig = payload.newbalanceOrig - (payload.oldbalanceOrg - amount)
    error_dest = payload.newbalanceDest - (payload.oldbalanceDest + amount)
    is_zero_new_orig = 1 if payload.newbalanceOrig == 0 and amount > 0 else 0
    is_zero_old_dest = 1 if payload.oldbalanceDest == 0 and amount > 0 else 0
    ratio = amount / (payload.oldbalanceOrg + 1e-5)
    is_high_risk = 1 if payload.type in ["TRANSFER", "CASH_OUT"] else 0

    feat_dict = {
        "amount": amount,
        "amount_log": np.log1p(amount),
        "error_balance_orig": error_orig,
        "error_balance_dest": error_dest,
        "is_zero_newbalance_orig": is_zero_new_orig,
        "is_zero_oldbalance_dest": is_zero_old_dest,
        "amount_to_oldbalance_orig_ratio": ratio,
        "step_hour": payload.step % 24,
        "step_day": payload.step // 24,
        "is_transfer": 1 if payload.type == "TRANSFER" else 0,
        "is_cash_out": 1 if payload.type == "CASH_OUT" else 0,
        "is_payment": 1 if payload.type == "PAYMENT" else 0,
        "is_cash_in": 1 if payload.type == "CASH_IN" else 0,
        "is_debit": 1 if payload.type == "DEBIT" else 0,
        "is_high_risk_type": is_high_risk,
        "dest_is_merchant": 1 if payload.nameDest.startswith("M") else 0,
        "orig_total_tx_count": 1,
        "dest_total_tx_count": 1,
        "orig_is_also_dest": 0,
        "dest_is_also_orig": 0
    }

    feat_vector = np.array([[feat_dict.get(col, 0.0) for col in container.model_trainer.feature_names]])
    ml_prob = float(container.model_trainer.model.predict_proba(feat_vector)[0, 1]) if container.model_trainer.model else 0.0

    graph_metrics = container.graph_engine.get_entity_graph_score(payload.nameOrig)

    risk_result = container.risk_engine.evaluate_transaction_risk(
        ml_prob=ml_prob,
        graph_risk_score=graph_metrics["graph_risk_score"],
        feature_dict=feat_dict
    )

    shap_contribs = container.explainer.explain_instance(feat_vector[0], top_k=5) if container.explainer else []

    return {
        "transaction_id": payload.transaction_id or "TX_EVAL",
        "risk_assessment": risk_result,
        "graph_metrics": graph_metrics,
        "top_risk_drivers": shap_contribs
    }

