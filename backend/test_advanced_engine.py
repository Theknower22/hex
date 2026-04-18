import sys
import os
import json
import time

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.advanced_scanner import AdvancedScannerService

def test_engine():
    target = "google.com"
    print(f"[*] Starting OPTIMIZED ULTRA-ADVANCED scan for {target}...", flush=True)
    
    # Using a dummy scan_id, but the logic should handle it
    results = AdvancedScannerService.run_complete_scan(target, scan_id=1, intensity="fast")
    
    if "error" in results:
        print(f"[!] Scan failed: {results['error']}", flush=True)
        return

    print("[+] Scan Complete!", flush=True)
    print(f"[+] Target: {results['target']} ({results['ip']})", flush=True)
    print(f"[+] OS: {results.get('os', 'Unknown')}", flush=True)
    print(f"[+] Services found: {len(results['services'])}", flush=True)
    
    for svc in results['services']:
        print(f"    - {svc['port']}/{svc['protocol']} {svc['service']} ({svc['version']}) [Risk: {svc.get('risk_level', 'Low')}] [Source: {svc.get('source', 'unknown')}]", flush=True)
        
    print(f"[+] Web Analysis: {json.dumps(results['web_analysis'], indent=2)}", flush=True)
    print(f"[+] Summary: {json.dumps(results['summary'], indent=2)}", flush=True)
    
    # Verify AI Ready structure
    required_keys = ["target", "ip", "services", "web_analysis", "summary"]
    for key in required_keys:
        if key not in results:
            print(f"[!] Missing AI key: {key}", flush=True)
        else:
            print(f"[OK] Key '{key}' is present.", flush=True)

if __name__ == "__main__":
    test_engine()
