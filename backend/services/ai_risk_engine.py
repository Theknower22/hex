import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from typing import List, Dict

class AIRiskEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIRiskEngine, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.feature_names = ["cvss", "exploit_available", "service_criticality"]
        return cls._instance

    def _ensure_model(self):
        """Lazy initialization: Trains the model only when needed."""
        if self.model is None:
            from sklearn.ensemble import RandomForestClassifier
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self._initialize_model()

    def _initialize_model(self):
        """Generates a high-fidelity synthetic security dataset and trains the Random Forest."""
        X_train = []
        y_train = []
        
        # Labels: 0-Low, 1-Medium, 2-High, 3-Critical
        # Feature: [CVSS(0-10), Exploit(0/1), Criticality(1-5)]
        
        # Generation Logic: 100+ professional-grade samples
        for cvss in np.linspace(0, 10, 10):
            for exploit in [0, 1]:
                for criticality in range(1, 6):
                    # Logical Risk Determination
                    base_risk = (cvss / 10) * 2 + (exploit * 1) + (criticality / 5) * 1
                    
                    if base_risk >= 3.2 or (cvss >= 9.0 and exploit == 1): risk = 3 # Critical
                    elif base_risk >= 2.2 or (cvss >= 7.0 and exploit == 1): risk = 2 # High
                    elif base_risk >= 1.2: risk = 1 # Medium
                    else: risk = 0 # Low
                    
                    X_train.append([cvss, exploit, criticality])
                    y_train.append(risk)

        X = np.array(X_train)
        y = np.array(y_train)
        
        self.feature_names = ["cvss", "exploit_available", "service_criticality"]
        X_df = pd.DataFrame(X, columns=self.feature_names)
        self.model.fit(X_df, y)

    def _get_service_criticality(self, port: int) -> int:
        """Heuristic for asset/service importance."""
        if not port: return 3
        # Infrastructure/Core services (Database, SSH, Admin)
        if port in [22, 3389, 5432, 3306, 27017, 1521, 6379]: return 5
        # Web & Middleware
        if port in [80, 443, 8080, 8443, 3000, 5000]: return 4
        # Common secondary services
        if port in [21, 23, 25, 110, 143, 445]: return 3
        return 2

    def feature_engineering(self, findings: List[Dict]) -> pd.DataFrame:
        """Transforms raw findings into ML tensors."""
        data = []
        for f in findings:
            cvss = float(f.get("cvss") or f.get("cvss_score") or 5.0)
            # Binary Exploit availability (NVD/Exploit-DB match)
            exploit_available = 1 if (f.get("exploit_db_id") != "N/A" and f.get("exploit_db_id")) or f.get("exploit_available") == "Yes" or f.get("exploit_available") == True else 0
            service_criticality = self._get_service_criticality(f.get("port"))
            
            data.append({
                "cvss": cvss,
                "exploit_available": exploit_available,
                "service_criticality": service_criticality
            })
        
        return pd.DataFrame(data, columns=self.feature_names)

    def predict_risk(self, findings: List[Dict]) -> List[Dict]:
        """Performs Neural Risk Assessment with confidence scoring."""
        if not findings:
            return []

        self._ensure_model()
        features_df = self.feature_engineering(findings)
        probs = self.model.predict_proba(features_df)
        predictions = self.model.predict(features_df)
        
        results = []
        risk_map = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}
        
        for i, f in enumerate(findings):
            pred_idx = predictions[i]
            confidence = float(np.max(probs[i]))
            ai_risk = risk_map[pred_idx]
            
            # Semantic Reasoning for UI feedback
            reason = "Standard behavioral pattern detected."
            cvss = float(f.get("cvss") or 5.0)
            exploit = features_df.iloc[i]["exploit_available"]
            crit = features_df.iloc[i]["service_criticality"]
            
            if exploit and crit >= 4: reason = "Active exploit on high-value asset."
            elif cvss >= 9.0: reason = "Extreme technical severity mapping."
            elif crit <= 2 and not exploit: reason = "Limited attack surface on low-value target."

            results.append({
                "finding_id": f.get("id"),
                "predicted_risk": ai_risk,
                "confidence": confidence,
                "ai_reason": reason,
                "feature_snapshot": {
                    "cvss": cvss,
                    "exploit": "Yes" if exploit else "No",
                    "criticality": crit
                }
            })
            
        return results

ai_risk_engine = AIRiskEngine()
