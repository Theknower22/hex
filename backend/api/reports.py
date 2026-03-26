from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from services.report_generator import ReportGenerator
from services.report_service import ReportService
from authentication.auth import get_current_user
from database.db import get_db
from models import Scan, Finding
from datetime import datetime

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

    findings = scan.findings
    # ... previous logic for JSON/HTML ...
    findings_list = [
        {
            "name": f.name, 
            "severity": f.severity, 
            "cvss": f.cvss, 
            "cve_id": getattr(f, 'cve_id', 'N/A'),
            "owasp_category": getattr(f, 'owasp_category', 'A00:2021'),
            "mitre_id": getattr(f, 'mitre_id', 'T0000'),
            "description": f.description, 
            "remediation": f.remediation
        } for f in findings
    ]

    # Calculate risk score from findings
    cvss_scores = [f.cvss for f in findings if f.cvss]
    raw_risk = max(cvss_scores) if cvss_scores else 0.0
    risk_score = float("{:.1f}".format(raw_risk))

    # Aggregate Recon data for the professional report
    from services.recon_service import ReconService
    recon_data = ReconService.run_full_recon(scan.target)

    scan_data = {
        "scan_id": scan.id,
        "target": scan.target,
        "timestamp": scan.timestamp.isoformat() if scan.timestamp else datetime.now().isoformat(),
        "type": scan.scan_type,
        "status": scan.status,
        "findings": findings_list,
        "findings_count": len(findings),
        "ports": [],   # Port data stored in scan service result, not persisted to DB separately
        "risk_score": risk_score,
        "recon": recon_data
    }

    if format == "json":
        return JSONResponse(content=scan_data)
    elif format == "html":
        html_content = ReportGenerator.generate_html_report(scan_data)
        return HTMLResponse(content=html_content)
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf', 'html' or 'json'.")

