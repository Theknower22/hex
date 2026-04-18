import sys
import os
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.advanced_scanner import AdvancedScannerService
from database.db import SessionLocal, init_db
from models import Scan

def verify_3stage_engine():
    init_db()
    target = "127.0.0.1"
    intensity = "ultra" # Test Stage 3 full scan range (mocked locally)
    
    print("=== VERIFYING 3-STAGE PEN-TEST ENGINE ===")
    
    with SessionLocal() as db:
        new_scan = Scan(target=target, scan_type=f"VERIFY_3STAGE", status="running")
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
        scan_id = new_scan.id

    try:
        # We manually call run_complete_scan to see the JSON results directly
        results = AdvancedScannerService.run_complete_scan(target, scan_id, intensity)
        
        # Check for required fields
        required_fields = ["target", "ip", "services", "os", "findings", "summary"]
        missing = [f for f in required_fields if f not in results]
        
        if missing:
            print(f"[FAILED] Missing fields: {missing}")
        else:
            print("[SUCCESS] All top-level JSON fields present.")
            
            # Check services structure
            if results["services"]:
                svc = results["services"][0]
                svc_fields = ["port", "service", "version"]
                missing_svc = [f for f in svc_fields if f not in svc]
                if missing_svc:
                    print(f"[FAILED] Missing service fields: {missing_svc}")
                else:
                    print("[SUCCESS] Service JSON structure is compliant.")
                    print(f"Sample Service Record: {json.dumps(svc, indent=2)}")
            else:
                print("[INFO] No services found on target (Expected on localhost without listeners).")
                
            print(f"Final Scan Summary: {json.dumps(results['summary'], indent=2)}")
            
    except Exception as e:
        print(f"[CRITICAL] Verification failed: {e}")

if __name__ == "__main__":
    verify_3stage_engine()
