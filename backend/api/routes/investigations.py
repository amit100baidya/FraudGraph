from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import numpy as np
from backend.services import container

router = APIRouter(prefix="/api/v1/investigations", tags=["AI Investigations"])

@router.post("/report/{transaction_id}")
async def generate_investigation_report(transaction_id: str):
    container.initialize()
    df = container.df_data

    try:
        idx = int(transaction_id.replace("TX_", ""))
        if idx < 0 or idx >= len(df):
            raise ValueError()
        row = df.iloc[idx]
    except Exception:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")

    orig_id = str(row["nameOrig"])
    dest_id = str(row["nameDest"])
    amount = float(row["amount"])
    tx_type = str(row["type"])
    step = int(row["step"])

    # Feature vector construction & Risk Fusion
    feat_dict = {col: row[col] for col in container.model_trainer.feature_names if col in row}
    feat_vector = np.array([[row.get(col, 0.0) for col in container.model_trainer.feature_names]])
    ml_prob = float(container.model_trainer.model.predict_proba(feat_vector)[0, 1]) if container.model_trainer.model else 0.0

    graph_metrics = container.graph_engine.get_entity_graph_score(orig_id)

    risk_result = container.risk_engine.evaluate_transaction_risk(
        ml_prob=ml_prob,
        graph_risk_score=graph_metrics["graph_risk_score"],
        feature_dict=feat_dict
    )

    shap_contribs = container.explainer.explain_instance(feat_vector[0], top_k=5) if container.explainer else []

    # Compile Evidence Object
    evidence_obj = container.evidence_engine.compile_evidence(
        transaction_id=transaction_id,
        orig_account=orig_id,
        dest_account=dest_id,
        amount=amount,
        tx_type=tx_type,
        step=step,
        risk_fusion_result=risk_result,
        shap_contributions=shap_contribs,
        graph_metrics=graph_metrics
    )

    # Generate AI Executive Summary Report
    report_markdown = container.ai_analyst.generate_report(evidence_obj)

    return {
        "transaction_id": transaction_id,
        "report_markdown": report_markdown,
        "evidence_object": evidence_obj
    }

