import sqlite3
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db_path = os.path.join('database', 'hexa.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT hashed_password FROM users WHERE username='admin'")
    row = cursor.fetchone()
    if row:
        hashed_password = row[0]
        print(f"Hashed password in DB: {hashed_password}")
        password = "admin123"
        try:
            is_valid = pwd_context.verify(password, hashed_password)
            print(f"Is 'admin123' valid? {is_valid}")
        except Exception as e:
            print(f"Error during verification: {e}")
    else:
        print("Admin user not found")
    conn.close()
else:
    print("DB not found")
