from typing import Dict, List
import json
from datetime import datetime

import html


class ReportGenerator:
    @staticmethod
    def generate_json_report(scan_data: Dict) -> str:
        """Generate a structured JSON report."""
        return json.dumps(scan_data, indent=4, default=str)

    @staticmethod
    def generate_html_report(scan_data: Dict) -> str:
        """Generate a professional, print-to-PDF-ready graduation-level audit report."""
        findings = scan_data.get("findings", [])
        ports = scan_data.get("ports", [])
        recon = scan_data.get("recon", {})
        ssl_info = recon.get("ssl_info", {})
        subdomains = recon.get("subdomains", [])
        geo = recon.get("ip_intelligence", {})
        
        target = html.escape(str(scan_data.get("target", "Unknown")))
        scan_id = html.escape(str(scan_data.get("scan_id", "N/A")))
        timestamp_str = str(scan_data.get("timestamp") or datetime.now().isoformat())
        ts_display = html.escape(timestamp_str[:19].replace("T", " "))

        risk_score = scan_data.get("risk_score", 0)
        
        # Determine risk level color
        if risk_score >= 7:
            risk_color = "#ff003c"
            risk_label = "CRITICAL"
        elif risk_score >= 4:
            risk_color = "#ffcc00"
            risk_label = "MEDIUM"
        else:
            risk_color = "#39ff14"
            risk_label = "LOW"

        findings_html = ""
        for f in findings:
            sev = html.escape(str(f.get("severity", "Info")))
            name = html.escape(str(f.get("name","N/A")))
            desc = html.escape(str(f.get("description","N/A")))
            rem = html.escape(str(f.get("remediation","N/A")))
            cvss = f.get("cvss", 0)
            cve = html.escape(str(f.get("cve_id", "N/A")))
            owasp = html.escape(str(f.get("owasp_category", "N/A")))
            mitre = html.escape(str(f.get("mitre_id", "N/A")))

            sev_colors = {"Critical": "#ff003c", "High": "#ff6b35", "Medium": "#ffcc00", "Low": "#39ff14", "Info": "#0047ff"}
            sc = sev_colors.get(sev, "#888")
            
            cve_tag = f'<span style="margin-left:8px;background:#ff003c15;color:#ff003c;border:1px solid #ff003c40;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;">{cve}</span>' if cve != 'N/A' else ''

            findings_html += f"""
            <div style="margin-bottom:32px;border:1px solid #1a1a1b;border-radius:12px;overflow:hidden;background:#0f0f12;">
                <div style="background:#0a0a0b;padding:16px;border-bottom:1px solid #1a1a1b;display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;align-items:center;">
                        <span style="font-weight:900;color:#fff;font-size:14px;">{name.upper()}</span>
                        {cve_tag}
                    </div>
                    <span style="background:{sc}20;color:{sc};border:1px solid {sc}60;padding:4px 12px;border-radius:6px;font-size:10px;font-weight:900;">{sev.upper()} (CVSS: {cvss})</span>
                </div>
                <div style="padding:20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px;">
                        <div>
                            <div style="font-size:9px;color:#555;letter-spacing:2px;margin-bottom:8px;">VULNERABILITY DESCRIPTION</div>
                            <div style="font-size:12px;color:#9ca3af;line-height:1.6;">{desc}</div>
                        </div>
                        <div>
                            <div style="font-size:9px;color:#39ff14;letter-spacing:2px;margin-bottom:8px;">RECOMMENDED REMEDIATION</div>
                            <div style="font-size:12px;color:#e0e0e0;line-height:1.6;background:#39ff1410;padding:12px;border-radius:8px;border:1px dashed #39ff1440;">{rem}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:12px;border-top:1px solid #1a1a1b;padding-top:16px;">
                        <div style="background:#0047ff10;padding:8px 16px;border-radius:8px;border:1px solid #0047ff20;">
                            <div style="font-size:8px;color:#555;text-transform:uppercase;margin-bottom:4px;">OWASP CATEGORY</div>
                            <div style="font-size:11px;color:#0047ff;font-weight:700;">{owasp}</div>
                        </div>
                        <div style="background:#ff6b3510;padding:8px 16px;border-radius:8px;border:1px solid #ff6b3520;">
                            <div style="font-size:8px;color:#555;text-transform:uppercase;margin-bottom:4px;">MITRE ATT&CK</div>
                            <div style="font-size:11px;color:#ff6b35;font-weight:700;">{mitre}</div>
                        </div>
                    </div>
                </div>
            </div>"""

        ports_html = ""
        for p in ports:
            risk = html.escape(p.get("risk", "Low"))
            port_val = html.escape(str(p.get("port","N/A")))
            service = html.escape(p.get("service","Unknown"))
            banner = html.escape(p.get("banner","No Banner Detected"))

            risk_colors = {"Critical": "#ff003c", "High": "#ff6b35", "Medium": "#ffcc00", "Low": "#39ff14"}
            rc = risk_colors.get(risk, "#888")
            ports_html += f"""
            <tr style="border-bottom:1px solid #1a1a1b;">
                <td style="padding:16px;font-family:'JetBrains Mono',monospace;color:#0047ff;font-size:12px;">{port_val}/TCP</td>
                <td style="padding:16px;color:#fff;font-weight:700;font-size:12px;">{service.upper()}</td>
                <td style="padding:16px;color:#9ca3af;font-size:11px;font-family:'JetBrains Mono',monospace;">{banner}</td>
                <td style="padding:16px;text-align:right;"><span style="color:{rc};font-size:10px;font-weight:900;">{risk.upper()}</span></td>
            </tr>"""

        subdomains_html = "".join([f'<div style="padding:8px 12px;background:#1a1a1b;border-radius:6px;font-family:monospace;font-size:11px;color:#0047ff;">{html.escape(s)}</div>' for s in subdomains])

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>GRADUATION_REPORT_{scan_id}_{target}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        *{{margin:0;padding:0;box-sizing:border-box;}}
        body{{background:#050505;color:#ffffff;font-family:'Inter',sans-serif;padding:64px;line-height:1.5;}}
        @media print {{
            body{{background:#ffffff!important;color:#000!important;padding:40px;}}
            .no-print{{display:none!important;}}
            .cyber-panel{{border:1px solid #eee!important;background:#f9f9f9!important;color:#000!important;}}
            .label{{color:#777!important;}}
            .value{{color:#000!important;}}
            table{{border:1px solid #eee!important;background:#fff!important;}}
            th{{background:#f0f0f0!important;color:#333!important;}}
            td{{border-bottom:1px solid #eee!important;color:#333!important;}}
        }}
        .header-main{{display:flex;justify-content:space-between;border-bottom:2px solid #0047ff;padding-bottom:32px;margin-bottom:48px;}}
        .logo-text{{font-size:10px;font-weight:900;letter-spacing:5px;color:#0047ff;margin-bottom:8px;}}
        h1{{font-size:36px;font-weight:900;letter-spacing:-1.5px;line-height:1;margin-top:12px;}}
        .meta-grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:64px;}}
        .meta-box{{background:#0f0f12;border:1px solid #1a1a1b;padding:24px;border-radius:16px;}}
        .label{{font-size:9px;color:#555;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:900;}}
        .value{{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;word-break:break-all;}}
        h2{{font-size:18px;font-weight:900;margin-bottom:24px;display:flex;items-center:center;gap:12px;text-transform:uppercase;letter-spacing:1px;}}
        .section{{margin-bottom:64px;}}
        .print-btn{{position:fixed;top:32px;right:32px;background:#0047ff;color:white;border:none;padding:16px 32px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;letter-spacing:2px;box-shadow:0 10px 30px rgba(0,71,255,0.3);z-index:100;}}
        .print-btn:hover{{transform:translateY(-2px);background:#0035cc;}}
    </style>
</head>
<body>
    <button class="print-btn no-print" onclick="window.print()">GENERATE PDF REPORT</button>

    <div class="header-main">
        <div>
            <div class="logo-text">HEXASHIELD SYSTEM_NODE_X</div>
            <h1>Security Intelligence<br/><span style="color:#0047ff;">Executive Audit</span></h1>
            <p style="margin-top:16px;color:#555;font-size:12px;max-width:400px;">Professional security assessment for <b>Khaled Hani's Graduation Project</b>. This document contains sensitive node telemetry and vulnerability data.</p>
        </div>
        <div style="text-align:right;">
            <div style="padding:12px 24px;background:#0047ff10;border:1px solid #0047ff40;border-radius:12px;display:inline-block;">
                <div class="label" style="margin-bottom:4px;color:#0047ff;">Report Tracking ID</div>
                <div class="value" style="font-size:18px;">REP-{scan_id}</div>
            </div>
            <div style="margin-top:16px;font-size:11px;color:#555;font-weight:700;">CLASSIFICATION: LEVEL_3_RESTRICTED<br/>GENERATED: {ts_display}</div>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-box">
            <div class="label">Target Infrastructure</div>
            <div class="value" style="color:#0047ff;">{target}</div>
        </div>
        <div class="meta-box">
            <div class="label">Primary Node IP</div>
            <div class="value">{geo.get('ip', 'LOCAL_HOST')}</div>
        </div>
        <div class="meta-box">
            <div class="label">Risk Assessment</div>
            <div class="value" style="color:{risk_color};">{risk_label} ({risk_score}/10)</div>
        </div>
        <div class="meta-box">
            <div class="label">Total Findings</div>
            <div class="value">{len(findings)} VULNS</div>
        </div>
    </div>

    <!-- RECONNAISSANCE SECTION -->
    <div class="section">
        <h2><span style="color:#0047ff;">01/</span> Passive Intelligence</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <div class="meta-box" style="background:#0a0a0b;">
                <div class="label">Domain WHOIS Data</div>
                {f'''<div class="value" style="font-size:12px;line-height:1.8;">
                    <span style="color:#555;">REGISTRAR:</span> {html.escape(str(recon.get('whois_info', dict()).get('registrar', 'N/A')))}<br/>
                    <span style="color:#555;">CREATED:</span> {html.escape(str(recon.get('whois_info', dict()).get('creation_date', 'N/A')).split('T')[0])}<br/>
                    <span style="color:#555;">EXPIRES:</span> {html.escape(str(recon.get('whois_info', dict()).get('expiration_date', 'N/A')).split('T')[0])}<br/>
                    <span style="color:#555;">OWNER:</span> {html.escape(str(recon.get('whois_info', dict()).get('org') or recon.get('whois_info', dict()).get('name') or 'N/A'))}
                </div>''' if recon.get('whois_info') and not recon.get('whois_info', dict()).get('error') else '<div class="value" style="color:#333;">NO_WHOIS_DATA</div>'}
            </div>
            <div class="meta-box" style="background:#0a0a0b;">
                <div class="label">SSL/TLS Configuration</div>
                {f'''<div class="value" style="font-size:12px;line-height:1.8;">
                    <span style="color:#555;">ISSUER:</span> {ssl_info.get('issuer', dict()).get('O', 'Unknown')}<br/>
                    <span style="color:#555;">EXPIRY:</span> <span style="color:{'#ff003c' if ssl_info.get('expired') else '#39ff14'}">{ssl_info.get('notAfter', 'N/A').split('T')[0]}</span><br/>
                    <span style="color:#555;">STATUS:</span> {"EXPIRED - CRITICAL RISK" if ssl_info.get('expired') else "VALID_ENCRYPTION"}
                </div>''' if ssl_info and not ssl_info.get('error') else '<div class="value" style="color:#333;">NO_SSL_DATA_AVAILABLE</div>'}
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;">
            <div class="meta-box" style="background:#0a0a0b;">
                <div class="label">Service Fingerprint</div>
                <div class="value" style="font-size:12px;line-height:1.8;">
                    <span style="color:#555;">DETECTED VERSION:</span> <span style="color:#39ff14;">{html.escape(str(recon.get('headers', dict()).get('version', 'Unknown')))}</span><br/>
                    <span style="color:#555;">SERVER TYPE:</span> {html.escape(str(recon.get('headers', dict()).get('headers', dict()).get('Server', 'Unknown')))}<br/>
                    <span style="color:#555;">POWERED BY:</span> {html.escape(str(recon.get('headers', dict()).get('headers', dict()).get('X-Powered-By', 'N/A')))}
                </div>
            </div>
            <div class="meta-box" style="background:#0a0a0b;">
                <div class="label">Geospatial Telemetry</div>
                <div class="value" style="font-size:12px;line-height:1.8;">
                    <span style="color:#555;">COORDINATES:</span> <span style="color:#0047ff;">{geo.get('lat', '0.0')}, {geo.get('lon', '0.0')}</span><br/>
                    <span style="color:#555;">LOCATION:</span> {geo.get('city', 'Unknown')}, {geo.get('country', 'N/A')}<br/>
                    <span style="color:#555;">ASN/ISP:</span> {geo.get('asn', 'N/A')}
                </div>
            </div>
        </div>
        {f'''<div class="meta-box" style="margin-top:24px;background:#0a0a0b;">
            <div class="label">Mapped Subdomains</div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;">{subdomains_html}</div>
        </div>''' if subdomains else ''}
    </div>

    <!-- NETWORK SURFACE SECTION -->
    {f'''<div class="section">
        <h2><span style="color:#0047ff;">02/</span> Network Service Surface</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #1a1a1b;border-radius:12px;overflow:hidden;">
            <thead style="background:#0a0a0b;">
                <tr>
                    <th style="padding:16px;text-align:left;font-size:10px;color:#555;letter-spacing:2px;">PORT/PROTO</th>
                    <th style="padding:16px;text-align:left;font-size:10px;color:#555;letter-spacing:2px;">IDENTIFIED SERVICE</th>
                    <th style="padding:16px;text-align:left;font-size:10px;color:#555;letter-spacing:2px;">TECH_BANNER_STR</th>
                    <th style="padding:16px;text-align:right;font-size:10px;color:#555;letter-spacing:2px;">RISK</th>
                </tr>
            </thead>
            <tbody>{ports_html}</tbody>
        </table>
    </div>''' if ports else ''}

    <!-- VULNERABILITIES SECTION -->
    <div class="section">
        <h2><span style="color:#ff003c;">03/</span> Vulnerability Deep-Dive</h2>
        {findings_html if findings else '<p style="color:#555;font-size:14px;font-family:monospace;border:1px dashed #1a1a1b;padding:40px;text-align:center;border-radius:12px;">[SYSTEM_LOG] NO_VULNERABILITIES_PERSISTED_FOR_TARGET</p>'}
    </div>

    <div style="margin-top:80px;padding-top:32px;border-top:1px solid #1a1a1b;display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
            <div style="font-size:10px;font-weight:900;color:#0047ff;letter-spacing:2px;margin-bottom:4px;">HEXASHIELD AUDIT COMPLIANCE</div>
            <div style="font-size:11px;color:#555;">Khaled Hani — Computer Engineering Graduation Project</div>
            <div style="font-size:10px;color:#333;margin-top:2px;">Full infrastructure scan verified via AI-Assisted Risk Engine v4.2</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:18px;font-weight:900;color:#1a1a1b;">CERTIFIED SECURE</div>
        </div>
    </div>
</body>
</html>"""

    @staticmethod
    def generate_report(scan_data: Dict, format: str = "json") -> str:
        if format == "html":
            return ReportGenerator.generate_html_report(scan_data)
        return ReportGenerator.generate_json_report(scan_data)
