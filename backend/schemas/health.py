from pydantic import BaseModel, Field
from datetime import datetime

class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    service: str = Field(..., json_schema_extra={"example": "FraudGraph API Engine"})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    environment: str = Field(..., json_schema_extra={"example": "development"})
