import sqlite3
import os
import json

db_path = r'c:\Users\user\Desktop\hex\backend\database\hexa.db'

def check_scans():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, target, status, results_json FROM scans ORDER BY id DESC LIMIT 5")
    rows = cursor.fetchall()
    
    for row in rows:
        print(f"ID: {row[0]}")
        print(f"Target: {row[1]}")
        print(f"Status: {row[2]}")
        print(f"Results JSON: {row[3][:200]}...")
        print("-" * 20)
    
    conn.close()

if __name__ == "__main__":
    check_scans()
