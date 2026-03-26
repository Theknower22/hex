import sys
import os

# Add backend to sys.path
backend_path = os.path.dirname(os.path.abspath(__file__))
if backend_path not in sys.path:
    sys.path.append(backend_path)

from reset_db import reset

if __name__ == "__main__":
    print("Executing automated database reset...")
    reset()
    print("Automated reset complete.")
