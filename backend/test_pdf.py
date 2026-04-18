import sys
import os

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from database.db import SessionLocal
from services.report_service import ReportService

def test_pdf():
    db = SessionLocal()
    # Assume we have a scan, get the first one
    from models import Scan
    scan = db.query(Scan).first()
    if not scan:
        print("No scan found.")
        return
        
    print(f"Generating PDF for Scan {scan.id}...")
    try:
        pdf_buffer = ReportService.generate_scan_report(scan.id, db)
        if pdf_buffer:
            out_path = f"reports_out/Audit_test_{scan.id}.pdf"
            os.makedirs("reports_out", exist_ok=True)
            with open(out_path, "wb") as f:
                f.write(pdf_buffer.getvalue())
            print(f"SUCCESS: PDF generated at {out_path}")
        else:
            print("FAILURE: PDF buffer was empty.")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        
if __name__ == "__main__":
    test_pdf()
