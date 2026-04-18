from pydantic import BaseModel, Field, validator
import re

class ScanRequest(BaseModel):
    target: str = Field(..., example="192.168.1.1", description="Target IP address or FQDN")
    intensity: str = Field("deep", example="deep", description="Scan intensity: fast, deep, or ultra")
    
    @validator("target")
    def validate_target(cls, v):
        # Prevent Command Injection: Allow only valid IPv4, IPv6, or Domain names
        ip_regex = r"^(\d{1,3}\.){3}\d{1,3}$"
        domain_regex = r"^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$"
        
        if not (re.match(ip_regex, v) or re.match(domain_regex, v)):
            raise ValueError("Target must be a valid IP address or Domain name. Malicious characters detected.")
        return v

    @validator("intensity")
    def validate_intensity(cls, v):
        allowed = ["fast", "deep", "ultra"]
        if v.lower() not in allowed:
            raise ValueError(f"Intensity must be one of {allowed}")
        return v.lower()

class ExploitationRequest(BaseModel):
    finding_id: int = Field(..., example=1)
    
class DashboardTelemetry(BaseModel):
    total_scans: int
    total_findings: int
    critical_count: int
    system_health: str
    intelligence_tier: str
