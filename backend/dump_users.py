import sqlite3
import os

db_path = os.path.join('database', 'hexa.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    cols = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    print(f"Columns: {cols}")
    for row in rows:
        print(row)
    conn.close()
else:
    print("DB not found")
