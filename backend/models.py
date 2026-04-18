from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student")
    created_at = Column(DateTime, default=datetime.utcnow)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(255), nullable=False, index=True)
    scan_type = Column(String(50), nullable=False)  # mapped to 'type' in old db
    status = Column(String(20), default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
    findings_count = Column(Integer, default=0)
    results_json = Column(Text, nullable=True) # Snapshot of recon + ports data

    findings = relationship("Finding", back_populates="scan", cascade="all, delete")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), index=True)
    name = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    cvss = Column(Float)
    cve_id = Column(String(50), index=True)
    owasp_category = Column(String(100))
    mitre_id = Column(String(50))
    description = Column(Text)
    remediation = Column(Text)
    port = Column(Integer, nullable=True)
    reference_url = Column(String(255), nullable=True)
    exploit_db_id = Column(String(50), nullable=True)

    scan = relationship("Scan", back_populates="findings")

class AuthorizedScope(Base):
    __tablename__ = "authorized_scopes"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(255), unique=True, nullable=False, index=True) # IP range (CIDR) or Domain
    description = Column(String(255))
    is_active = Column(Integer, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    action = Column(String(100), nullable=False) # e.g., "EXECUTE_EXPLOIT", "START_SCAN"
    target = Column(String(255))
    status = Column(String(20)) # "SUCCESS", "FAILED", "BLOCKED"
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
