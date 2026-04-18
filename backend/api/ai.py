from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from services.ai_assistant import AIAssistant
from services.ai_scientific_service import AIScientificService
from services.ai_vulnerability_engine import AIVulnerabilityEngine
from models import Finding, Scan
from authentication.auth import get_current_user
from pydantic import BaseModel

class AIRequest(BaseModel):
    query: str
    context: str = ""

router = APIRouter(prefix="/ai", tags=["ai-assistant"])

@router.post("/chat")
async def chat_with_ai(request: AIRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Chat with the AI security assistant."""
    response = await AIAssistant.explain_vulnerability(request.query, request.context, db)
    return {"response": response}

@router.post("/remediate")
async def get_remediation(vuln_name: str, current_user: dict = Depends(get_current_user)):
    """Get AI-generated remediation steps."""
    response = await AIAssistant.explain_vulnerability(f"How to fix {vuln_name}?")
    return {"remediation": response}

@router.get("/scientific/lab")
async def get_scientific_lab_data(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Fetch consolidated scientific lab data including Random Forest metrics and scenarios."""
    findings = db.query(Finding).all()
    finding_dicts = []
    for f in findings:
        finding_dicts.append({
            "id": f.id,
            "name": f.name,
            "severity": f.severity,
            "cvss": f.cvss,
            "owasp_category": f.owasp_category,
            "mitre_id": f.mitre_id,
            "port": f.port,
            "exploit_available": bool(f.exploit_db_id and f.exploit_db_id != "N/A")
        })
    
    lab_data = AIScientificService.get_lab_intelligence(finding_dicts)
    return lab_data

@router.post("/deep-analysis/{scan_id}")
async def run_deep_analysis(scan_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Perform advanced AI-powered deep interrogation on a scan target."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan target not found.")
    
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    analysis = AIVulnerabilityEngine.analyze_scan_results(scan, findings)
    return analysis
