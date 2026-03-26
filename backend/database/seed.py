import os
from database.db import SessionLocal, init_db
from models import User, Scan, Finding
from authentication.auth import get_password_hash
from datetime import datetime

def seed():
    init_db()
    db = SessionLocal()

    try:
        # Admin User
        admin = db.query(User).filter(User.username == 'admin').first()
        if not admin:
            print("[SEED] Creating admin user...")
            admin = User(username="admin", email="admin@hexa.io", hashed_password=get_password_hash("admin123"), role="admin")
            db.add(admin)
        else:
            print("[SEED] Admin user already exists, skipping creation.")

        # Analyst User
        analyst = db.query(User).filter(User.username == 'analyst').first()
        if not analyst:
            print("[SEED] Creating analyst user...")
            analyst = User(username="analyst", email="analyst@hexa.io", hashed_password=get_password_hash("analyst123"), role="security_analyst")
            db.add(analyst)
        else:
            print("[SEED] Analyst user already exists, skipping creation.")

        # Student User
        student = db.query(User).filter(User.username == 'student').first()
        if not student:
            print("[SEED] Creating student user...")
            student = User(username="student", email="student@hexa.io", hashed_password=get_password_hash("student123"), role="student")
            db.add(student)
        else:
            print("[SEED] Student user already exists, skipping creation.")

        db.commit()
        print("[SEED] Default users initialized/updated: admin/admin123, analyst/analyst123")

        # Check if scans exist
        scan_exists = db.query(Scan).first()
        if not scan_exists:
            print("[SEED] Seeding mock intelligence data...")
            mock_scan = Scan(
                target="demo.hexa-shield.io",
                scan_type="full",
                status="completed",
                timestamp=datetime.utcnow(),
                findings_count=2
            )
            db.add(mock_scan)
            db.commit()
            db.refresh(mock_scan)

            f1 = Finding(
                scan_id=mock_scan.id,
                name="Exposed SSH Port",
                severity="Medium",
                cvss=5.5,
                description="SSH service is exposed to the public internet on port 22.",
                remediation="Restrict SSH access to trusted IPs using a firewall."
            )
            f2 = Finding(
                scan_id=mock_scan.id,
                name="Outdated Nginx Version",
                severity="High",
                cvss=7.5,
                description="The server is running an outdated version of Nginx vulnerable to known exploits.",
                remediation="Upgrade Nginx to the latest stable version."
            )
            db.add(f1)
            db.add(f2)
            db.commit()
            print("[SEED] Mock scan and findings seeded.")

    except Exception as e:
        import traceback
        print(f"[SEED ERROR] Failed to seed database: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
