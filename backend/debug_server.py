import subprocess
import time
import requests
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
server_script = os.path.join(backend_dir, "main.py")
log_file = os.path.join(backend_dir, "server_debug.log")

print(f"Starting server and capturing logs to {log_file}...")

with open(log_file, "w") as f:
    # Start the server
    process = subprocess.Popen(
        ["python", server_script],
        stdout=f,
        stderr=subprocess.STDOUT,
        cwd=os.path.dirname(backend_dir)
    )
    
    time.sleep(5) # Give it time to start
    
    print("Sending login request...")
    try:
        url = "http://localhost:8000/token"
        data = {"username": "admin", "password": "admin123"}
        response = requests.post(url, data=data)
        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    time.sleep(2)
    process.terminate()

print("Server stopped. Check the log file.")
