
import os
import sys
import sqlite3
from passlib.context import CryptContext

# Add backend to sys.path
sys.path.append(os.path.abspath('.'))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db_path = os.path.join('database', 'hexa.db')

def verify_users():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT username, hashed_password, role FROM users")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} users.")
        for row in rows:
            username, hashed, role = row
            is_admin123 = pwd_context.verify("admin123", hashed)
            is_analyst123 = pwd_context.verify("analyst123", hashed)
            print(f"User: {username}, Role: {role}")
            print(f"  - Matches 'admin123': {is_admin123}")
            print(f"  - Matches 'analyst123': {is_analyst123}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_users()
