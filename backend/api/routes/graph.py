from fastapi import APIRouter, HTTPException, Query
from backend.services import container

router = APIRouter(prefix="/api/v1/graph", tags=["Graph Intelligence"])

@router.get("/subgraph/{entity_id}")
async def get_entity_subgraph(entity_id: str, hops: int = Query(2, ge=1, le=3)):
    container.initialize()
    subgraph_data = container.graph_engine.get_subgraph_nodes_and_edges(entity_id, max_hops=hops)
    return subgraph_data

@router.get("/{transaction_id}")
async def get_transaction_graph(transaction_id: str):
    container.initialize()
    subgraph_data = container.graph_engine.get_subgraph_nodes_and_edges(transaction_id, max_hops=2)
    return subgraph_data

@router.get("/clusters/suspicious")
async def get_suspicious_clusters():
    container.initialize()
    if container.community_detector is None:
        return {"clusters": []}

    clusters = container.community_detector.detect_suspicious_communities(min_cluster_size=2)
    return {"clusters": clusters}

