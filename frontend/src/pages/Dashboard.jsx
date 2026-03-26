/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService, scanService, vulnService } from '../services/apiClient';
import { Activity, ShieldCheck, AlertCircle, Terminal, Plus, Search, Filter, Download, Zap, Loader2 } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import RiskScoreGauge from '../components/RiskScoreGauge';
import AttackPathVisualizer from '../components/AttackPathVisualizer';
import VulnerabilityHeatmap from '../components/VulnerabilityHeatmap';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatMiniCard = ({ title, value, icon: Icon, color }) => (
  <CyberCard className="flex-1">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-cyber-black border border-cyber-border ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</div>
        <div className="text-xl font-bold font-mono tracking-tighter">{value}</div>
      </div>
    </div>
  </CyberCard>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_scans: 0,
    active_targets: 0,
    critical_findings: 0,
    risk_score: 0
  });

  const [recentFindings, setRecentFindings] = useState([]);
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, findingsRes] = await Promise.all([
        adminService.getStats(),
        vulnService.getRecentFindings(10)
      ]);
      setStats(statsRes.data);
      setRecentFindings(findingsRes.data || []);
    } catch (err) {
      console.error("Failed to sync intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!target) return;

    setIsScanning(true);
    try {
      await scanService.startScan(target, "full");
      // Scan is synchronous on backend, fetch immediately then again after 1s to ensure DB commit
      await fetchData();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
      setTarget('');
    } catch (err) {
      console.error("Scan initialization failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const doughnutData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats.critical_findings || 0, 
          recentFindings.filter(f => f.severity === 'High').length,
          recentFindings.filter(f => f.severity === 'Medium').length,
          recentFindings.filter(f => f.severity === 'Low').length
        ],
        backgroundColor: ['#ff003c', '#ff8c00', '#ffcc00', '#0047ff'],
        borderWidth: 0,
        hoverOffset: 10
      },
    ],
  };

  const chartOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyber-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight text-white mb-1"
          >
            Security <span className="text-cyber-neon">Intelligence</span>
          </motion.h2>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Real-time infrastructure threat analysis and vulnerability tracking.</p>
        </div>
        
        {/* Quick Scan Input */}
        <form onSubmit={handleStartScan} className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter Target IP or Domain..."
              className="cyber-input w-full pl-10 pr-4 py-2.5"
              disabled={isScanning}
            />
          </div>
          <button 
            type="submit" 
            disabled={isScanning || !target}
            className="cyber-button px-6 whitespace-nowrap disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {isScanning ? 'SCANNING...' : 'INITIATE PENTEST'}
          </button>
        </form>
      </header>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMiniCard title="System Targets" value={stats.active_targets} icon={Terminal} color="text-cyber-blue" />
        <StatMiniCard title="Total Audits" value={stats.total_scans} icon={Activity} color="text-cyber-neon" />
        <StatMiniCard title="Critical Nodes" value={stats.critical_findings} icon={AlertCircle} color="text-cyber-alert" />
        <StatMiniCard title="Risk Level" value={stats.risk_score > 7 ? "HIGH" : stats.risk_score > 4 ? "MED" : "LOW"} icon={ShieldCheck} color={stats.risk_score > 7 ? "text-cyber-alert" : "text-cyber-warning"} />
      </div>

      {/* Core Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <CyberCard title="Inherent Risk Score" className="lg:col-span-3 flex flex-col items-center justify-center">
          <RiskScoreGauge score={stats.risk_score} />
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
              Risk based on <span className="text-white">Live Findings</span> and historical exploitability.
            </p>
          </div>
        </CyberCard>

        <CyberCard title="Visualized Attack Vectors" className="lg:col-span-6">
          <AttackPathVisualizer />
        </CyberCard>

        <CyberCard title="Severity Breakdown" className="lg:col-span-3">
          <div className="relative h-[200px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold font-mono">{recentFindings.length}</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Global Findings</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { label: 'Critical', color: 'bg-cyber-alert', value: stats.critical_findings },
              { label: 'High', color: 'bg-orange-500', value: recentFindings.filter(f => f.severity === 'High').length },
              { label: 'Medium', color: 'bg-cyber-warning', value: recentFindings.filter(f => f.severity === 'Medium').length },
              { label: 'Low', color: 'bg-cyber-blue', value: recentFindings.filter(f => f.severity === 'Low').length }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-gray-400">{item.label}</span>
                </div>
                <span>{item.value || 0}</span>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <CyberCard title="Infrastructure Heatmap" className="lg:col-span-4">
          <VulnerabilityHeatmap />
          <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Low Risk</span>
            <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-cyber-black via-cyber-blue to-cyber-neon rounded-full" />
            <span>High Risk</span>
          </div>
        </CyberCard>

        <CyberCard title="Live Security Feed" className="lg:col-span-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                  <th className="pb-4">Target Node</th>
                  <th className="pb-4">Intelligence / Alert</th>
                  <th className="pb-4">Severity</th>
                  <th className="pb-4 text-right">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentFindings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <Search size={32} className="text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-bold">No Intelligence Data</p>
                      <p className="text-[10px] text-gray-700 mt-1">Run a scan from the header or the Network Scan page to populate this feed.</p>
                    </td>
                  </tr>
                ) : (
                  recentFindings.map((finding, idx) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-mono text-xs text-cyber-blue">{finding.target}</td>
                      <td className="py-4 text-sm font-semibold">{finding.name}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                          finding.severity === 'Critical' ? 'border-cyber-alert text-cyber-alert bg-cyber-alert/10' :
                          finding.severity === 'High' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                          'border-cyber-warning text-cyber-warning bg-cyber-warning/10'
                        }`}>
                          {finding.severity}
                        </span>
                      </td>
                      <td className="py-4 text-right text-[10px] font-mono text-gray-500">
                        {new Date(finding.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default Dashboard;

