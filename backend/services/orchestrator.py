import logging
import asyncio
from typing import Dict, Any
from sqlalchemy.orm import Session
from services.advanced_scanner import AdvancedScannerService
from services.vuln_service import VulnService
from services.ai_risk_engine import ai_risk_engine
from services.neo4j_service import neo4j_service
from database.db import SessionLocal
from models import Scan

# Configure Production Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("hexashield_core.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("NexusOrchestrator")

class OrchestratorService:
    """
    SYSTEM ARCHITECT: Unified Intelligence Orchestrator.
    Manages the lifecycle: Recon -> Scan -> Vuln -> AI -> Graph -> Report.
    """
    
    @staticmethod
    async def run_unified_workflow(target: str, intensity: str, scan_id: int):
        logger.info(f"Initiating Unified Workflow for Target: {target} [ScanID: {scan_id}]")
        
        try:
            # 1. SCAN & RECON (Stage 1-3)
            # Running synchronous scanner in a thread to keep orchestrator async-friendly
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None, 
                AdvancedScannerService.run_complete_scan, 
                target, scan_id, intensity
            )
            
            if "error" in results:
                logger.error(f"Workflow Interrupted: {results['error']}")
                OrchestratorService._update_status(scan_id, "failed")
                return

            findings = results.get("findings", [])
            logger.info(f"Discovery phase complete. Identified {len(results.get('services', []))} services and {len(findings)} potential vulnerabilities.")

            # 2. VULNERABILITY & AI ENRICHMENT
            if findings:
                # Predictive AI Reasoning (Batched for Performance)
                ai_results = ai_risk_engine.predict_risk(findings)
                for i, f in enumerate(findings):
                    res = ai_results[i]
                    f['ai_risk_level'] = res['predicted_risk']
                    f['ai_confidence'] = res['confidence']
                    f['ai_reasoning'] = res['ai_reason']
            
            enriched_findings = findings

            # 3. DATABASE PERSISTENCE & GRAPH SYNC
            with SessionLocal() as db:
                VulnService.persist_findings(scan_id, enriched_findings, db)
                scan = db.query(Scan).filter(Scan.id == scan_id).first()
                if scan:
                    scan.status = "completed"
                    db.commit()
            
            logger.info(f"Workflow Success. Intelligence persistent in PostgreSQL and synchronized with Neo4j Graph.")
            
        except Exception as e:
            logger.error(f"Critical Workflow Failure: {e}", exc_info=True)
            OrchestratorService._update_status(scan_id, "failed")

    @staticmethod
    def _update_status(scan_id: int, status: str):
        with SessionLocal() as db:
            scan = db.query(Scan).filter(Scan.id == scan_id).first()
            if scan:
                scan.status = status
                db.commit()

orchestrator = OrchestratorService()
