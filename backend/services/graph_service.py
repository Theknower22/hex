from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from models import Scan, Finding

class GraphService:
    @staticmethod
    def build_attack_graph(scan_id: int, db: Session) -> Dict:
        """
        Builds a formal directed graph of the attack surface.
        Logic: Host -> Service -> Vulnerability -> Exploit
        """
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return {"nodes": [], "links": [], "critical_path": []}

        nodes = []
        links = []
        
        # 1. Host Node (Root)
        host_id = f"host_{scan.id}"
        nodes.append({
            "id": host_id,
            "label": scan.target,
            "type": "host",
            "val": 30,
            "color": "#3b82f6" # Cyber Blue
        })

        # Track unique services to avoid duplicate nodes
        services_processed = {}
        vulns_processed = set()
        
        critical_path_nodes = []
        max_cvss = -1.0
        top_vuln_node_id = None

        for f in scan.findings:
            # 2. Service Node
            service_key = f"{scan.id}_port_{f.port}"
            if service_key not in services_processed:
                nodes.append({
                    "id": service_key,
                    "label": f"Port {f.port}",
                    "type": "service",
                    "val": 20,
                    "color": "#f59e0b" # Orange
                })
                links.append({"source": host_id, "target": service_key, "label": "exposes"})
                services_processed[service_key] = True

            # 3. Vulnerability Node
            vuln_id = f"vuln_{f.id}"
            nodes.append({
                "id": vuln_id,
                "label": f.cve_id or f.name[:15],
                "type": "vulnerability",
                "severity": f.severity,
                "cvss": f.cvss or 0.0,
                "val": 15 + (f.cvss or 0),
                "color": "#ef4444" if f.severity == "Critical" else "#f97316"
            })
            links.append({"source": service_key, "target": vuln_id, "label": "vuln_at"})

            # 4. Exploit Node (If available)
            if f.exploit_db_id:
                exploit_node_id = f"exploit_{f.id}"
                nodes.append({
                    "id": exploit_node_id,
                    "label": f"EDB-{f.exploit_db_id}",
                    "type": "exploit",
                    "val": 25,
                    "color": "#39ff14" # Neon Green (Success/Exploit)
                })
                links.append({"source": vuln_id, "target": exploit_node_id, "label": "weaponized_by"})
                
                # Critical Path Logic: Host -> Service -> Vuln -> Exploit
                # The "Most Critical" is the one with highest CVSS that HAS an exploit
                if (f.cvss or 0) > max_cvss:
                    max_cvss = f.cvss or 0
                    critical_path_nodes = [host_id, service_key, vuln_id, exploit_node_id]

        # If no exploit found, find highest CVSS path anyway
        if not critical_path_nodes and scan.findings:
            best_f = max(scan.findings, key=lambda x: x.cvss or 0)
            critical_path_nodes = [host_id, f"{scan.id}_port_{best_f.port}", f"vuln_{best_f.id}"]

        return {
            "nodes": nodes,
            "links": links,
            "critical_path": critical_path_nodes,
            "metrics": {
                "nodes_count": len(nodes),
                "edges_count": len(links),
                "max_depth": 4 if any(n["type"] == "exploit" for n in nodes) else 3
            }
        }
