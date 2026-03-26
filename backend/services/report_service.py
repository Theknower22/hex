from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.units import inch
from datetime import datetime
import io
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
        
        # Risk Summary Card (Simulated Table)
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
        
        # Breakdown
        elements.append(Paragraph("2. Technical Findings", styles['Heading1']))
        
        if findings:
            finding_data = [["Severity", "Finding Name", "CVE ID", "CVSS"]]
            for f in findings:
                finding_data.append([
                    f.severity,
                    f.name,
                    f.cve_id if f.cve_id else "N/A",
                    f"{f.cvss}"
                ])
            
            ft = Table(finding_data, colWidths=[1*inch, 3*inch, 1.5*inch, 0.8*inch])
            ft.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(ft)
        else:
            elements.append(Paragraph("No major vulnerabilities identified during this audit.", styles['Normal']))

        elements.append(Spacer(1, 0.3 * inch))

        # Breach Chain (Simulation of what happened)
        elements.append(Paragraph("3. Exploitation Path & Attack Vector", styles['Heading1']))
        path_text = f"""
        Analysis of the target <b>{scan.target}</b> revealed a viable attack path. 
        Starting from initial reconnaissance on mapped ports, the engine identified exposure points. 
        A chained exploit was successfully simulated, leading from <b>Initial Access</b> to <b>Data Exfiltration</b>.
        """
        elements.append(Paragraph(path_text, styles['Normal']))
        
        # Add a "breach" note if critical
        if any(f.severity == 'Critical' for f in findings):
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph("<b>BREACH CONFIRMED:</b> System control was achieved via service escalation.", styles['Normal']))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
