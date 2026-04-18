from services.ai_risk_engine import AIRiskEngine
import json
import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.getcwd())

def test_ai_risk_v2():
    print("=== HexaShield Neural Risk Matrix: Accuracy Validation ===")
    engine = AIRiskEngine()
    
    # Test Scenarios
    mock_findings = [
        {
            "id": 1,
            "cve_id": "CVE-2024-1234",
            "cvss": 9.8,
            "exploit_db_id": "50001", 
            "port": 5432 # PostgreSQL (Criticality 5)
        },
        {
            "id": 2,
            "cve_id": "CVE-2023-9999",
            "cvss": 5.0,
            "exploit_db_id": None, 
            "port": 80 # HTTP (Criticality 4)
        },
        {
            "id": 3,
            "cve_id": "CVE-2022-0001",
            "cvss": 2.1,
            "exploit_db_id": None, 
            "port": 34567 # Generic (Criticality 2)
        }
    ]
    
    print("\n[PROCESS] Running prognostic calculations via Random Forest...")
    results = engine.predict_risk(mock_findings)
    
    print("\n[RESULTS] Intelligence Output:")
    for res in results:
        print(f"\nFinding ID: {res['finding_id']}")
        print(f"  Predicted Risk: {res['predicted_risk']}")
        print(f"  Confidence:     {(res['confidence'] * 100):.2f}%")
        print(f"  AI Logic:       {res['ai_reason']}")
        print(f"  Snapshot:       CVSS {res['feature_snapshot']['cvss']}, Exploit: {res['feature_snapshot']['exploit']}, Crit: {res['feature_snapshot']['criticality']}")

    # Validation Checks
    print("\n[VALIDATION] Verifying Machine Learning Heuristics:")
    
    # 1. High value + High severity = Critical
    if results[0]['predicted_risk'] == 'Critical' and results[0]['confidence'] > 0.8:
        print(" [PASS] High priority asset with exploit correctly escalated to Critical.")
    else:
        print(" [FAIL] Model drift detected in high priority detection.")

    # 2. Low value + Low severity = Low
    if results[2]['predicted_risk'] == 'Low':
        print(" [PASS] Low attack surface correctly downgraded to Low Risk.")
    else:
        print(" [FAIL] Model over-calculating risk for non-critical assets.")

    print("\n=== AI Risk Intelligence Validation Complete ===")

if __name__ == "__main__":
    test_ai_risk_v2()
