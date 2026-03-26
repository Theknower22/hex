import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Testing imports...")
    from database.db import SessionLocal, init_db
    print("Database imported")
    from models import User, Scan, Finding
    print("Models imported")
    from services.scan_service import ScanService
    print("ScanService imported")
    from services.vuln_service import VulnService
    print("VulnService imported")
    from services.recon_service import ReconService
    print("ReconService imported")
    from services.risk_engine import RiskEngine
    print("RiskEngine imported")
    from services.report_generator import ReportGenerator
    print("ReportGenerator imported")
    from services.ai_assistant import AIAssistant
    print("AIAssistant imported")
    print("All modules imported successfully!")
except Exception as e:
    print(f"IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
