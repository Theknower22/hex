"""
Full platform health check - ASCII safe version.
"""
import requests, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = "http://localhost:8000/api"

def get_token():
    r = requests.post(f"{BASE}/token", data={"username": "admin", "password": "admin123"})
    if r.status_code != 200:
        print(f"Auth failed: {r.status_code} - {r.text}")
        sys.exit(1)
    return r.json()["access_token"]

def check(name, method, url, headers, **kwargs):
    try:
        fn = getattr(requests, method)
        r = fn(url, headers=headers, timeout=20, **kwargs)
        ok = "OK" if r.status_code < 400 else "FAIL"
        detail = ""
        try:
            d = r.json()
            if isinstance(d, list):
                detail = f"[{len(d)} items]"
            elif isinstance(d, dict):
                detail = str(list(d.keys()))[:70]
        except Exception:
            detail = r.text[:70]
        print(f"[{ok}] {name}: HTTP {r.status_code} -- {detail}")
        return r.status_code
    except Exception as e:
        print(f"[ERR] {name}: FAILED -- {e}")
        return 0

print("=" * 65)
print("HEX PLATFORM -- FULL API HEALTH CHECK")
print("=" * 65)

token = get_token()
h = {"Authorization": f"Bearer {token}"}
print(f"Token: {'OK' if token else 'FAILED'}\n")

print("--- ADMIN ---")
check("GET /admin/stats", "get", f"{BASE}/admin/stats", h)
check("GET /admin/users", "get", f"{BASE}/admin/users", h)

print("\n--- SCAN ---")
check("POST /scan/start (8.8.8.8)", "post", f"{BASE}/scan/start?target=8.8.8.8&scan_type=full", h)

print("\n--- VULN ---")
check("GET /vuln/recent", "get", f"{BASE}/vuln/recent?limit=5", h)
check("GET /vuln/all", "get", f"{BASE}/vuln/all", h)
check("GET /vuln/analyze (port 80,443)", "get", f"{BASE}/vuln/analyze?ports=80,443", h)

print("\n--- RECON ---")
check("GET /recon/full/google.com", "get", f"{BASE}/recon/full/google.com", h)

print("\n--- AI ---")
check("POST /ai/chat", "post", f"{BASE}/ai/chat", h, json={"query": "hello", "context": "test"})

print("\n--- REPORTS ---")
# Get a scan id first
r = requests.get(f"{BASE}/vuln/all", headers=h)
findings = r.json()
if findings:
    sid = findings[0]["scan_id"]
    fid = findings[0]["id"]
    check(f"GET /reports/download/{sid}?format=html", "get", f"{BASE}/reports/download/{sid}?format=html", h)
    check(f"POST /exploit/{fid}", "post", f"{BASE}/exploit/{fid}", h)
else:
    print("[WARN] No findings in DB - skipping reports/exploit test")

print("\n" + "=" * 65)
print("HEALTH CHECK COMPLETE")
print("=" * 65)
