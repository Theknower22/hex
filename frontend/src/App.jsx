/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import ReconView from './pages/ReconView';
import VulnAnalysisView from './pages/VulnAnalysisView';
import AttackPathView from './pages/AttackPathView';
import AIAssistantView from './pages/AIAssistantView';
import ReportGeneratorView from './pages/ReportGeneratorView';
import ScanView from './pages/ScanView';
import AdminPanelView from './pages/AdminPanelView';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutFramework from './pages/AboutFramework';
import { NotificationProvider } from './components/NotificationSystem';
import AIAssistantOverlay from './components/AIAssistantOverlay';

const AppLayout = ({ children }) => (
  <div className="flex h-screen bg-cyber-black overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto bg-grid-pattern bg-fixed relative">
      {children}
      <AIAssistantOverlay />
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/recon" element={<AppLayout><ReconView /></AppLayout>} />
          <Route path="/scan" element={<AppLayout><ScanView /></AppLayout>} />
          <Route path="/vulnerabilities" element={<AppLayout><VulnAnalysisView /></AppLayout>} />
          <Route path="/attack-path" element={<AppLayout><AttackPathView /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><ReportGeneratorView /></AppLayout>} />
          <Route path="/ai-assistant" element={<AppLayout><AIAssistantView /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminPanelView /></AppLayout>} />
          <Route path="/about" element={<AppLayout><AboutFramework /></AppLayout>} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;

