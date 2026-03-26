import pytest
from authentication import auth

def test_password_hashing():
    password = "secret_password"
    hashed = auth.get_password_hash(password)
    assert auth.verify_password(password, hashed)
    assert not auth.verify_password("wrong_password", hashed)

def test_jwt_creation():
    data = {"sub": "testuser", "role": "admin"}
    token = auth.create_access_token(data)
    decoded = auth.decode_access_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "admin"

def test_vuln_analysis_logic():
    from services.vuln_service import VulnService
    ports = [{"port": 80, "service": "HTTP"}]
    findings = VulnService.analyze_vulnerabilities(ports)
    assert len(findings) > 0
    assert findings[0]["name"] == "SQL Injection"

def test_db_session():
    from database.db import SessionLocal, init_db
    from models import User

    # Initialize schema in the test DB
    init_db()

    db = SessionLocal()
    try:
        # Just verifying we can query without errors
        assert db.query(User).count() >= 0
    finally:
        db.close()
