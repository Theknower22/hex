import requests

def test_login():
    url = "http://localhost:8080/token"
    data = {
        "username": "admin",
        "password": "admin123"
    }
    try:
        # Start backend first if not running, but for now just try request
        response = requests.post(url, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
