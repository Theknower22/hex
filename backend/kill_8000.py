import os
import subprocess
import signal

def kill_port_8000():
    try:
        output = subprocess.check_output("netstat -ano | findstr :8000", shell=True).decode()
        for line in output.splitlines():
            if "LISTENING" in line:
                pid = line.strip().split()[-1]
                print(f"Killing process {pid} on port 8000")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True)
    except Exception as e:
        print(f"No process found on port 8000 or error: {e}")

if __name__ == "__main__":
    kill_port_8000()
