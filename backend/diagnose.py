
import sys
import os
import sqlite3
import sqlalchemy

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

def print_result(msg, success=True):
    prefix = "[+]" if success else "[!]"
    print(f"{prefix} {msg}")

def diagnose():
    print("="*40)
    print("HEXASHIELD SYSTEM DIAGNOSTICS")
    print("="*40)

    # 1. Environment Checks
    print("\n[1] Environment Analysis")
    print_result(f"Python Version: {sys.version.split(' ')[0]}")
    print_result(f"Operating System: {sys.platform}")
    print_result(f"Working Directory: {os.getcwd()}")

    # 2. Dependency Checks
    print("\n[2] Dependency Check")
    dependencies = ["fastapi", "sqlalchemy", "uvicorn", "passlib", "jose"]
    missing = []
    for dep in dependencies:
        try:
            __import__(dep)
            print_result(f"Dependency '{dep}': INSTALLED")
        except ImportError:
            print_result(f"Dependency '{dep}': MISSING", success=False)
            missing.append(dep)

    if missing:
        print_result(f"Action Required: Install missing packages: pip install {' '.join(missing)}", success=False)

    # 3. Database Checks
    print("\n[3] Database Health Check")
    try:
        from database.db import engine, init_db, SessionLocal
        from models import User, Base

        # Ensure directory exists first (should be handled by db.py but good to check)
        db_dir = os.path.join(BACKEND_DIR, 'database')
        db_path = os.path.join(db_dir, 'hexa.db')

        if not os.path.exists(db_dir):
            print_result("Database directory not found. Environment mismatch?", success=False)
        else:
            print_result(f"Database directory: {db_dir}")

        # Initialize
        init_db()
        print_result("Database tables initialized successfully")

        # Connection verify
        with engine.connect() as conn:
            print_result("SQLAlchemy connection established")

        # Data Query
        db = SessionLocal()
        try:
            users = db.query(User).all()
            print_result(f"Database Query: SUCCESS ({len(users)} users found)")
            for u in users:
                print(f"    - {u.username} ({u.role})")
        finally:
            db.close()

    except Exception as e:
        print_result(f"Database Critical Failure: {e}", success=False)

    print("\n" + "="*40)
    print("DIAGNOSTICS COMPLETE")
    print("="*40)

if __name__ == "__main__":
    diagnose()
