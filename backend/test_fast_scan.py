import sys
import os
import time

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.advanced_scanner import AdvancedScannerService
from database.db import SessionLocal, init_db
from models import Scan

def benchmark_fast_scan():
    init_db()
    target = "127.0.0.1" # Using localhost for maximum speed and safety
    intensity = "pulse"
    
    print("=== HEXASHIELD TURBO SCAN BENCHMARK ===")
    print(f"Target: {target}")
    
    with SessionLocal() as db:
        new_scan = Scan(target=target, scan_type=f"BENCHMARK_{intensity.upper()}", status="running")
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
        scan_id = new_scan.id

    start_time = time.time()
    
    # Run the scan
    # Note: Using localhost might result in no open ports if services aren't running,
    # but we are testing the engine flow and speed.
    try:
        AdvancedScannerService.execute_advanced_scan(target, intensity, scan_id)
        
        duration = time.time() - start_time
        print(f"Benchmark completed in {round(duration, 2)}s")
        
        with SessionLocal() as db:
            scan = db.query(Scan).filter(Scan.id == scan_id).first()
            print(f"Scan Status: {scan.status}")
            print(f"Final Phase: {scan.phase if hasattr(scan, 'phase') else 'Unknown'}")
            
            # Check results_json
            results = scan.results_json
            if isinstance(results, str):
                import json
                results = json.loads(results)
            
            print(f"Ports Found: {len(results.get('ports', []))}")
            if duration < 45:
                print("[SUCCESS] Speed threshold met (< 45s)")
            else:
                print("[WARNING] Speed threshold exceeded")
                
    except Exception as e:
        print(f"[CRITICAL FAILURE] Benchmark crashed: {e}")

if __name__ == "__main__":
    benchmark_fast_scan()
