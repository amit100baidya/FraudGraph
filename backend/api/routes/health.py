from fastapi import APIRouter
from backend.schemas.health import HealthResponse
from datetime import datetime
import os

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
@router.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="FraudGraph API Engine",
        version="0.1.0",
        timestamp=datetime.utcnow(),
        environment=os.getenv("APP_ENV", "development")
    )
