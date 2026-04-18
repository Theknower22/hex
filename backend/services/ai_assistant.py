from sqlalchemy.orm import Session
from models import Scan, Finding
from services.risk_engine import RiskEngine

class AIAssistant:
    @staticmethod
    async def explain_vulnerability(query: str, context: str = "", db: Session = None) -> str:
        """Enhanced AI assistant using Google Gemini for professional security auditing."""
        import os
        import google.generativeai as genai
        
        q = query.lower().strip()
        api_key = os.getenv("GOOGLE_API_KEY")

        if q in ["hi", "hello", "hey"]:
            return "Greetings, Operator. I am the HexaShield AI Security Intelligence Interface. I am currently powered by the Gemini Engine to provide real-time vulnerability analysis and remediation strategy. How can I assist your audit today?"

        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash', 
                    system_instruction=(
                        "You are an advanced AI-powered cybersecurity vulnerability analysis engine. "
                        "Your task is to analyze scanned targets including: Hosts, Open ports, Services, Web endpoints, and APIs. "
                        "Perform deep vulnerability detection based on: OWASP Top 10, Known CVEs, Misconfigurations, Weak authentication, "
                        "Injection vulnerabilities (SQLi, XSS, Command Injection), Insecure headers, and Sensitive data exposure. "
                        "For each detected vulnerability, provide Name, CVE, CVSS, Severity, Description, Impact, Exploit Method, and Recommendation. "
                        "Assign CVSS scores and classify severity (Critical: 9.0-10, High: 7.0-8.9, Medium: 4.0-6.9, Low: 0.1-3.9). "
                        "Correlate vulnerabilities with asset importance and prioritize based on risk. Detect chained attacks. "
                        "Use a serious, technical, and professional tone. Always use Markdown for formatting."
                    ))
                
                full_prompt = f"Target Query: {query}\n\nTechnical Context (Scan Results/Architecture): {context}\n\nPlease provide a deep-dive analysis."
                response = model.generate_content(full_prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"[AI_ASSISTANT] Gemini API Failure: {e}")
                # Fallback to internal logic below

        # --- Internal Fallback Logic ---
        if "scan report" in q or "summary" in q or "risk analysis" in q:
            if not db:
                return "Database connection unavailable for analysis."
            
            # Fetch real data
            scan_count = db.query(Scan).count()
            recent_findings = db.query(Finding).order_by(Finding.id.desc()).limit(100).all()
            if not recent_findings:
                return "**Intelligence Summary:** No active scan records found. The network is currently unmapped. Proceed to the Network Scan module to initialize a probe."
                
            criticals = sum(1 for f in recent_findings if f.severity == 'Critical')
            highs = sum(1 for f in recent_findings if f.severity == 'High')
            
            # Use real risk calculations
            finding_dicts = []
            for f in recent_findings:
                finding_dicts.append({
                    "cvss_score": float(f.cvss) if f.cvss else 5.0,
                    "severity": f.severity
                })
            risk_score = RiskEngine.calculate_overall_risk(finding_dicts)
            
            return f"**Scan Intelligence Summary:** Analyzed {scan_count} probe(s). Identified {criticals} Critical and {highs} High-severity payload exposures. The Global Risk Posture is assessed at {risk_score}/10."

        if "explain" in q:
            # We check if the user is asking to explain a specific vulnerability
            target_vuln = q.replace("explain", "").replace("cve", "").strip()
            
            if not target_vuln:
                return "**Intelligence Query Error:** Please specify the vulnerability you want explained (e.g. 'Explain SQL Injection')."
                
            if db:
                # Search database for closest match
                found = db.query(Finding).filter(Finding.name.ilike(f"%{target_vuln}%")).first()
                if found:
                    return f"**Vulnerability Analysis: {found.name}**\n\n{found.description}\n\n*Attack Vector:* {getattr(found, 'scenario', 'Standard web protocol exploitation.')}"
                
                # Check predefined templates if not in DB
                from services.vuln_service import VulnService
                for template in VulnService.VULNERABILITY_TEMPLATES:
                    if target_vuln in template['name'].lower():
                        return f"**Vulnerability Analysis: {template['name']}**\n\n{template['description']}\n\n*Attack Vector:* {template.get('scenario', 'Requires application layer interaction.')}"
                        
            return f"**Vulnerability Analysis:** I could not locate direct intelligence records for '{target_vuln}'. It refers generally to unauthorized execution or exposure. Ensure your signature databases are synced."

        if "fix" in q or "remediate" in q or "suggest" in q:
            target_vuln = q.replace("how to fix", "").replace("fix", "").replace("remediate", "").replace("suggest", "").replace("remediation", "").strip()
            if not target_vuln:
                return "**Remediation Engine:** Please specify the vulnerability to receive patching instructions."
            
            if db:
                found = db.query(Finding).filter(Finding.name.ilike(f"%{target_vuln}%")).first()
                if found:
                    return f"**Remediation Protocol: {found.name}**\n\n{found.remediation}"
                
                # Check templates
                from services.vuln_service import VulnService
                for template in VulnService.VULNERABILITY_TEMPLATES:
                    if target_vuln in template['name'].lower():
                        return f"**Remediation Protocol: {template['name']}**\n\n{template['remediation']}"

            return "Apply strict input validation, ensure least privilege architectures, and enforce regular component updates."

        # Default fallback
        explanation = f"""
**Synthesizing Query:**

Command acknowledged: '{query}'. Context loaded: {context}.
If you require explicit analysis, attempt: 'Scan Report', 'Explain XSS', or 'Fix SQL Injection'.
        """
        return explanation

    @staticmethod
    async def suggest_remediation(findings: list, db: Session = None) -> str:
        """Provide a summary of remediation steps in English."""
        return "Based on the findings, the primary focus should be on patching outdated services and implementing robust input validation across the application layer."
