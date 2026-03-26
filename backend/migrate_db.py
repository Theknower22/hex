"""
Database migration script - adds missing columns to findings table.
Run once to fix 500 errors on scan.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database", "hexa.db")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check current columns
c.execute("PRAGMA table_info(findings)")
existing = [row[1] for row in c.fetchall()]
print("Current findings columns:", existing)

# Add missing columns safely
migrations = [
    ("cve_id", "TEXT DEFAULT 'N/A'"),
    ("owasp_category", "TEXT DEFAULT 'A00:2021'"),
    ("mitre_id", "TEXT DEFAULT 'T0000'"),
]

for col_name, col_def in migrations:
    if col_name not in existing:
        c.execute(f"ALTER TABLE findings ADD COLUMN {col_name} {col_def}")
        print(f"✅ Added column: {col_name}")
    else:
        print(f"⏭️  Column already exists: {col_name}")

conn.commit()

# Verify
c.execute("PRAGMA table_info(findings)")
print("\nUpdated findings columns:", [row[1] for row in c.fetchall()])
conn.close()
print("\n✅ Migration complete!")
