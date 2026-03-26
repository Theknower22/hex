from services.recon_service import ReconService
import json

def test_advanced_recon():
    target = "google.com"
    print(f"Testing Advanced Recon for: {target}")
    
    results = ReconService.run_full_recon(target)
    
    print("\n--- RECON RESULTS ---")
    print(f"IP: {results['ip_intelligence'].get('ip')}")
    print(f"OS Detected: {results['os']}")
    print(f"Subdomains (Discovered {len(results['subdomains'])}): {results['subdomains'][:3]}...")
    print(f"Emails found: {results['emails']}")
    
    if "ssl_info" in results and "error" not in results["ssl_info"]:
        print(f"SSL Issuer: {results['ssl_info']['issuer'].get('O')}")
        print(f"SSL Expiry: {results['ssl_info']['notAfter']}")
    else:
        print(f"SSL Info Error: {results.get('ssl_info', {}).get('error')}")

    print(f"Sensitive Files Detected: {len(results['sensitive_files'])}")
    for f in results['sensitive_files']:
        print(f" - {f['file']} ({f['status']})")

if __name__ == "__main__":
    test_advanced_recon()
