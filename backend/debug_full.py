import subprocess
import time
import requests
import os
import signal

backend_dir = os.path.dirname(os.path.abspath(__file__))
server_script = os.path.join(backend_dir, "main.py")
log_file = os.path.join(backend_dir, "server_debug_final.log")

print(f"Starting server and capturing logs to {log_file}...")

with open(log_file, "w") as f:
    # Start the server without reload to keep it in one process
    env = os.environ.copy()
    process = subprocess.Popen(
        ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"],
        stdout=f,
        stderr=subprocess.STDOUT,
        cwd=backend_dir,
        env=env
    )
    
    time.sleep(5) # Give it time to start
    
    print("Sending login request...")
    try:
        url = "http://localhost:8001/token"
        data = {"username": "admin", "password": "admin123"}
        response = requests.post(url, data=data)
        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    time.sleep(2)
    # On Windows, we might need a more aggressive termination
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()

print("Server stopped. Reading log file...")
if os.path.exists(log_file):
    with open(log_file, "r") as f:
        print(f.read())
else:
    print("Log file not found!")
