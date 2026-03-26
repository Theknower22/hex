import sys
import os
import traceback

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

log_file = os.path.join(BACKEND_DIR, "db_error.log")

with open(log_file, "w") as f:
    try:
        from database.db import SessionLocal, init_db
        from models import User
        
        f.write("Database modules imported successfully\n")
        
        db = SessionLocal()
        f.write("Session opened\n")
        
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            f.write(f"User found: {user.username}, Role: {user.role}\n")
        else:
            f.write("User 'admin' not found\n")
        
        db.close()
        f.write("Session closed\n")
        
    except Exception as e:
        f.write(f"Database test failed: {e}\n")
        f.write(traceback.format_exc())
    
print(f"Log written to {log_file}")
