from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.scan_service import ScanService
from authentication.auth import get_current_user
from database.db import get_db
from models import Scan

router = APIRouter(prefix="/scan", tags=["scan"])

@router.post("/start")
async def start_scan(target: str, scan_type: str = "quick", current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start a new network scan."""
    return ScanService.scan_ports(target, db)

@router.delete("/{scan_id}")
async def delete_scan(scan_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a scan and its associated findings."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if scan:
        db.delete(scan)
        db.commit()
    return {"message": f"Scan {scan_id} deleted successfully."}

@router.get("/status/{scan_id}")
async def get_scan_status(scan_id: str, current_user: str = Depends(get_current_user)):
    """Get the status of a scan."""
    return {"scan_id": scan_id, "status": "completed", "progress": 100}

