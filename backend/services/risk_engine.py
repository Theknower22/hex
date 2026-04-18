import math
import random
from typing import List, Dict

class RiskEngine:
    @staticmethod
    def calculate_custom_risk(finding: Dict) -> float:
        """Calculate the specific risk of a single vulnerability using:
           Risk Score = CVSS + Exposure + Asset Value
           For dashboard normalization (0-10 scale), we avg the three 0-10 components.
        """
        raw_cvss = finding.get("cvss_score") or finding.get("cvss") or 5.0
        cvss = float(raw_cvss)
        
        # Heuristics for Exposure (0-10): Critical web flaws are highly exposed.
        severity = finding.get("severity", "Medium")
        exposure = 9.0 if severity == "Critical" else (7.0 if severity == "High" else 5.0)
        
        # Heuristics for Asset Value (0-10): All scanned endpoints assumed high value in SOC context.
        asset_value = 8.0 
        
        # Formula: sum the values and divide by 3 to maintain the standard 0-10 gauge scale.
        raw_score = (cvss + exposure + asset_value) / 3.0
        return float("{:.1f}".format(raw_score))

    @staticmethod
    def calculate_overall_risk(findings: List[Dict]) -> float:
        """Calculate the overall system risk score based on ranked findings."""
        if not findings:
            return 0.0

        scores = [RiskEngine.calculate_custom_risk(f) for f in findings]
        
        # The overall system risk is determined by its weakest links (Top 3 highest scores)
        scores.sort(reverse=True)
        top_scores = scores[:3]
        
        # Average the top scores to give a representative global risk
        global_score = sum(top_scores) / len(top_scores)
        return min(float("{:.1f}".format(global_score)), 10.0)

    @staticmethod
    def rank_vulnerabilities(findings: List[Dict]) -> List[Dict]:
        """Rank and return vulnerabilities sorted by their custom Risk Score."""
        for f in findings:
            f['custom_risk_score'] = RiskEngine.calculate_custom_risk(f)
            
        ranked = sorted(findings, key=lambda x: x['custom_risk_score'], reverse=True)
        return ranked

    @staticmethod
    def get_risk_level(score: float) -> str:
        """Determine risk level from score."""
        if score >= 9.0: return "Critical"
        if score >= 7.0: return "High"
        if score >= 4.0: return "Medium"
        if score >= 0.1: return "Low"
        return "Secure"

    @staticmethod
    def get_risk_summary(score: float) -> str:
        """Provide a human-readable summary based on the risk score."""
        if score >= 9.0:
            return "CRITICAL: Multiple severe vulnerabilities detected. Immediate remediation required to prevent imminent breach."
        if score >= 7.0:
            return "HIGH: Significant security gaps identified. High probability of exploitation. Schedule urgent patching."
        if score >= 4.0:
            return "MEDIUM: Several security issues found. While not immediately critical, these provide pathways for advanced attackers."
        if score >= 0.1:
            return "LOW: Minor security improvements recommended. System is generally stable but follow best practices."
        return "SECURE: No known vulnerabilities detected at this time. Maintain regular scanning schedule."

    @staticmethod
    def get_infrastructure_topology(target: str) -> Dict:
        """Generate a virtual network layout for a given target."""
        return {
            "nodes": [
                {"id": 1, "label": f"External ({target})", "type": "entry", "x": 50, "y": 150, "color": "#3b82f6", "val": 20},
                {"id": 2, "label": "Security GW", "type": "gateway", "x": 180, "y": 150, "color": "#10b981", "val": 15},
                {"id": 3, "label": "Web Cluster", "type": "server", "x": 320, "y": 80, "color": "#f59e0b", "val": 18},
                {"id": 4, "label": "App API", "type": "server", "x": 320, "y": 220, "color": "#f59e0b", "val": 18},
                {"id": 5, "label": "Data Core", "type": "database", "x": 500, "y": 150, "color": "#ef4444", "val": 25},
            ],
            "links": [
                {"source": 1, "target": 2},
                {"source": 2, "target": 3},
                {"source": 2, "target": 4},
                {"source": 3, "target": 5},
                {"source": 4, "target": 5},
            ]
        }

    @staticmethod
    def get_heatmap_data(findings: List[Dict]) -> List[List[int]]:
        """Generate a 4x6 grid of risk levels (0-10) based on findings."""
        # Initialize a 4x6 grid of zeros.
        base_grid = [[0, 0, 0, 0, 0, 0] for _ in range(4)]
        
        # Categorize findings into grid regions
        for f in findings:
            severity = f.get("severity", "Low")
            weight = 3 if severity == "Critical" else (2 if severity == "High" else 1)
            
            # Map severity to "Hotspots" in the grid randomly for visual variety
            # or based on type if we had more metadata
            r, c = random.randint(0, 3), random.randint(0, 5)
            base_grid[r][c] = min(10, base_grid[r][c] + weight)
            
        return base_grid

    @staticmethod
    def get_dynamic_attack_path(findings: List[Dict], target: str) -> List[Dict]:
        """Calculates the specific steps of an attack path based on findings."""
        path = [
            {"title": "Initial Access", "icon": "Target", "active": True, "desc": f"Reconnaissance on {target} identified open entry points."}
        ]
        
        # Determine next steps based on findings
        has_vuln = len(findings) > 0
        has_high = any(f.get("severity") in ["High", "Critical"] for f in findings)
        has_critical = any(f.get("severity") == "Critical" for f in findings)
        
        path.append({
            "title": "Exploitation", 
            "icon": "Ghost", 
            "active": has_vuln, 
            "desc": "Active vulnerability found in external services." if has_vuln else "Monitoring for potential entry vectors."
        })
        
        path.append({
            "title": "Privilege Escalation", 
            "icon": "Zap", 
            "active": has_high, 
            "desc": "Critically weak service configuration allows for authorization bypass." if has_high else "Access restricted to low-privileged users."
        })
        
        path.append({
            "title": "Lateral Movement", 
            "icon": "Database", 
            "active": has_high and has_vuln, 
            "desc": "Internal network segments reachable via compromised service." if has_high else "Movement blocked by internal firewalls."
        })
        
        path.append({
            "title": "Exfiltration", 
            "icon": "Lock", 
            "active": has_critical, 
            "desc": "Data extraction chain fully established." if has_critical else "Data exfiltration currently mitigated."
        })
        
        return path
