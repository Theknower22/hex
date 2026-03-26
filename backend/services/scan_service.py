import socket
import concurrent.futures
from typing import Optional, Dict, List
import random
from datetime import datetime
from sqlalchemy.orm import Session
from services.vuln_service import VulnService
from models import Scan

# Top 30 most commonly targeted ports with service names
TOP_PORTS = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
    80: "HTTP", 110: "POP3", 111: "RPCbind", 135: "MSRPC",
    139: "NetBIOS", 143: "IMAP", 443: "HTTPS", 445: "SMB",
    993: "IMAPS", 995: "POP3S", 1723: "PPTP", 3306: "MySQL",
    3389: "RDP", 5432: "PostgreSQL", 5900: "VNC", 6379: "Redis",
    8080: "HTTP-Alt", 8443: "HTTPS-Alt", 8888: "HTTP-Dev",
    27017: "MongoDB", 9200: "Elasticsearch", 6443: "Kubernetes",
    2375: "Docker", 5601: "Kibana", 9300: "Elasticsearch-Cluster"
}

# Risk classification per service
SERVICE_RISK = {
    "Telnet": "Critical", "FTP": "High", "SMB": "High",
    "RDP": "High", "VNC": "High", "Redis": "High",
    "MongoDB": "High", "MySQL": "Medium", "SSH": "Medium",
    "Docker": "Critical", "Elasticsearch": "High",
    "Kubernetes": "High", "HTTP": "Low", "HTTPS": "Low",
    "SMTP": "Low", "DNS": "Low", "IMAP": "Low",
    "POP3": "Low", "PostgreSQL": "Medium",
}

class ScanService:
    @staticmethod
    def _check_port(target: str, port: int, timeout: float = 0.5) -> dict | None:
        """Try to connect to a port. Returns port info if open, else None."""
        try:
            with socket.create_connection((target, port), timeout=timeout) as s:
                # Try to grab a banner
                try:
                    s.settimeout(0.3)
                    banner = s.recv(256).decode(errors='ignore').strip()
                except Exception:
                    banner = ""
                service = TOP_PORTS.get(port, "Unknown")
                return {
                    "port": port,
                    "service": service,
                    "risk": SERVICE_RISK.get(service, "Low"),
                    "banner": banner[:120] if banner else ""
                }
        except Exception:
            return None

    @staticmethod
    def scan_ports(target: str, db: Session):
        """Real concurrent TCP port scan against the target."""
        # Resolve hostname to IP
        try:
            ip = socket.gethostbyname(target)
        except socket.gaierror:
            return {"error": f"Could not resolve host: {target}"}

        # Concurrent scan
        open_ports = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = {
                executor.submit(ScanService._check_port, ip, port): port
                for port in TOP_PORTS.keys()
            }
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    open_ports.append(result)

        # Sort by port number
        open_ports.sort(key=lambda x: x["port"])

        # Record scan in DB
        new_scan = Scan(
            target=target,
            scan_type="TCP Port Scan",
            status="completed"
        )
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)

        # Analyze and persist vulnerability findings
        findings = VulnService.analyze_vulnerabilities(open_ports)
        VulnService.persist_findings(new_scan.id, findings, db)

        return {
            "id": new_scan.id,
            "target": target,
            "ip": ip,
            "ports": open_ports,
            "open_count": len(open_ports),
            "findings_count": len(findings)
        }
