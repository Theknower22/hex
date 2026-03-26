import sys
import os
sys.path.append(os.path.abspath('.'))
from services.report_generator import ReportGenerator

test_data = {
    "target": "<script>alert('xss')</script>",
    "scan_id": "123",
    "findings": [
        {
            "name": "<b>XSS Test</b>",
            "severity": "Critical",
            "description": "<img src=x onerror=alert(1)>",
            "remediation": "<svg onload=alert(2)>"
        }
    ]
}

html_report = ReportGenerator.generate_html_report(test_data)
if "<script>" not in html_report and "&lt;script&gt;" in html_report:
    print("SUCCESS: HTML escaping is working!")
else:
    print("FAILURE: HTML escaping is NOT working correctly.")
    if "<script>" in html_report:
        print("Found unescaped <script>")
    if "&lt;script&gt;" not in html_report:
        print("Did not find escaped &lt;script&gt;")
