/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, Info, ExternalLink, ChevronDown, ChevronUp, Loader2, Bug, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { vulnService, exploitService } from '../services/apiClient';
import CyberCard from '../components/CyberCard';
import ExploitModal from '../components/ExploitModal';

const VulnerabilityCard = ({ vuln, onExploit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExploiting, setIsExploiting] = useState(false);

  const severityStyles = {
    Critical: 'border-cyber-alert text-cyber-alert bg-cyber-alert/5 shadow-[0_0_10px_rgba(255,0,60,0.2)]',
    High: 'border-orange-500 text-orange-500 bg-orange-500/5',
    Medium: 'border-cyber-warning text-cyber-warning bg-cyber-warning/5',
    Low: 'border-cyber-blue text-cyber-blue bg-cyber-blue/5',
  };

  const handleExploit = async (e) => {
    e.stopPropagation();
    setIsExploiting(true);
    try {
      const res = await exploitService.triggerExploit(vuln.id);
      onExploit(res.data);
    } catch (err) {
      console.error("Exploit failed", err);
    } finally {
      setIsExploiting(false);
    }
  };

  return (
    <motion.div 
      layout
      className={`border border-white/5 rounded-2xl mb-4 overflow-hidden transition-all bg-cyber-black/40 backdrop-blur-sm ${isOpen ? 'border-cyber-blue/30 shadow-blue-glow' : 'hover:bg-white/[0.02]'}`}
    >
      <div 
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-5">
          <div className={`px-3 py-1 rounded-lg text-[10px] font-black border ${severityStyles[vuln.severity] || severityStyles.Medium}`}>
            {(vuln.severity || 'Medium').toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold tracking-tight text-white/90 flex items-center gap-2">
              {vuln.name}
              {vuln.cve_id && vuln.cve_id !== 'N/A' && (
                <span className="px-2 py-0.5 bg-cyber-alert/10 border border-cyber-alert/30 text-cyber-alert text-[8px] font-black rounded-full shadow-[0_0_10px_rgba(255,0,60,0.1)]">
                  {vuln.cve_id}
                </span>
              )}
            </h4>
            <span className="text-[10px] text-gray-600 font-mono tracking-widest mt-0.5">{vuln.id || `VULN-XP-${vuln.id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">CVSS v3.1</span>
              <span className={`font-black font-mono text-lg leading-none ${parseFloat(vuln.cvss) >= 9 ? 'text-cyber-alert' : parseFloat(vuln.cvss) >= 7 ? 'text-orange-500' : 'text-cyber-blue'}`}>
                {vuln.cvss || '7.5'}
              </span>
            </div>
            {/* Minimal Impact Bar */}
            <div className="w-1.5 h-10 bg-white/5 rounded-full overflow-hidden flex flex-col justify-end">
               <div 
                 className={`w-full ${parseFloat(vuln.cvss) >= 9 ? 'bg-cyber-alert shadow-alert-glow' : parseFloat(vuln.cvss) >= 7 ? 'bg-orange-500 shadow-[0_0_10px_orange]' : 'bg-cyber-blue shadow-blue-glow'}`}
                 style={{ height: `${(vuln.cvss || 7.5) * 10}%` }}
               />
            </div>
          </div>
          <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-cyber-blue/20 text-cyber-blue' : 'text-gray-600'}`}>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-white/5 mx-5 mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 flex items-center gap-2">
                       <Info size={12} className="text-cyber-blue" /> Description & Impact
                    </h5>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                      {vuln.description || "Sophisticated vulnerability identified in the processing layer that could lead to unauthorized system orchestration or data exfiltration."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-cyber-black/60 border border-white/5 rounded-xl">
                      <h5 className="text-[10px] font-bold uppercase text-cyber-alert tracking-widest mb-3 flex items-center gap-2">
                        <ShieldAlert size={14} /> Attack Vector
                      </h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{vuln.scenario || "Remote exploitation via malformed HTTP headers leading to memory corruption."}</p>
                    </div>
                    <div className="p-4 bg-cyber-black/60 border border-white/5 rounded-xl">
                      <h5 className="text-[10px] font-bold uppercase text-cyber-neon tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle size={14} /> Remediation
                      </h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{vuln.remediation || "Update service binary to v2.4.1+ and enforce strict egress filtering."}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="p-5 bg-cyber-deep-blue/10 border border-cyber-blue/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                       <Cpu size={64} className="text-cyber-blue" />
                    </div>
                    <h5 className="text-[10px] font-bold uppercase text-cyber-blue tracking-widest mb-4">Framework Intelligence</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-cyber-black/40 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">OWASP Top 10</span>
                        <span className="text-xs font-mono font-bold text-white">{vuln.owasp_category || vuln.owasp || 'A04:2021'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-cyber-black/40 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">MITRE Tactic</span>
                        <span className="text-xs font-mono font-bold text-white">{vuln.mitre_id || vuln.mitre || 'T1190'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleExploit}
                      disabled={isExploiting}
                      className="flex-1 py-3 bg-cyber-blue text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-blue-glow hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isExploiting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                      {isExploiting ? 'EXPLOITING...' : 'EXECUTE EXPLOIT'}
                    </button>
                    <button className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center">
                      <ExternalLink size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const VulnerabilityAnalysis = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExploit, setActiveExploit] = useState(null);

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        const res = await vulnService.getAllFindings();
        const data = res.data;
        if (data && data.length > 0) {
          setVulnerabilities(data);
        } else {
          setVulnerabilities([]); // Show empty state if no scans done
        }
      } catch (err) {
        console.error("Failed to fetch vulnerabilities", err);
        setVulnerabilities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVulns();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-cyber-blue" size={64} strokeWidth={1} />
          <Bug className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyber-blue/30" size={24} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-cyber-blue uppercase tracking-[0.4em] animate-pulse">Syncing Intelligence</p>
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-cyber-blue" />
          </div>
        </div>
      </div>
    );
  }

  if (vulnerabilities.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 text-center p-8">
        <Shield className="text-gray-700" size={80} strokeWidth={1} />
        <div>
          <h3 className="text-2xl font-bold text-gray-400">No Vulnerabilities Found</h3>
          <p className="text-gray-600 mt-2 max-w-md">No scan data available yet. Go to <strong className="text-cyber-blue">Network Scan</strong> or the <strong className="text-cyber-neon">Dashboard</strong> to run your first security audit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight text-white mb-1"
          >
            Vulnerability <span className="text-cyber-alert">Intelligence</span>
          </motion.h2>
          <p className="text-gray-500 text-sm font-medium">Deep analysis and remediation orchestration for system flaws.</p>
        </div>
      </header>

      {/* Summary Boards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Critical', count: vulnerabilities.filter(v => v.severity === 'Critical').length, color: 'text-cyber-alert' },
          { label: 'High Priority', count: vulnerabilities.filter(v => v.severity === 'High').length, color: 'text-orange-500' },
          { label: 'Medium Risk', count: vulnerabilities.filter(v => v.severity === 'Medium').length, color: 'text-cyber-warning' },
          { label: 'Total Findings', count: vulnerabilities.length, color: 'text-cyber-blue' }
        ].map((stat, i) => (
          <CyberCard key={stat.label} className="!p-0 text-center relative overflow-hidden group">
            <div className="py-8 relative z-10">
              <div className={`text-4xl font-black font-mono tracking-tighter mb-1 ${stat.color}`}>
                {stat.count < 10 ? `0${stat.count}` : stat.count}
              </div>
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">{stat.label}</div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-30 ${stat.color.replace('text', 'bg')}`} />
          </CyberCard>
        ))}
      </div>

      {/* Main List */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
          <Zap size={14} className="text-cyber-neon" /> Intelligence Feed
        </h3>
        <AnimatePresence mode="popLayout">
          {vulnerabilities.map(v => (
            <VulnerabilityCard 
              key={v.id || v.name} 
              vuln={v} 
              onExploit={(result) => setActiveExploit(result)}
            />
          ))}
        </AnimatePresence>
      </div>

      <ExploitModal 
        isOpen={!!activeExploit} 
        onClose={() => setActiveExploit(null)} 
        exploitData={activeExploit} 
      />

      {/* AI Advisory */}
      <CyberCard className="bg-cyber-deep-blue/10 border-cyber-blue/20">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-cyber-black rounded-2xl border border-cyber-blue/30 shadow-blue-glow">
            <Cpu className="text-cyber-blue" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-tight mb-2">Neural Link Advisory</h4>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Intelligence analysis suggests a systemic failure in input sanitization across the <span className="text-cyber-blue">Auth Service</span> module. 
              The prevalence of <span className="text-cyber-alert">SQL Injection</span> indicators points toward a lack of parameterized queries. 
              Immediate migration to the <span className="text-white">v3 Internal Security Middleware</span> is recommended.
            </p>
            <div className="mt-4 flex gap-4">
              <span className="text-[10px] font-bold text-cyber-neon flex items-center gap-1.5 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse" /> Confidence: 94%
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Remediation ETA: 2h 15m</span>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};

export default VulnerabilityAnalysis;

