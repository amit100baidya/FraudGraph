import pytest
import pandas as pd
from graph.engine import HeterogeneousGraphEngine
from graph.community import CommunityDetector
from ml.risk_engine import RiskFusionEngine
from engine.evidence import EvidenceEngine
from ai.analyst import AIFraudAnalyst

@pytest.fixture
def sample_df():
    data = [
        {"step": 1, "type": "TRANSFER", "amount": 50000.0, "nameOrig": "C1001", "oldbalanceOrg": 50000.0, "newbalanceOrig": 0.0, "nameDest": "C2001", "oldbalanceDest": 0.0, "newbalanceDest": 50000.0, "isFraud": 1},
        {"step": 1, "type": "CASH_OUT", "amount": 50000.0, "nameOrig": "C2001", "oldbalanceOrg": 50000.0, "newbalanceOrig": 0.0, "nameDest": "M9001", "oldbalanceDest": 0.0, "newbalanceDest": 0.0, "isFraud": 1},
        {"step": 2, "type": "PAYMENT", "amount": 100.0, "nameOrig": "C3001", "oldbalanceOrg": 500.0, "newbalanceOrig": 400.0, "nameDest": "M9002", "oldbalanceDest": 0.0, "newbalanceDest": 0.0, "isFraud": 0}
    ]
    return pd.DataFrame(data)

def test_paysim_account_graph_building(sample_df):
    engine = HeterogeneousGraphEngine()
    g = engine.build_graph_from_dataframe(sample_df)
    assert len(g.nodes()) > 0
    assert engine.node_types.get("C1001") == "ACCOUNT"
    assert engine.node_types.get("TX_0") == "TRANSACTION"

    score_data = engine.get_entity_graph_score("C1001")
    assert score_data["total_degree"] >= 1
    assert score_data["graph_risk_score"] > 0

def test_subgraph_cytoscape_export(sample_df):
    engine = HeterogeneousGraphEngine()
    engine.build_graph_from_dataframe(sample_df)
    cytoscape_data = engine.get_subgraph_nodes_and_edges("C1001", max_hops=2)
    assert "nodes" in cytoscape_data
    assert "edges" in cytoscape_data
    assert len(cytoscape_data["nodes"]) > 0

def test_community_detection(sample_df):
    engine = HeterogeneousGraphEngine()
    g = engine.build_graph_from_dataframe(sample_df)
    detector = CommunityDetector(g, engine.fraud_labels)
    clusters = detector.detect_suspicious_communities(min_cluster_size=2)
    assert len(clusters) > 0
    assert clusters[0]["suspicion_score"] > 0

def test_risk_fusion_engine():
    risk_engine = RiskFusionEngine()
    res = risk_engine.evaluate_transaction_risk(
        ml_prob=0.95,
        graph_risk_score=80.0,
        feature_dict={"is_zero_newbalance_orig": 1, "is_high_risk_type": 1}
    )
    assert res["final_risk_score"] > 60.0
    assert res["risk_level"] in ["HIGH", "CRITICAL"]

def test_evidence_and_ai_analyst(sample_df):
    evidence_engine = EvidenceEngine()
    risk_engine = RiskFusionEngine()
    risk_res = risk_engine.evaluate_transaction_risk(0.9, 75.0, {"is_zero_newbalance_orig": 1})

    evidence = evidence_engine.compile_evidence(
        transaction_id="TX_0",
        orig_account="C1001",
        dest_account="C2001",
        amount=50000.0,
        tx_type="TRANSFER",
        step=1,
        risk_fusion_result=risk_res,
        shap_contributions=[{"feature": "error_balance_orig", "shap_value": 0.45, "feature_value": 0.0, "impact": "INCREASES_RISK"}],
        graph_metrics={"total_degree": 4, "unique_counterparties": 2, "graph_risk_score": 75.0}
    )

    analyst = AIFraudAnalyst()
    report = analyst.generate_report(evidence)
    assert "AI Fraud Analyst Investigation Summary" in report
    assert "TX_0" in report
