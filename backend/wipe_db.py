"""
Clear the database (Findings and Scans).
"""
import sqlite3
import os

db_path = os.path.join("backend", "database", "hexa.db")
print("Wiping database at:", db_path)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM findings")
print("Deleted findings:", c.rowcount)
c.execute("DELETE FROM scans")
print("Deleted scans:", c.rowcount)

c.execute("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'findings'")
c.execute("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'scans'")

conn.commit()
conn.close()
print("Database wiped successfully!")
