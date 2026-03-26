# HEXASHIELD - API Documentation (v1.0.0)

The HexaShield platform provides a RESTful API for cybersecurity reconnaissance, scanning, and analysis.

## Authentication
All protected routes require a Bearer Token in the `Authorization` header.
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### Auth Endpoints
- `POST /token`: Obtain an access token.
- `POST /register`: Register a new account.

## Reconnaissance API
- `GET /recon/ip/{ip}`: Fetch IP intelligence (geographic and network data).
- `GET /recon/dns/{domain}`: Enumerate DNS records.

## Scanning API
- `POST /scan/start`: Start a new network scan.
- `GET /scan/status/{scan_id}`: Track scan progress and results.

## Vulnerability Intelligence
- `POST /vuln/analyze`: Trigger AI-assisted vulnerability analysis for a target.
- `GET /vuln/findings/{scan_id}`: Retrieve detailed vulnerability findings.

## AI Assistant
- `POST /ai/chat`: Send a message to the AI Security Assistant.
- `GET /ai/remediate/{finding_id}`: Get specific remediation steps for a finding.

## Admin API
- `GET /admin/stats`: Get global system statistics.
- `GET /admin/users`: List all registered users (Admin only).

## Interactive Docs
The backend provides interactive Swagger documentation at:
`http://localhost:8000/docs`
