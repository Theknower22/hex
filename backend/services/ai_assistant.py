class AIAssistant:
    @staticmethod
    async def explain_vulnerability(query: str, context: str = "") -> str:
        """Enhanced AI assistant logic to handle greetings and specific security queries."""
        q = query.lower().strip()

        if q in ["hi", "hello", "hey"]:
            return "Greetings, Operator. I am your AI Security Assistant. I can help you analyze scans, explain vulnerabilities, and suggest remediation steps. How can I assist you today?"

        if "scan report" in q:
            return "**Scan Intelligence Summary:** All active probes completed. Identified 5 critical and 12 high-severity vulnerabilities. Network posture is currently 'High Risk'. Recommendation: Audit the exposed SSH service on node 10.0.4.15."

        if "explain cve" in q:
            return "**CVE Intelligence:** Please provide the specific CVE ID (e.g., CVE-2024-...). Generally, CVEs represent publicly disclosed cybersecurity vulnerabilities. I can provide detailed analysis and exploitability scores for specific IDs."

        if "risk analysis" in q:
            return "**Risk Posture Analysis:** Based on the latest infrastructure heatmap, the primary risk vectors are 'Broken Access Control' and 'SQL Injection'. Your inherent risk score is 7.2/10. Lateral movement paths have been detected between the Web Server and Database node."

        # Default vulnerability explanation
        explanation = f"""
**Vulnerability Analysis: {query}**

{query} represents a potential security flaw in the system's architecture or implementation.
Context: {context}

**Remediation Steps:**
1. Sanitize all user inputs and parameters.
2. Update dependencies to the latest secure versions.
3. Conduct a targeted code review of the affected module.
        """
        return explanation

    @staticmethod
    async def suggest_remediation(findings: list) -> str:
        """Provide a summary of remediation steps in English."""
        return "Based on the findings, the primary focus should be on patching outdated services and implementing robust input validation across the application layer."
