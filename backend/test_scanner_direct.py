import sys
import os
import json
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.advanced_scanner import AdvancedScannerService
from database.db import SessionLocal, init_db
from models import Scan

def test_scan():
    init_db()
    target = "google.com"
    intensity = "pulse"
    
    with SessionLocal() as db:
        new_scan = Scan(target=target, scan_type=f"TEST_{intensity.upper()}", status="running")
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
        scan_id = new_scan.id
        print(f"Starting test scan for {target} (ID: {scan_id})")

    try:
        AdvancedScannerService.execute_advanced_scan(target, intensity, scan_id)
        
        with SessionLocal() as db:
            scan = db.query(Scan).filter(Scan.id == scan_id).first()
            print(f"Scan Status: {scan.status}")
            if scan.status == "failed":
                # Look for potential error in stdout (printed by execute_advanced_scan)
                pass
            else:
                print("Scan results found:")
                # print(scan.results_json[:500] + "...")
    except Exception as e:
        print(f"Caught top-level exception: {e}")

if __name__ == "__main__":
    test_scan()
