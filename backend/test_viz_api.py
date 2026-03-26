import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_visualization_apis():
    # Login to get token
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get scans to find a valid scan_id
    scans_res = requests.get(f"{BASE_URL}/scan/history", headers=headers)
    scans = scans_res.json()
    if not scans:
        print("No scans found. Please run a scan first.")
        return
    
    scan_id = scans[0]["id"]
    print(f"Testing for Scan ID: {scan_id}")
    
    # Test Attack Path Data
    path_res = requests.get(f"{BASE_URL}/vuln/attack-path-data/{scan_id}", headers=headers)
    print("\n--- Attack Path Data ---")
    print(json.dumps(path_res.json(), indent=2))
    
    # Test Heatmap Data
    heatmap_res = requests.get(f"{BASE_URL}/vuln/heatmap-data/{scan_id}", headers=headers)
    print("\n--- Heatmap Data ---")
    print(json.dumps(heatmap_res.json(), indent=2))

if __name__ == "__main__":
    test_visualization_apis()
