from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services import container

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])


@router.get("")
async def list_transactions(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    tx_type: Optional[str] = None,
    is_fraud: Optional[int] = None,
    min_amount: Optional[float] = None
):
    container.initialize()
    df = container.df_data

    if df.empty:
        return {"total": 0, "limit": limit, "offset": offset, "data": []}

    filtered_df = df.copy()
    if tx_type:
        filtered_df = filtered_df[filtered_df["type"] == tx_type]
    if is_fraud is not None:
        filtered_df = filtered_df[filtered_df["isFraud"] == is_fraud]
    if min_amount is not None:
        filtered_df = filtered_df[filtered_df["amount"] >= min_amount]

    total_count = len(filtered_df)
    page_df = filtered_df.iloc[offset : offset + limit]

    records = []
    for idx, row in page_df.iterrows():
        tx_id = f"TX_{idx}"
        records.append({
            "transaction_id": tx_id,
            "step": int(row["step"]),
            "type": str(row["type"]),
            "amount": float(row["amount"]),
            "nameOrig": str(row["nameOrig"]),
            "nameDest": str(row["nameDest"]),
            "isFraud": int(row["isFraud"]),
            "isFlaggedFraud": int(row.get("isFlaggedFraud", 0))
        })

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "data": records
    }

@router.get("/{transaction_id}")
async def get_transaction(transaction_id: str):
    container.initialize()
    df = container.df_data

    try:
        idx = int(transaction_id.replace("TX_", ""))
        if idx < 0 or idx >= len(df):
            raise ValueError()
        row = df.iloc[idx]
    except Exception:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")

    record = {
        "transaction_id": transaction_id,
        "step": int(row["step"]),
        "type": str(row["type"]),
        "amount": float(row["amount"]),
        "nameOrig": str(row["nameOrig"]),
        "oldbalanceOrg": float(row["oldbalanceOrg"]),
        "newbalanceOrig": float(row["newbalanceOrig"]),
        "nameDest": str(row["nameDest"]),
        "oldbalanceDest": float(row["oldbalanceDest"]),
        "newbalanceDest": float(row["newbalanceDest"]),
        "isFraud": int(row["isFraud"]),
        "isFlaggedFraud": int(row.get("isFlaggedFraud", 0))
    }
    return record


