from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from services.report_generator import ReportGenerator
from services.report_service import ReportService
from authentication.auth import get_current_user
from database.db import get_db
from models import Scan, Finding
from datetime import datetime
import json
import html

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/download/{scan_id}")
async def download_report(scan_id: int, format: str = "html", current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate and download a real report for a scan from the database."""

    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan {scan_id} not found.")

    if format == "pdf":
        pdf_buffer = ReportService.generate_scan_report(scan_id, db)
        if not pdf_buffer:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=HexaReport_{scan_id}.pdf"}
        )

    # Pull results from the persisted JSONB field
    # Handle cases where it might already be a dict (Postgres) or needs parsing (Legacy/SQLite Text fallback)
    saved_results = scan.results_json
    if isinstance(saved_results, str):
        try:
            saved_results = json.loads(saved_results)
        except Exception:
            saved_results = {}
    elif saved_results is None:
        saved_results = {}

    findings = scan.findings
    findings_list = [
        {
            "name": f.name, 
            "severity": f.severity, 
            "cvss": f.cvss, 
            "cve_id": getattr(f, 'cve_id', 'N/A'),
            "owasp_category": getattr(f, 'owasp_category', 'A00:2021'),
            "mitre_id": getattr(f, 'mitre_id', 'T0000'),
            "description": f.description, 
            "remediation": f.remediation,
            "owasp": getattr(f, 'owasp_category', 'A00:2021'), # For HTML generator
            "mitre": getattr(f, 'mitre_id', 'T0000')           # For HTML generator
        } for f in findings
    ]

    # Calculate risk score from findings
    cvss_scores = [f.cvss for f in findings if f.cvss]
    raw_risk = max(cvss_scores) if cvss_scores else 0.0
    risk_score = float("{:.1f}".format(raw_risk))

    # Use saved recon data instead of running it again
    recon_data = saved_results.get("recon", {})
    port_data = saved_results.get("ports", [])
    exploit_data = saved_results.get("exploits", [])

    scan_data = {
        "scan_id": scan.id,
        "target": scan.target,
        "timestamp": scan.timestamp.isoformat() if scan.timestamp else datetime.now().isoformat(),
        "type": scan.scan_type,
        "status": scan.status,
        "findings": findings_list,
        "findings_count": len(findings),
        "ports": port_data,
        "risk_score": risk_score,
        "recon": recon_data,
        "exploits": exploit_data,
        "attack_paths": saved_results.get("chained_attacks", ["Extracted vector -> Service Discovery -> Payload Injection"])
    }

    if format == "json":
        prof_json = ReportGenerator.generate_professional_json(scan_data)
        return JSONResponse(content=prof_json)
    elif format == "markdown":
        md_content = ReportGenerator.generate_markdown_report(scan_data)
        return Response(
            content=md_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=HexaReport_{scan_id}.md"}
        )
    elif format == "html":
        html_content = ReportGenerator.generate_html_report(scan_data)
        return HTMLResponse(content=html_content)
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf', 'html', 'json', or 'markdown'.")

@router.delete("/{scan_id}")
async def delete_report(scan_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a scan report and all its findings."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(scan)
    db.commit()
    return {"status": "success", "message": f"Report {scan_id} deleted"}

@router.get("/details/{scan_id}")
async def get_report_details(scan_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all details for a report including the saved recon and scan data."""
    # Try to convert to int if it looks like one, otherwise try as string ID
    try:
        numeric_id = int(scan_id)
        scan = db.query(Scan).filter(Scan.id == numeric_id).first()
    except ValueError:
        # If it's a string like 'REP-1', we might not find it in the DB but we handle it
        scan = None
    
    if not scan:
        raise HTTPException(status_code=404, detail="Report not found")
    
    findings = [
        {
            "id": f.id,
            "name": f.name,
            "severity": f.severity,
            "cvss": f.cvss,
            "cve_id": f.cve_id,
            "owasp": f.owasp_category,
            "mitre": f.mitre_id,
            "description": f.description,
            "remediation": f.remediation
        } for f in scan.findings
    ]
    
    saved_results = scan.results_json
    if isinstance(saved_results, str):
        try:
            saved_results = json.loads(saved_results)
        except Exception:
            saved_results = {}
    elif saved_results is None:
        saved_results = {}

    return {
        "id": scan.id,
        "target": scan.target,
        "timestamp": scan.timestamp,
        "type": scan.scan_type,
        "findings": findings,
        "findings_count": len(findings),
        "ports": saved_results.get("ports", []),
        "recon": saved_results.get("recon", {})
    }

@router.delete("/purge/all")
async def purge_all_reports(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Wipe all scan results and findings from the database."""
    try:
        db.query(Finding).delete()
        db.query(Scan).delete()
        db.commit()
        return {"status": "success", "message": "All database records purged"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

