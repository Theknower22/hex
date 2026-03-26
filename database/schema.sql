-- Database Schema for AI-Assisted Penetration Testing Platform

-- Users and RBAC
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'security_analyst', -- admin, security_analyst, student
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Targets for scanning
CREATE TABLE targets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    address VARCHAR(255) NOT NULL, -- IP or Domain
    label VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scan sessions
CREATE TABLE scans (
    id SERIAL PRIMARY KEY,
    target_id INTEGER REFERENCES targets(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    scan_type VARCHAR(50), -- reconnaissance, full_scan, network_only
    risk_score FLOAT DEFAULT 0.0
);

-- Identified vulnerabilities
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20), -- Critical, High, Medium, Low, Info
    cvss_score FLOAT,
    owasp_category VARCHAR(100),
    mitre_technique VARCHAR(100),
    remediation TEXT
);

-- Vulnerability findings in scans
CREATE TABLE findings (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES scans(id),
    vulnerability_id INTEGER REFERENCES vulnerabilities(id),
    details TEXT, -- Specific finding details (e.g., port number, URL, etc.)
    evidence TEXT,
    state VARCHAR(20) DEFAULT 'open', -- open, resolved, false_positive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports generated
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES scans(id),
    generator_id INTEGER REFERENCES users(id),
    format VARCHAR(10), -- pdf, html, json
    file_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
