/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import ReconView from './pages/ReconView';
import VulnAnalysisView from './pages/VulnAnalysisView';
import ExploitationView from './pages/ExploitationView';
import AttackPathView from './pages/AttackPathView';
import AIAssistantView from './pages/AIAssistantView';
import ReportGeneratorView from './pages/ReportGeneratorView';
import ReportDetailView from './pages/ReportDetailView';
import ScanView from './pages/ScanView';
import AdminPanelView from './pages/AdminPanelView';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutFramework from './pages/AboutFramework';
import ScientificLabView from './pages/ScientificLabView';
import { NotificationProvider } from './components/NotificationSystem';
import AIAssistantOverlay from './components/AIAssistantOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import { SecurityProvider } from './context/SecurityContext';

const AppLayout = ({ children, title, subtitle }) => (
  <div className="flex h-screen bg-cyber-black overflow-hidden relative" style={{ backgroundColor: '#000000' }}>
    <div className="scanlines" />
    <Sidebar />
    <main className="flex-1 overflow-y-auto bg-grid-pattern bg-fixed relative p-8 z-10">
      {children}
      <AIAssistantOverlay />
    </main>
  </div>
);

function App() {
  const [isMonochrome, setIsMonochrome] = useState(false);

  const toggleMonochrome = () => setIsMonochrome(!isMonochrome);

  const wrapLayout = (Component, title, subtitle) => (
    <AppLayout 
      title={title}
      subtitle={subtitle}
    >
      <div className={isMonochrome ? 'monochrome-mode' : ''}>
        <Component 
          headerTitle={title}
          headerSubtitle={subtitle}
          isMonochrome={isMonochrome}
          onToggleMonochrome={toggleMonochrome}
        />
      </div>
    </AppLayout>
  );

  return (
    <Router>
      <NotificationProvider>
        <SecurityProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Default Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'security_analyst', 'analyst', 'student']} />}>
            <Route path="/dashboard" element={wrapLayout(Dashboard, "SOC Overview", "Real-time threat detection and infrastructure rank analysis.")} />
            <Route path="/vulnerabilities" element={wrapLayout(VulnAnalysisView, "Vulnerability Analysis", "Deep discovery and intelligent remediation orchestration.")} />
            <Route path="/attack-path" element={wrapLayout(AttackPathView, "Attack Path Analysis", "Topological visualization of exploit chains.")} />
            <Route path="/reports" element={wrapLayout(ReportGeneratorView, "Audit Inventory", "Professional penetration testing reports and historical logs.")} />
            <Route path="/reports/:id" element={wrapLayout(ReportDetailView, "Audit Intelligence", "Deep dive post-mortem of security audit event.")} />
            <Route path="/ai-assistant" element={wrapLayout(AIAssistantView, "AI Security Assistant", "Neural-powered remediation and advisory engine.")} />
            <Route path="/about" element={wrapLayout(AboutFramework, "Framework", "System architecture and security standard documentation.")} />
          </Route>

          {/* Elevated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'security_analyst', 'analyst']} />}>
            <Route path="/recon" element={wrapLayout(ReconView, "Passive Reconnaissance", "Network surface mapping: IP geo, DNS, SSL, subdomains, and WHOIS.")} />
            <Route path="/scan" element={wrapLayout(ScanView, "Infrastructure Scanning", "TCP/UDP discovery and active service fingerprinting.")} />
          </Route>

          {/* Admin Exclusive Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={wrapLayout(AdminPanelView, "Command Center", "User management and platform global controls.")} />
          </Route>
          
        </Routes>
        </SecurityProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;

