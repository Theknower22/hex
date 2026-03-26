import sys
import os

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

try:
    from database.db import SessionLocal, init_db
    from models import User
    
    print("Database modules imported successfully")
    
    db = SessionLocal()
    print("Session opened")
    
    user = db.query(User).filter(User.username == "admin").first()
    if user:
        print(f"User found: {user.username}, Role: {user.role}")
    else:
        print("User 'admin' not found")
    
    db.close()
    print("Session closed")
    
except Exception as e:
    print(f"Database test failed: {e}")
    import traceback
    traceback.print_exc()
