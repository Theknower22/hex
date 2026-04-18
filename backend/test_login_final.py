import requests

def test_login_final():
    # Test the new /api/token endpoint
    url = "http://127.0.0.1:8000/api/token"
    
    print(f"Testing login at {url}...")
    
    # Test credentials (lowercase admin)
    data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: Login successful with lowercase 'admin'")
            json_res = response.json()
            print(f"Token type: {json_res.get('token_type')}")
        else:
            print(f"FAILURE: {response.text}")
            
        # Test case-insensitivity
        print("\nTesting case-insensitivity (using 'ADMIN')...")
        data_upper = {"username": "ADMIN", "password": "admin123"}
        response_upper = requests.post(url, data=data_upper)
        if response_upper.status_code == 200:
            print("SUCCESS: Login successful with uppercase 'ADMIN'")
        else:
            print(f"FAILURE: Case-insensitive login failed. {response_upper.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login_final()
