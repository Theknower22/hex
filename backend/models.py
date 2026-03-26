from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
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
    role = Column(String(20), default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(255), nullable=False, index=True)
    scan_type = Column(String(50), nullable=False)  # mapped to 'type' in old db
    status = Column(String(20), default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
    findings_count = Column(Integer, default=0)

    findings = relationship("Finding", back_populates="scan", cascade="all, delete")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False)
    cvss = Column(Float)
    cve_id = Column(String(50))
    owasp_category = Column(String(100))
    mitre_id = Column(String(50))
    description = Column(Text)
    remediation = Column(Text)

    scan = relationship("Scan", back_populates="findings")
