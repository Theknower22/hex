import requests

def test_login():
    url = "http://localhost:8000/token"
    payload = {
        "username": "admin",
        "password": "admin123"
    }
    
    print(f"Testing login at {url} with user 'admin'...")
    try:
        # FastAPI's OAuth2PasswordRequestForm expects x-www-form-urlencoded
        response = requests.post(url, data=payload, timeout=5)
        if response.status_code == 200:
            print("Login SUCCESS!")
            print(f"Token: {response.json().get('access_token')[:20]}...")
        else:
            print(f"Login FAILED with status {response.status_code}")
            print(f"Detail: {response.json().get('detail')}")
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection Refused. Is the backend running on port 8080?")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login()
