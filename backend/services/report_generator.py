from typing import Dict, List
import json
import base64
import os
import html
from datetime import datetime
from services.risk_engine import RiskEngine

class ReportGenerator:
    # Cache for the logo to avoid redundant disk I/O and CPU overhead
    _logo_cache = None

    @staticmethod
    def get_logo_base64() -> str:
        """Fetch and cache the Base64 representation of the logo."""
        if ReportGenerator._logo_cache:
            return ReportGenerator._logo_cache
            
        logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "hex_logo.jpeg"))
        if not os.path.exists(logo_path):
             logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/hex_logo.jpeg"))
             
        if os.path.exists(logo_path):
            try:
                with open(logo_path, "rb") as image_file:
                    encoded = base64.b64encode(image_file.read()).decode('utf-8')
                    ReportGenerator._logo_cache = f"data:image/jpeg;base64,{encoded}"
                    return ReportGenerator._logo_cache
            except Exception:
                pass
        return ""

    @staticmethod
    def generate_json_report(scan_data: Dict) -> str:
        """Generate a basic structured JSON report."""
        return json.dumps(scan_data, indent=4, default=str)

    @staticmethod
    def generate_professional_json(scan_data: Dict) -> Dict:
        """
        Generates a professional-grade structured JSON report with 6 industry-standard sections.
        This is used for deeper backend analysis and structured exports.
        """
        findings = scan_data.get("findings", [])
        risk_score = scan_data.get("risk_score", 0.0)
        
        # 1. Executive Summary
        executive_summary = {
            "security_posture_overview": f"Target {scan_data.get('target')} displays a {RiskEngine.get_risk_level(risk_score)} risk posture.",
            "total_vulnerabilities": len(findings),
            "severity_distribution": {
                "Critical": sum(1 for f in findings if f.get("severity") == "Critical"),
                "High": sum(1 for f in findings if f.get("severity") == "High"),
                "Medium": sum(1 for f in findings if f.get("severity") == "Medium"),
                "Low": sum(1 for f in findings if f.get("severity") == "Low"),
            }
        }

        # 2. Technical Findings
        technical_findings = []
        for f in findings:
            technical_findings.append({
                "title": f.get("name"),
                "severity": f.get("severity"),
                "cvss_score": f.get("cvss"),
                "affected_asset": f"{scan_data.get('target')}:{f.get('port', 'N/A')}",
                "description": f.get("description"),
                "poc": f.get("poc", "Nmap/Curl probe documentation available in lab logs."),
                "exploitation_scenario": f.get("exploitation_scenario", "Standard protocol exploitation sequence."),
                "impact": f.get("impact", "Data exposure and service interruption."),
                "remediation_steps": f.get("remediation")
            })

        # 3. Risk Analysis
        risk_analysis = {
            "prioritized_vulnerabilities": sorted(findings, key=lambda x: x.get("cvss", 0), reverse=True)[:3],
            "attack_paths": scan_data.get("attack_paths", ["Initial Access -> Post-Exploitation"])
        }

        # 4. Visual Insights
        visual_insights = {
            "severity_chart_data": executive_summary["severity_distribution"],
            "vulnerability_categories": ["Injection", "Configuration", "Authentication"],
            "top_vulnerable_hosts": [scan_data.get("target")]
        }

        # 5. Recommendations
        recommendations = {
            "immediate_fixes": ["Patch critical vulnerabilities", "Enforce WAF rules"],
            "long_term_improvements": ["Shift-left security integration", "Continuous monitoring"]
        }

        # 6. Conclusion
        conclusion = {
            "overall_risk_posture": RiskEngine.get_risk_level(risk_score),
            "suggested_next_steps": "Schedule remediation verification scan within 48 hours."
        }

        return {
            "executive_summary": executive_summary,
            "technical_findings": technical_findings,
            "risk_analysis": risk_analysis,
            "visual_insights": visual_insights,
            "recommendations": recommendations,
            "conclusion": conclusion,
            "metadata": {
                "scan_id": scan_data.get("scan_id"),
                "timestamp": datetime.now().isoformat()
            }
        }

    @staticmethod
    def generate_markdown_report(scan_data: Dict) -> str:
        """
        Generates a professional Markdown report following the 6-section structure.
        """
        prof_data = ReportGenerator.generate_professional_json(scan_data)
        
        target = scan_data.get("target")
        exec_sum = prof_data["executive_summary"]
        
        md = f"# Security Audit Report: {target}\n\n"
        md += f"**Audit ID:** {scan_data.get('scan_id')} | **Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        md += "---\n\n"

        # 1. Executive Summary
        md += "## 1. Executive Summary\n"
        md += f"{exec_sum['security_posture_overview']}\n\n"
        md += f"- **Total Vulnerabilities:** {exec_sum['total_vulnerabilities']}\n"
        md += f"- **Risk Level:** {prof_data['conclusion']['overall_risk_posture']}\n\n"
        md += "| Severity | Count |\n| --- | --- |\n"
        for sev, count in exec_sum["severity_distribution"].items():
            md += f"| {sev} | {count} |\n"
        md += "\n"

        # 2. Technical Findings
        md += "## 2. Technical Findings\n"
        for i, f in enumerate(prof_data["technical_findings"]):
            md += f"### 2.{i+1} {f['title']}\n"
            md += f"- **Severity:** {f['severity']} (CVSS: {f['cvss_score']})\n"
            md += f"- **Affected Asset:** `{f['affected_asset']}`\n\n"
            md += f"**Description:**\n{f['description']}\n\n"
            md += f"**Exploit Scenario:**\n{f['exploitation_scenario']}\n\n"
            md += f"**Proof of Concept:**\n```bash\n{f['poc']}\n```\n\n"
            md += f"**Impact:**\n{f['impact']}\n\n"
            md += f"**Remediation:**\n{f['remediation_steps']}\n\n"
            md += "---\n\n"

        # 3. Risk Analysis
        md += "## 3. Risk Analysis\n"
        md += "### Prioritized Action Items\n"
        for f in prof_data["risk_analysis"]["prioritized_vulnerabilities"]:
            md += f"- {f.get('name')} (CVSS: {f.get('cvss')})\n"
        md += "\n### Attack Paths\n"
        for path in prof_data["risk_analysis"]["attack_paths"]:
            md += f"- {path}\n"
        md += "\n"

        # 4. Visual Insights
        md += "## 4. Visual Insights\n"
        md += "*Note: High-fidelity charts are available in the HexaShield Dashboard interactive view.*\n\n"
        md += f"- **Top Vulnerable Host:** {prof_data['visual_insights']['top_vulnerable_hosts'][0]}\n"
        md += "- **Detected Categories:** " + ", ".join(prof_data["visual_insights"]["vulnerability_categories"]) + "\n\n"

        # 5. Recommendations
        md += "## 5. Recommendations\n"
        md += "### Immediate Actions\n"
        for rec in prof_data["recommendations"]["immediate_fixes"]:
            md += f"- {rec}\n"
        md += "\n### Long-term Security Strategy\n"
        for rec in prof_data["recommendations"]["long_term_improvements"]:
            md += f"- {rec}\n"
        md += "\n"

        # 6. Conclusion
        md += "## 6. Conclusion\n"
        md += f"The overall risk posture for {target} is currently **{prof_data['conclusion']['overall_risk_posture']}**. "
        md += f"{prof_data['conclusion']['suggested_next_steps']}\n\n"
        
        md += "---\n*Generated by HexaShield Professional Reporting Engine*"
        
        return md

    @staticmethod
    def generate_html_report(scan_data: Dict) -> str:
        """Generate a professional, high-fidelity security audit report matching the dashboard aesthetic."""
        findings = scan_data.get("findings", [])
        recon = scan_data.get("recon", {})
        exploits = scan_data.get("exploits", [])
        geo = recon.get("ip_intelligence", {})
        headers = recon.get("headers", {})
        subdomains = recon.get("subdomains", [])
        
        target = html.escape(str(scan_data.get("target", "Unknown")))
        scan_id = html.escape(str(scan_data.get("scan_id", "N/A")))
        logo_src = ReportGenerator.get_logo_base64()

        now = datetime.now()
        ts_display = now.strftime("%Y-%m-%d %H:%M:%S")
        scan_ts = str(scan_data.get("timestamp", "N/A"))[:19].replace("T", " ")
        
        risk_score = scan_data.get("risk_score", 0)
        risk_level = RiskEngine.get_risk_level(risk_score)
        
        risk_color = "#ff003c" if risk_score >= 7 else ("#f0b429" if risk_score >= 4 else "#39ff14")

        # 1. Findings Mapping
        findings_html_list = []
        sev_colors = {"Critical": "#ff003c", "High": "#ff6b35", "Medium": "#f0b429", "Low": "#39ff14", "Info": "#0071ff"}
        for f in findings:
            sev = html.escape(str(f.get("severity", "Info")))
            sc = sev_colors.get(sev, "#888")
            findings_html_list.append(f"""
            <div style="margin-bottom:32px; border:1px solid rgba(255,255,255,0.05); border-radius:30px; overflow:hidden; background:#050505; page-break-inside:avoid;">
                <div style="background:rgba(255,255,255,0.01); padding:24px 32px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:900; color:#fff; font-size:15px; text-transform:uppercase; letter-spacing:1px;">{html.escape(f.get('name',''))}</span>
                    <span style="background:{sc}10; color:{sc}; border:1px solid {sc}30; padding:6px 16px; border-radius:100px; font-size:10px; font-weight:900; text-transform:uppercase;">{sev} CVSS:{f.get('cvss', 0)}</span>
                </div>
                <div style="padding:32px; display:grid; grid-template-columns: 1.2fr 1fr; gap:40px;">
                    <div>
                        <div style="font-size:9px; font-weight:900; color:#333; text-transform:uppercase; letter-spacing:3px; margin-bottom:15px;">Vulnerability Intelligence</div>
                        <p style="font-size:12px; color:#888; line-height:1.7; margin-bottom:24px;">{html.escape(f.get('description',''))}</p>
                        <div style="display:flex; gap:12px;">
                            <div style="background:#0a0a0b; border:1px solid rgba(255,255,255,0.05); padding:10px 16px; border-radius:12px;">
                                <span style="display:block; font-size:8px; color:#444; text-transform:uppercase; margin-bottom:4px;">OWASP</span>
                                <span style="font-size:10px; font-weight:900; color:#0071ff;">{html.escape(f.get('owasp', 'A03:2021'))}</span>
                            </div>
                            <div style="background:#0a0a0b; border:1px solid rgba(255,255,255,0.05); padding:10px 16px; border-radius:12px;">
                                <span style="display:block; font-size:8px; color:#444; text-transform:uppercase; margin-bottom:4px;">MITRE</span>
                                <span style="font-size:10px; font-weight:900; color:#ff003c;">{html.escape(f.get('mitre', 'T1190'))}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:9px; font-weight:900; color:#39ff14; text-transform:uppercase; letter-spacing:3px; margin-bottom:15px; border-left:3px solid #39ff14; padding-left:12px;">Remediation Protocol</div>
                        <div style="background:rgba(57,255,20,0.02); border:1px solid rgba(57,255,20,0.1); padding:20px; border-radius:16px; color:#39ff14; font-size:12px; font-weight:600; line-height:1.6;">
                            {html.escape(f.get('remediation',''))}
                        </div>
                    </div>
                </div>
            </div>""")

        # 2. Port Results
        ports_data = scan_data.get("ports", [])
        ports_html_list = []
        for p in ports_data:
            prisk = "#ff003c" if p.get('risk') == 'Critical' else ("#ff6b35" if p.get('risk') == 'High' else ("#f0b429" if p.get('risk') == 'Medium' else "#39ff14"))
            ports_html_list.append(f"""
            <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.05); border-radius:20px; margin-bottom:12px; font-family:'JetBrains Mono',monospace;">
                <div style="display:flex; align-items:center; gap:25px;">
                    <span style="color:#0071ff; font-weight:900; width:50px; font-size:13px;">{p.get('port')}</span>
                    <span style="color:#fff; font-weight:900; width:100px; text-transform:uppercase; font-size:11px;">{p.get('service')}</span>
                    <span style="color:#444; font-size:11px;">{html.escape(str(p.get('banner', 'N/A')))}</span>
                </div>
                <span style="color:{prisk}; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:1px; background:{prisk}10; padding:4px 10px; border-radius:100px;">{p.get('risk')}</span>
            </div>""")

        # 3. Offensive Evidence (New Section)
        exploit_html_list = []
        for ex in exploits:
            output_lines = []
            for i, line in enumerate(ex.get("output", [])):
                lcolor = "#00ff41" if "[SUCCESS]" in line or "[+]" in line else ("#0071ff" if "[!]" in line else ("#555" if "[*]" in line else "#888"))
                output_lines.append(f"""
                <div style="display:flex; gap:15px; margin-bottom:4px; font-family:'JetBrains Mono',monospace; font-size:11px;">
                    <span style="color:#222; width:30px; text-align:right;">[{i+1}]</span>
                    <span style="color:{lcolor}; word-break:break-all;">{html.escape(line)}</span>
                </div>""")
            
            exploit_html_list.append(f"""
            <div style="margin-bottom:40px; page-break-inside:avoid;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
                    <div style="width:12px; height:12px; border-radius:50%; background:#00ff41; box-shadow:0 0 10px #00ff4180;"></div>
                    <span style="font-weight:900; color:#fff; text-transform:uppercase; font-size:14px; letter-spacing:1px;">Incursion Log: {html.escape(ex.get('vulnerability',''))}</span>
                </div>
                <div style="background:#030303; border:1px solid rgba(255,255,255,0.05); border-radius:24px; padding:32px; max-height:500px; overflow:hidden;">
                    {"".join(output_lines)}
                </div>
            </div>""")

        subdomains_html = "".join([f'<span style="padding:6px 14px; background:#0a0a0b; border:1px solid rgba(0,113,255,0.2); border-radius:10px; font-family:\'JetBrains Mono\',monospace; font-size:11px; color:#0071ff; display:inline-block; margin:0 10px 10px 0; font-weight:900;">{html.escape(s)}</span>' for s in subdomains])
        ports_final_html = "".join(ports_html_list) if ports_data else '<div style="padding:32px; text-align:center; color:#444; font-size:12px; font-weight:900; letter-spacing:2px;">NO_ACTIVE_SERVICES_FOUND</div>'
        findings_final_html = "".join(findings_html_list) if findings else '<div style="padding:50px; text-align:center; background:#050505; border:1px dashed rgba(255,255,255,0.05); border-radius:30px; color:#444; font-size:12px; font-weight:900; letter-spacing:2px;">ZERO_VULNERABILITIES_IDENTIFIED</div>'
        exploit_final_html = "".join(exploit_html_list) if exploit_html_list else '<div style="padding:32px; text-align:center; color:#444; font-size:12px; font-weight:900; letter-spacing:2px; border:1px solid rgba(255,255,255,0.05); border-radius:20px;">NO_OFFENSIVE_ACTIONS_RECORDED</div>'

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>HEXA-AUDIT-{scan_id}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        * {{ margin:0; padding:0; box-sizing:border-box; }}
        body {{ background: #000; color:#fff; font-family:'Inter', sans-serif; padding:100px 80px; line-height:1.5; }}
        @media print {{
            body {{ background:#fff!important; color:#000!important; padding:40px; }}
            .no-print {{ display:none!important; }}
            div, p, span {{ color: inherit!important; background: transparent!important; border-color: #eee!important; }}
            h1, h2, h3, h4 {{ color: #000!important; }}
            .overlay-card {{ border: 1px solid #eee!important; }}
            .section-num {{ color: #000!important; }}
        }}
        .header {{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:100px; }}
        h1 {{ font-size:48px; font-weight:900; letter-spacing:-2px; line-height:0.95; margin-bottom:20px; }}
        .section-title {{ font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:5px; color:#444; margin-bottom:40px; display:flex; align-items:center; gap:20px; }}
        .section-num {{ color:#0071ff; font-family:'JetBrains Mono', monospace; font-size:24px; font-style:italic; }}
        .overlay-grid {{ display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:60px; }}
        .overlay-card {{ background:#050505; border:1px solid rgba(255,255,255,0.05); padding:40px; border-radius:40px; }}
        .overlay-label {{ font-size:10px; color:#333; text-transform:uppercase; letter-spacing:4px; margin-bottom:24px; font-weight:900; border-left:2px solid #0071ff; padding-left:12px; }}
        .telemetry-row {{ display:flex; margin-bottom:12px; font-family:'JetBrains Mono', monospace; font-size:12px; justify-content:space-between; }}
        .telemetry-key {{ color:#222; text-transform:uppercase; font-weight:900; }}
        .telemetry-val {{ color:#fff; font-weight:700; }}
        .print-btn {{ position:fixed; top:40px; right:40px; background:#0071ff; color:#fff; border:none; padding:20px 40px; border-radius:20px; font-weight:900; font-size:12px; cursor:pointer; letter-spacing:3px; box-shadow:0 20px 60px rgba(0,113,255,0.5); z-index:100; text-transform:uppercase; transition:all 0.4s; }}
        .print-btn:hover {{ transform:translateY(-4px); box-shadow:0 30px 80px rgba(0,113,255,0.6); }}
    </style>
</head>
<body>
    <button class="print-btn no-print" onclick="window.print()">PRINT TO PDF</button>

    <div class="header">
        <div>
            <div style="font-size:11px; font-weight:900; color:#0071ff; letter-spacing:6px; margin-bottom:15px; text-transform:uppercase;">HexaShield // Offensive Intelligence</div>
            <h1>Security Audit<br/><span style="color:#0071ff;">Deep-Dive Report</span></h1>
            <p style="font-size:14px; color:#555; max-width:500px; font-weight:500; font-style:italic;">Comprehensive vulnerability mapping and tactical incursion evidence for target: <b style="color:#fff; font-style:normal;">{target}</b></p>
        </div>
        <div style="text-align:right;">
             <div style="background:#050505; border:1px solid #0071ff; padding:24px 40px; border-radius:25px; margin-bottom:20px; box-shadow:0 0 40px rgba(0,113,255,0.1);">
                <div style="font-size:10px; color:#333; text-transform:uppercase; letter-spacing:4px; margin-bottom:8px; font-weight:900;">Audit Index</div>
                <div style="font-family:'JetBrains Mono', monospace; font-size:32px; font-weight:900; color:#fff;">REP-{scan_id}</div>
            </div>
            <div style="font-size:12px; color:#444; font-weight:900; line-height:2.2; font-family:'JetBrains Mono', monospace; text-transform:uppercase; letter-spacing:2px;">
                DATE: <span style="color:#fff;">{ts_display}</span><br/>
                STATION: <span style="color:#fff;">HEXA_ALPHA_42</span><br/>
                AUDITOR: <span style="color:#0071ff;">THE KNOWER</span>
            </div>
        </div>
    </div>

    <!-- 01/ INTELLIGENCE SUMMARY -->
    <div style="margin-bottom:80px;">
        <div class="section-title"><span class="section-num">01/</span> Infrastructure Intel</div>
        <div class="overlay-grid">
            <div class="overlay-card">
                <div class="overlay-label">Service Fingerprinting</div>
                <div class="telemetry-row"><span class="telemetry-key">OS Family:</span><span class="telemetry-val" style="color:#0071ff;">{headers.get('version', 'Unknown')}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">Main Server:</span><span class="telemetry-val">{headers.get('headers', {}).get('Server', 'Unknown')}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">Subsystem:</span><span class="telemetry-val">{headers.get('headers', {}).get('X-Powered-By', 'N/A')}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">Scan Type:</span><span class="telemetry-val" style="color:#444;">Deep Interrogation</span></div>
            </div>
            <div class="overlay-card">
                <div class="overlay-label">Geospatial Telemetry</div>
                <div class="telemetry-row"><span class="telemetry-key">Location:</span><span class="telemetry-val">{geo.get('city', 'Unknown')}, {geo.get('country', 'N/A')}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">Lat/Long:</span><span class="telemetry-val" style="color:#0071ff;">{float(geo.get('lat', 0.0)):.4f}, {float(geo.get('lon', 0.0)):.4f}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">ISP/ORG:</span><span class="telemetry-val">{geo.get('org', geo.get('isp', 'N/A'))}</span></div>
                <div class="telemetry-row"><span class="telemetry-key">ASN:</span><span class="telemetry-val" style="color:#444;">{geo.get('asn', 'N/A')}</span></div>
            </div>
        </div>
        {f'<div class="overlay-card" style="border-radius:30px;"><div class="overlay-label">Active Host Vectors (Subdomains)</div><div style="padding-top:10px;">{subdomains_html}</div></div>' if subdomains else ''}
    </div>

    <!-- 02/ NETWORK SCANNING -->
    <div style="margin-bottom:80px;">
        <div class="section-title"><span class="section-num">02/</span> Service Port Discovery</div>
        <div style="background:#050505; border:1px solid rgba(255,255,255,0.05); border-radius:35px; padding:40px;">
            {ports_final_html}
        </div>
    </div>

    <!-- 03/ VULN ANALYSIS -->
    <div style="margin-bottom:80px;">
        <div class="section-title"><span class="section-num">03/</span> Vulnerability Deep-Dive</div>
        {findings_final_html}
    </div>

    <!-- 04/ OFFENSIVE EVIDENCE -->
    <div style="margin-bottom:100px;">
        <div class="section-title"><span class="section-num">04/</span> Offensive Documentation</div>
        <p style="font-size:12px; color:#555; margin-bottom:40px; font-weight:600; font-family:'JetBrains Mono',monospace;">// RECONSTRUCTED KILL-CHAIN LOGS DERIVED FROM LAB EMULATION //0X92</p>
        {exploit_final_html}
    </div>

    <div style="text-align:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:100px; padding-bottom:100px; position:relative;">
        <div style="position:absolute; top:-1px; left:50%; transform:translateX(-50%); width:300px; height:2px; background:linear-gradient(90deg, transparent, #0071ff, transparent); box-shadow:0 0 30px #0071ff80;"></div>
        {f'<img src="{logo_src}" style="width:140px; height:140px; border-radius:50%; border:2px solid #0071ff; padding:5px; margin-bottom:40px; box-shadow:0 0 80px rgba(0,113,255,0.2);">' if logo_src else ''}
        <h2 style="font-size:32px; font-weight:900; color:#fff; letter-spacing:-1px; margin-bottom:10px;">HEXASHIELD // <span style="color:#0071ff;">CORE ENGINE</span></h2>
        <div style="font-size:11px; color:#0071ff; font-weight:900; text-transform:uppercase; letter-spacing:6px;">Autonomous Security Intelligence Framework</div>
        <p style="font-size:10px; color:#333; margin-top:50px; font-weight:900; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:4px;">Strictly Confidential • AUDIT_ID: {scan_id} • (C) 2026</p>
    </div>
</body>
</html>"""

    @staticmethod
    def generate_report(scan_data: Dict, format: str = "json") -> str:
        if format == "html":
            return ReportGenerator.generate_html_report(scan_data)
        return ReportGenerator.generate_json_report(scan_data)
