import requests

def test_login_detailed():
    url = "http://localhost:8000/token"
    # Try form data (correct for OAuth2PasswordRequestForm)
    print("Testing with form data...")
    try:
        data = {"username": "admin", "password": "admin123"}
        response = requests.post(url, data=data)
        print(f"Status: {response.status_code}")
        print(f"Headers: {response.headers}")
        print(f"Text: {response.text}")
    except Exception as e:
        print(f"Form data test failed: {e}")

    # Try JSON (incorrect but let's see)
    print("\nTesting with JSON data...")
    try:
        json_data = {"username": "admin", "password": "admin123"}
        response = requests.post(url, json=json_data)
        print(f"Status: {response.status_code}")
        print(f"Text: {response.text}")
    except Exception as e:
        print(f"JSON data test failed: {e}")

if __name__ == "__main__":
    test_login_detailed()
