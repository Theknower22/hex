import time
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Mock DB and models if needed, or point to real ones
sys.path.append(os.getcwd())
from services.scan_service import ScanService
from models import Base

# Setup temporary DB for benchmark
engine = create_engine('sqlite:///benchmark.db')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def benchmark_pipeline(target):
    db = SessionLocal()
    print(f"--- Starting High-Speed Pipeline Benchmark for {target} ---")
    start_time = time.time()
    
    # Run the optimized scan
    result = ScanService.scan_ports(target, "full", db)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nScan Duration: {total_time:.2f} seconds")
    print(f"Ports Found: {result['open_count']}")
    print(f"Findings: {result['findings_count']}")
    print(f"Recon Stage: {result['pipeline_stages']['recon']}")
    print(f"Nmap Stage: {result['pipeline_stages']['network_scan']}")
    
    db.close()
    if os.path.exists('benchmark.db'):
        os.remove('benchmark.db')

if __name__ == "__main__":
    if len(sys.argv) > 1:
        benchmark_pipeline(sys.argv[1])
    else:
        # Test on a known public target
        benchmark_pipeline("google.com")
