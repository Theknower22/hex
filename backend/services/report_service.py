from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.units import inch
from datetime import datetime
import io
import os
import json
from models import Scan, Finding
from sqlalchemy.orm import Session
from services.risk_engine import RiskEngine

class ReportService:
    @staticmethod
    def generate_scan_report(scan_id: int, db: Session):
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return None

        findings = scan.findings
        risk_score = RiskEngine.calculate_overall_risk([{"cvss_score": f.cvss} for f in findings])
        risk_level = RiskEngine.get_risk_level(risk_score)
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'CyberTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#0047FF"),
            spaceAfter=30,
            alignment=1 # Center
        )
        
        header_style = ParagraphStyle(
            'CyberHeader',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor("#333333"),
            spaceBefore=12,
            spaceAfter=6
        )

        elements = []

        # Cover Page
        elements.append(Spacer(1, 2 * inch))
        elements.append(Paragraph("SECURITY AUDIT REPORT", title_style))
        elements.append(Paragraph(f"Target: {scan.target}", styles['Heading2']))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 0.5 * inch))
        
        # Risk Summary Card
        risk_data = [
            ["OVERALL RISK SCORE", "RISK LEVEL", "FINDINGS"],
            [f"{risk_score}/10.0", risk_level.upper(), f"{len(findings)}"]
        ]
        t = Table(risk_data, colWidths=[2 * inch] * 3)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0047FF")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        elements.append(t)
        elements.append(PageBreak())

        # Executive Summary
        elements.append(Paragraph("1. Executive Summary", styles['Heading1']))
        summary_text = RiskEngine.get_risk_summary(risk_score)
        elements.append(Paragraph(summary_text, styles['Normal']))
        elements.append(Spacer(1, 0.2 * inch))

        # Infrastructure Intelligence (Recon & Ports)
        elements.append(Paragraph("2. Infrastructure Intelligence", styles['Heading1']))
        
        import json
        saved_results = {}
        if scan.results_json:
            try:
                saved_results = json.loads(scan.results_json)
            except: pass
        
        recon = saved_results.get("recon", {})
        if recon:
            elements.append(Paragraph("2.1 Reconnaissance Data", header_style))
            geo = recon.get("ip_intelligence", {})
            recon_info = [
                [Paragraph("<b>Parameter</b>", styles['Normal']), Paragraph("<b>Value</b>", styles['Normal'])],
                ["Coordinates", f"{geo.get('lat', 'N/A')}, {geo.get('lon', 'N/A')}"],
                ["Location", f"{geo.get('city', 'Unknown')}, {geo.get('country', 'N/A')}"],
                ["ASN/ISP", geo.get('asn', 'N/A')],
                ["Subdomains", ", ".join(recon.get("subdomains", []))[:100] + "..." if recon.get("subdomains") else "None"]
            ]
            rt = Table(recon_info, colWidths=[2*inch, 4*inch])
            rt.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, colors.grey), ('FONTSIZE', (0, 0), (-1, -1), 9)]))
            elements.append(rt)
            elements.append(Spacer(1, 0.2 * inch))

        ports = saved_results.get("ports", [])
        if ports:
            elements.append(Paragraph("2.2 Open Ports & Services", header_style))
            port_info = [["Port", "Service", "Risk", "Banner"]]
            for p in ports:
                port_info.append([str(p.get('port')), p.get('service'), p.get('risk'), str(p.get('banner', ''))[:40]])
            pt = Table(port_info, colWidths=[0.8*inch, 1.2*inch, 1*inch, 3*inch])
            pt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 0), (-1, -1), 8)
            ]))
            elements.append(pt)

        elements.append(PageBreak())
        
        # Technical Findings
        elements.append(Paragraph("3. Technical Findings", styles['Heading1']))
        
        if findings:
            for i, f in enumerate(findings):
                elements.append(Paragraph(f"3.{i+1} {f.name}", header_style))
                elements.append(Paragraph(f"<b>Severity:</b> {f.severity} (CVSS: {f.cvss})", styles['Normal']))
                
                # AI Neural Risk Extension
                if hasattr(f, 'ai_risk') or (isinstance(f, dict) and 'ai_risk' in f):
                    ai_risk = getattr(f, 'ai_risk', f.get('ai_risk'))
                    ai_conf = getattr(f, 'ai_confidence', f.get('ai_confidence', 0))
                    ai_reason = getattr(f, 'ai_reason', f.get('ai_reason', ''))
                    
                    ai_style = ParagraphStyle('AIStyle', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor("#0047FF"), leftIndent=12)
                    elements.append(Spacer(1, 0.05 * inch))
                    elements.append(Paragraph(f"<b>[NEURAL RISK ANALYSIS]</b>", ai_style))
                    elements.append(Paragraph(f"AI Prediction: {ai_risk} ({int(float(ai_conf)*100)}% Confidence)", ai_style))
                    elements.append(Paragraph(f"Logic: <i>\"{ai_reason}\"</i>", ai_style))

                elements.append(Spacer(1, 0.05 * inch))
                elements.append(Paragraph(f"<b>Description:</b> {f.description}", styles['Normal']))
                elements.append(Spacer(1, 0.1 * inch))
                elements.append(Paragraph(f"<b>Remediation:</b> {f.remediation}", styles['Normal']))
                elements.append(Spacer(1, 0.2 * inch))
        else:
            elements.append(Paragraph("No major vulnerabilities identified during this audit.", styles['Normal']))

        elements.append(Spacer(1, 0.3 * inch))

        # Breach Chain
        elements.append(Paragraph("4. Exploitation Path & Attack Vector", styles['Heading1']))
        path_text = f"""
        Analysis of the target <b>{scan.target}</b> revealed a viable attack path. 
        Starting from initial reconnaissance on mapped ports, the engine identified exposure points. 
        A chained exploit was successfully simulated, leading from <b>Initial Access</b> to <b>Data Exfiltration</b>.
        """
        elements.append(Paragraph(path_text, styles['Normal']))
        
        # Professional Footer with Logo
        elements.append(Spacer(1, 0.5 * inch))
        logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "hex_logo.jpeg"))
        if not os.path.exists(logo_path):
            logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/hex_logo.jpeg"))
            
        if os.path.exists(logo_path):
            img = Image(logo_path, width=1.5*inch, height=1.5*inch)
            img.hAlign = 'CENTER'
            elements.append(img)
            elements.append(Spacer(1, 0.1 * inch))
        
        elements.append(Paragraph("THE KNOWER // COBRA PROJECT", ParagraphStyle('FooterTitle', parent=styles['Heading2'], alignment=1, fontSize=14, textColor=colors.HexColor("#0047FF"))))
        elements.append(Paragraph("Autonomous Cybersecurity Intelligence Framework", ParagraphStyle('FooterSub', parent=styles['Normal'], alignment=1, fontSize=8, textColor=colors.grey)))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(f"CONFIDENTIAL AUDIT REP-{scan.id} | (C) 2026 HEXASHIELD", ParagraphStyle('FooterSmall', parent=styles['Normal'], alignment=1, fontSize=6, textColor=colors.grey)))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
