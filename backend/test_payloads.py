import sys
import os

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from database.db import SessionLocal
from models import Finding
from services.exploit_service import ExploitService

def test_exploit_logic():
    db = SessionLocal()
    # Try to find a finding with exploit_db_id != N/A, and one with CVE
    finding_exploit = db.query(Finding).filter(Finding.exploit_db_id != "N/A", Finding.exploit_db_id != None).first()
    
    if finding_exploit:
        print(f"--- Testing finding with Exploit-DB ID ({finding_exploit.name}) ---")
        res = ExploitService.run_exploit(finding_exploit, target="192.168.1.100")
        print(res["payload"])
        for line in res["output"]:
            print(line)
        print("\n")
    else:
        print("No finding with Exploit-DB ID available.\n")
        
    finding_cve = db.query(Finding).filter(Finding.cve_id != "N/A", Finding.exploit_db_id == "N/A").first()
    if finding_cve:
        print(f"--- Testing finding with CVE only ({finding_cve.name}) ---")
        res2 = ExploitService.run_exploit(finding_cve, target="10.0.0.5")
        print(res2["payload"])
        for line in res2["output"]:
            print(line)
        print("\n")
    else:
        print("No finding with CVE only available.\n")

if __name__ == "__main__":
    test_exploit_logic()
