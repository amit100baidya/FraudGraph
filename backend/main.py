from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import health, transactions, risk, graph, investigations, analytics

app = FastAPI(
    title="FraudGraph API",
    description="Graph-Based Fraud & Abuse Ring Detection System API",
    version="0.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(transactions.router)
app.include_router(risk.router)
app.include_router(graph.router)
app.include_router(investigations.router)
app.include_router(analytics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
