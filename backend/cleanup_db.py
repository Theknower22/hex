import sys
import os

# Set up paths
backend_path = os.path.dirname(os.path.abspath(__file__))
if backend_path not in sys.path:
    sys.path.append(backend_path)

from database.db import SessionLocal
from models import User

def cleanup():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == 'Analysis').first()
        if user:
            print(f"Deleting user: {user.username}")
            db.delete(user)
            db.commit()
            print("Done.")
        else:
            print("User 'Analysis' not found. Skip.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
