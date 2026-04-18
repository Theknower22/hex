from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.vuln_service import VulnService
from services.risk_engine import RiskEngine
from database.db import get_db
from authentication.auth import get_current_user
from models import Finding, Scan

router = APIRouter(prefix="/vuln", tags=["vulnerabilities"])

@router.get("/analyze")
async def analyze_vulnerabilities(ports: str, current_user: str = Depends(get_current_user)):
    """Analyze vulnerabilities based on open ports."""
    port_list = [{"port": int(p), "service": "Unknown", "risk": "Medium"} for p in ports.split(",") if p.strip()]
    findings = VulnService.analyze_vulnerabilities(port_list)
    risk_score = RiskEngine.calculate_overall_risk(findings)

    return {
        "findings": findings,
        "risk_score": risk_score,
        "summary": RiskEngine.get_risk_summary(risk_score)
    }

@router.get("/findings/{scan_id}")
async def get_findings(scan_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get findings for a specific scan with AI Risk integration."""
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    
    # Prepare findings for AI engine
    raw_findings = [
        {"id": f.id, "cvss": f.cvss, "exploit_db_id": f.exploit_db_id, "port": f.port} 
        for f in findings
    ]
    ai_results = ai_engine.predict_risk(raw_findings)
    ai_map = {res["finding_id"]: res for res in ai_results}

    return [{
        "id": f.id, 
        "scan_id": f.scan_id, 
        "name": f.name, 
        "severity": f.severity, 
        "cvss": f.cvss, 
        "cve_id": f.cve_id, 
        "owasp_category": f.owasp_category, 
        "mitre_id": f.mitre_id, 
        "description": f.description, 
        "remediation": f.remediation, 
        "port": f.port,
        "ai_risk": ai_map.get(f.id, {}).get("predicted_risk"),
        "ai_confidence": ai_map.get(f.id, {}).get("confidence"),
        "ai_reason": ai_map.get(f.id, {}).get("ai_reason")
    } for f in findings]

@router.get("/all")
async def get_all_findings(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all vulnerability findings across all scans with Neural Risk Matrix mapping."""
    findings = db.query(Finding).join(Scan).order_by(Scan.timestamp.desc()).all()
    
    # Batch process AI predictions
    raw_findings = [
        {"id": f.id, "cvss": f.cvss, "exploit_db_id": f.exploit_db_id, "port": f.port} 
        for f in findings
    ]
    ai_results = ai_engine.predict_risk(raw_findings)
    ai_map = {res["finding_id"]: res for res in ai_results}

    results = [{
        "id": f.id, 
        "name": f.name, 
        "severity": f.severity, 
        "cvss": f.cvss, 
        "cve_id": f.cve_id, 
        "owasp_category": f.owasp_category, 
        "mitre_id": f.mitre_id, 
        "target": f.scan.target, 
        "timestamp": f.scan.timestamp, 
        "scan_id": f.scan_id,
        "description": f.description,
        "remediation": f.remediation,
        "port": f.port,
        "attack_vector": getattr(f, 'attack_vector', 'N/A'),
        "attack_stage": getattr(f, 'attack_stage', 'EXPLOITATION'),
        "ai_risk": ai_map.get(f.id, {}).get("predicted_risk"),
        "ai_confidence": ai_map.get(f.id, {}).get("confidence"),
        "ai_reason": ai_map.get(f.id, {}).get("ai_reason")
    } for f in findings]
    
    for r in results:
        r['custom_risk_score'] = RiskEngine.calculate_custom_risk(r)
        
    return results

@router.get("/recent")
async def get_recent_findings(limit: int = 10, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the most recent security findings across all scans."""
    findings = db.query(Finding).join(Scan).order_by(Scan.timestamp.desc()).limit(limit).all()
    return [{
        "id": f.id, 
        "name": f.name, 
        "severity": f.severity, 
        "cvss": f.cvss, 
        "cve_id": f.cve_id, 
        "owasp_category": f.owasp_category, 
        "mitre_id": f.mitre_id, 
        "target": f.scan.target, 
        "timestamp": f.scan.timestamp, 
        "scan_id": f.scan_id,
        "description": f.description,
        "remediation": f.remediation,
        "port": f.port
    } for f in findings]

from services.ai_risk_engine import ai_risk_engine as ai_engine

@router.get("/ai-prediction/{scan_id}")
async def get_ai_prediction(scan_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Task 4: Get AI-driven risk predictive analytics for a scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    findings = [
        {
            "cve_id": f.cve_id,
            "cvss": f.cvss,
            "exploit_db_id": f.exploit_db_id,
            "port": f.port
        } for f in scan.findings
    ]
    
    analysis = ai_engine.predict_risk(findings)
    
    return {
        "host": scan.target,
        "vulnerabilities": analysis
    }

# Original routes continued...
@router.get("/topology/{target}")
async def get_topology(target: str, current_user: str = Depends(get_current_user)):
    """Get virtual infrastructure topology for a target."""
    return RiskEngine.get_infrastructure_topology(target)

@router.get("/attack-path-data/{scan_id}")
async def get_attack_path_data(scan_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Get dynamic attack path data for a specific scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    findings = [{"severity": f.severity} for f in scan.findings]
    return {
        "path": RiskEngine.get_dynamic_attack_path(findings, scan.target),
        "topology": RiskEngine.get_infrastructure_topology(scan.target)
    }

@router.get("/graph/{scan_id}")
async def get_attack_graph(scan_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Expert: Get structured graph data (Nodes/Links) and the Most Critical Path."""
    from services.graph_service import GraphService
    graph_data = GraphService.build_attack_graph(scan_id, db)
    return graph_data
