import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from ml.preprocessing.pipeline import PaySimPipeline
from ml.models.trainer import FraudModelTrainer
from ml.explainability import FraudExplainer
from graph.engine import HeterogeneousGraphEngine
from graph.community import CommunityDetector
from ml.risk_engine import RiskFusionEngine
from engine.evidence import EvidenceEngine
from ai.analyst import AIFraudAnalyst

class EngineContainer:
    """
    Central Singleton Container managing initialized FraudGraph engines and loaded data.
    """

    def __init__(self):
        self.df_data: pd.DataFrame = pd.DataFrame()
        self.graph_engine: HeterogeneousGraphEngine = HeterogeneousGraphEngine()
        self.model_trainer: FraudModelTrainer = FraudModelTrainer(model_type="xgboost")
        self.explainer: FraudExplainer = None
        self.risk_engine: RiskFusionEngine = RiskFusionEngine()
        self.evidence_engine: EvidenceEngine = EvidenceEngine()
        self.ai_analyst: AIFraudAnalyst = AIFraudAnalyst()
        self.community_detector: CommunityDetector = None
        self.is_initialized: bool = False

    def initialize(self):
        """Loads data, initializes graph engine, models, and community detection."""
        if self.is_initialized:
            return

        train_path = "data/processed/train.csv"
        test_path = "data/processed/test.csv"
        sample_path = "data/sample/paysim_sample_enriched.csv"

        if os.path.exists(test_path):
            df_train = pd.read_csv(train_path)
            df_test = pd.read_csv(test_path)
            self.df_data = pd.concat([df_train, df_test], ignore_index=True)
        elif os.path.exists(sample_path):
            pipeline = PaySimPipeline(raw_csv_path=sample_path)
            self.df_data = pipeline.load_raw_data()
            self.df_data = pipeline.engineer_behavioral_features(self.df_data)
            self.df_data = pipeline.engineer_graph_features_local(self.df_data)
        else:
            # Generate synthetic placeholder dataset if files are missing
            raw_path = r"C:\Users\amitb\Desktop\Razor Pay\Dataset A — PaySim.csv"
            pipeline = PaySimPipeline(raw_csv_path=raw_path)
            self.df_data = pipeline.load_raw_data(nrows=1000)
            self.df_data = pipeline.engineer_behavioral_features(self.df_data)
            self.df_data = pipeline.engineer_graph_features_local(self.df_data)

        # Build Graph
        print("Building Heterogeneous Graph in memory...")
        self.graph_engine.build_graph_from_dataframe(self.df_data)

        # Load ML Model
        try:
            self.model_trainer.load_model("ml/models")
        except Exception:
            print("Training fallback ML model...")
            train_df, test_df = self.model_trainer.prepare_data(self.df_data, self.df_data)
            self.model_trainer.train(train_df, test_df)

        # Initialize Explainer
        if self.model_trainer.model is not None:
            self.explainer = FraudExplainer(self.model_trainer.model, self.model_trainer.feature_names)

        # Initialize Community Detector
        self.community_detector = CommunityDetector(self.graph_engine.graph, self.graph_engine.fraud_labels)

        self.is_initialized = True
        print(f"FraudGraph Engines Initialized successfully! Dataset size: {len(self.df_data)} transactions.")

# Global Singleton Instance
container = EngineContainer()
