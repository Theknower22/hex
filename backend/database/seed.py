import os
from database.db import SessionLocal, init_db
from models import User, Scan, Finding
from authentication.auth import get_password_hash
from datetime import datetime

def seed():
    init_db()
    db = SessionLocal()

    try:
        # Define target users
        target_users = [
            {"username": "admin", "email": "admin@hexa.io", "role": "admin", "pw": "admin123"},
            {"username": "analyst", "email": "analyst@hexa.io", "role": "security_analyst", "pw": "analyst123"},
            {"username": "student", "email": "student@hexa.io", "role": "student", "pw": "student123"}
        ]

        for u_data in target_users:
            # Check by username OR email (case-insensitive)
            from sqlalchemy import func
            existing = db.query(User).filter(
                (func.lower(User.username) == func.lower(u_data["username"])) | 
                (func.lower(User.email) == func.lower(u_data["email"]))
            ).first()

            if not existing:
                print(f"[SEED] Creating {u_data['username']} user...")
                new_user = User(
                    username=u_data["username"],
                    email=u_data["email"],
                    hashed_password=get_password_hash(u_data["pw"]),
                    role=u_data["role"]
                )
                db.add(new_user)
            else:
                print(f"[SEED] User {u_data['username']} (or email {u_data['email']}) already exists. Updating credentials/role...")
                existing.username = u_data["username"]
                existing.role = u_data["role"]
                existing.hashed_password = get_password_hash(u_data["pw"])
        
        db.commit()
        print("[SEED] Default users synchronized: admin/admin123, analyst/analyst123, student/student123")

        # Seed Authorized Scopes
        from models import AuthorizedScope
        target_scopes = [
            {"target": "127.0.0.1/32", "description": "Localhost - Internal Testing"},
            {"target": "192.168.0.0/16", "description": "Private Network - Lab A"},
            {"target": "10.0.0.0/8", "description": "Private Network - Lab B"},
            {"target": "demo.hexa-shield.io", "description": "Authorized Demo Domain"}
        ]
        for s_data in target_scopes:
            existing_scope = db.query(AuthorizedScope).filter(AuthorizedScope.target == s_data["target"]).first()
            if not existing_scope:
                print(f"[SEED] Creating authorized scope: {s_data['target']}...")
                new_scope = AuthorizedScope(**s_data)
                db.add(new_scope)
        
        db.commit()
        print("[SEED] Authorized lab scopes synchronized.")

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
