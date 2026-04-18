from services.exploit_service import ExploitService
import json

def test_intel_db():
    finding = {
        "id": 1,
        "name": "SQL Injection in User Login",
        "port": 80,
        "cve_id": "CVE-2017-0144", # EternalBlue CVE for testing platform detection
        "severity": "Critical",
        "owasp_category": "Injection",
        "cvss": 9.8,
        "description": "SQL Injection susceptibility detected in authentication module."
    }
    
    target = "corporate-portal.local"
    
    print(f"--- Testing Exploit Intelligence for {finding['name']} ---")
    intel = ExploitService.get_exploit_intelligence(finding, target=target)
    
    print(f"Platform: {intel['platform']}")
    print(f"Reliability: {intel['reliability']}")
    print(f"Metasploit Ready: {intel['metasploit_ready']}")
    print(f"MSF Module: {intel['msf_module']}")
    
    print("\nDiscovery Logs:")
    for log in intel['discovery_logs']:
        print(log)
        
    print("\nPayload Suggestions:")
    for p in intel['payload_suggestions']:
        print(f"[{p['type']}] {p['content'][:50]}...")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    test_intel_db()
