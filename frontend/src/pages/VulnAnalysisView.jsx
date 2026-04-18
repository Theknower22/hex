/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, Info, ExternalLink, ChevronDown, Loader2, Bug, Zap, ShieldAlert, Cpu, Terminal, Activity, FlaskConical, Play, Target, Copy, Check, Search, MapPin, Share2 } from 'lucide-react';
import { vulnService, exploitService } from '../services/apiClient';
import { useSecurity } from '../context/SecurityContext';
import CyberCard from '../components/CyberCard';
import ExploitModal from '../components/ExploitModal';
import GlobalHeader from '../components/GlobalHeader';

import { useNavigate, useParams } from 'react-router-dom';

const VulnerabilityCard = ({ vuln, onExploit }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => setIsOpen(!isOpen);

  const severityStyles = {
    Critical: 'border-red-600/40 text-red-500 bg-red-900/10',
    High: 'border-orange-500/40 text-orange-500 bg-orange-500/10',
    Medium: 'border-blue-400/40 text-blue-400 bg-blue-500/5',
    Low: 'border-gray-500/40 text-gray-400 bg-gray-500/5'
  };

  const getSeverityBg = (sev) => {
     if (sev === 'Critical') return 'bg-red-600';
     if (sev === 'High') return 'bg-orange-500';
     if (sev === 'Medium') return 'bg-cyber-warning';
     return 'bg-cyber-blue';
  };

  const cvssScore = parseFloat(vuln.cvss) || 5.0;
  const progressPercent = (cvssScore / 10) * 100;

  return (
    <motion.div 
      layout
      className={`border border-white/5 rounded-3xl mb-4 overflow-hidden transition-all bg-[#050505]/60 backdrop-blur-xl ${isOpen ? 'border-cyber-blue/30 shadow-2xl ring-1 ring-cyber-blue/20' : 'hover:bg-white/[0.02]'}`}
    >
      {/* Collapsed Header */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer group"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-6">
          <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${severityStyles[vuln.severity || 'Medium']}`}>
            {(vuln.severity || 'Medium')}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-black tracking-tight text-white group-hover:text-cyber-blue transition-colors">
                {vuln.name}
              </h4>
              {vuln.exploit_available && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyber-alert/10 border border-cyber-alert/30 text-cyber-alert text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(255,50,50,0.2)]">
                  <Zap size={10} fill="currentColor" /> Exploit Available
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-700 font-bold uppercase tracking-widest mt-0.5">
              {vuln.cve_id || `INTEL-ID-${vuln.id || 'N/A'}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">CVSS V3.1</span>
              <div className="flex items-center gap-4">
                 <span className={`text-4xl font-black font-mono leading-none tracking-tighter ${cvssScore >= 9 ? 'text-red-500' : cvssScore >= 7 ? 'text-orange-500' : 'text-blue-500'}`}>
                   {cvssScore.toFixed(1)}
                 </span>
                 {/* Thermometer Bar */}
                 <div className="w-1.5 h-10 bg-gray-900 rounded-full overflow-hidden flex flex-col justify-end border border-white/5">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${progressPercent}%` }}
                      className={`w-full rounded-full ${getSeverityBg(vuln.severity)} shadow-lg`} 
                    />
                 </div>
              </div>
           </div>
           <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? 'bg-[#0071ff]/10 text-[#0071ff] rotate-180' : 'bg-white/5 text-gray-700'}`}>
              <ChevronDown size={20} />
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0071ff] animate-pulse" />
                    <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Description & Impact</h5>
                  </div>
                  <p className="text-[14px] text-gray-400 leading-relaxed font-medium">
                    {vuln.description || "Sophisticated vulnerability identified in the processing layer that could lead to unauthorized system orchestration or data exfiltration."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert size={16} className="text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Attack Vector</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {vuln.attack_vector || "Remote exploitation via malformed HTTP headers leading to memory corruption and potential shell access."}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:border-cyber-neon/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-cyber-neon" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Remediation</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {vuln.remediation || "Update service binary to v2.4.1+ and enforce strict egress filtering on the application layer."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-black/20 border border-white/5 rounded-3xl p-8 relative overflow-hidden group min-h-full flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-[#0071ff] tracking-[0.2em] mb-8 flex items-center gap-2">
                      Framework Intelligence
                    </h5>

                    <div className="space-y-6">
                      {[
                        { label: 'OWASP TOP 10', value: vuln.owasp_category || 'A03:2021-Injection', color: 'text-white' },
                        { label: 'MITRE TECHNIQUE', value: vuln.mitre_id || 'T1190', color: 'text-gray-400 font-mono' },
                        { label: 'ATTACK STAGE', value: vuln.attack_stage || 'INITIAL ACCESS', color: 'text-cyber-neon', highlighted: true }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                          <span className={`text-[11px] font-black uppercase leading-none tracking-tight ${item.color}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 flex gap-3">
                    <button 
                      onClick={() => onExploit({ finding_id: vuln.id, scan_id: vuln.scan_id, status: 'Simulating', output: [] })}
                      className="flex-1 bg-[#0071ff] hover:bg-blue-600 text-white py-5 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,113,255,0.4)] transition-all active:scale-[0.98]"
                    >
                      <Zap size={18} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Execute Exploit</span>
                    </button>
                    <button 
                      onClick={() => window.open(`http://127.0.0.1:8000/api/reports/download/${vuln.scan_id}?format=html`, '_blank')}
                      className="flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest"
                    >
                      <Download size={16} /> PDF Report
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

const VulnerabilityAnalysis = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const { id } = useParams();
  const { vulnResults: vulnerabilities, setVulnResults: setVulnerabilities } = useSecurity();
  const [loading, setLoading] = useState(!vulnerabilities);
  const [activeExploit, setActiveExploit] = useState(null);
  const [activeTab, setActiveTab ] = useState('analysis'); // 'analysis' or 'exploitation'
  const navigate = useNavigate();

  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await api.get(`/vuln/graph/${id}`);
        setGraphData(response.data);
      } catch (err) {
        console.error("Failed to fetch graph data", err);
      }
    };

    const fetchVulns = async () => {
      try {
        const res = await vulnService.getAllFindings();
        const data = res.data;
        if (data && data.length > 0) {
          setVulnerabilities(data);
        } else {
          setVulnerabilities([]); 
        }
      } catch (err) {
        console.error("Failed to fetch vulnerabilities", err);
        setVulnerabilities([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchGraphData();
    }
    fetchVulns();
  }, [id, setVulnerabilities]);

  // Filter for high-priority exploitable targets
  const exploitableFindings = (vulnerabilities || []).filter(v => v.cvss >= 7.0 || v.severity === 'Critical');

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 text-cyber-blue font-mono">
        <Loader2 className="animate-spin" size={64} strokeWidth={1} />
        <span className="animate-pulse uppercase tracking-[0.5em] text-[10px] font-black">Syncing Intelligence Feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Critical Incursion Chain - Graph Logic Enhancement */}
      {graphData?.critical_path?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-red-500/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Share2 size={120} className="text-red-500" />
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldAlert size={20} className="text-red-500 shadow-red-glow" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">Most Critical Attack Path Identified</h2>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest opacity-80">Graph-Theoric Incursion Chain</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            {graphData.critical_path.map((nodeId, idx) => {
              const node = graphData.nodes.find(n => n.id === nodeId);
              return (
                <React.Fragment key={nodeId}>
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 py-3 px-5 rounded-2xl backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: node?.color, boxShadow: `0 0 10px ${node?.color}` }} />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{node?.type}</span>
                      <span className="text-xs font-black font-mono">{node?.label}</span>
                    </div>
                  </div>
                  {idx < graphData.critical_path.length - 1 && (
                    <ChevronRight size={16} className="text-gray-700 animate-pulse" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            Vulnerability <span className="text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">Intelligence</span>
          </h2>
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.4em] font-black mt-2 leading-relaxed">
             Deep analysis and remediation orchestration for system flaws.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 self-start shrink-0">
          {[
            { id: 'analysis', label: 'Analysis Feed', icon: Activity },
            { id: 'exploitation', label: 'Attack Console', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id ? 'bg-[#0071ff] text-white shadow-[0_0_20px_rgba(0,113,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analysis' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Summary Boards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Critical', count: (vulnerabilities || []).filter(v => v.severity === 'Critical').length, color: 'text-red-500', borderColor: 'border-red-600/50' },
                { label: 'High Priority', count: (vulnerabilities || []).filter(v => v.severity === 'High').length, color: 'text-orange-500', borderColor: 'border-orange-500/50' },
                { label: 'Medium Risk', count: (vulnerabilities || []).filter(v => v.severity === 'Medium').length, color: 'text-blue-400', borderColor: 'border-blue-500/50' },
                { label: 'Total Findings', count: (vulnerabilities || []).length, color: 'text-blue-500', borderColor: 'border-blue-500/50' }
              ].map((stat, i) => (
                <CyberCard key={stat.label} className={`!p-0 border border-white/5 overflow-hidden group !bg-[#0A0A0A]`}>
                  <div className={`h-1 w-full absolute top-0 left-0 bg-current opacity-60 ${stat.color.replace('text-', 'bg-')}`} />
                  <div className="py-10 text-center bg-[#050505]/40 group-hover:bg-[#050505]/60 transition-all">
                    <div className={`text-5xl font-black font-mono tracking-tighter mb-1 ${stat.color}`}>
                      {stat.count < 10 ? `0${stat.count}` : stat.count}
                    </div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</div>
                  </div>
                </CyberCard>
              ))}
            </div>

            {vulnerabilities.length === 0 ? (
              <div className="h-[50vh] flex flex-col items-center justify-center gap-8 text-center p-8 bg-cyber-black/40 border border-dashed border-white/5 rounded-[3rem]">
                <Shield className="text-gray-800" size={100} strokeWidth={0.5} />
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-gray-400 uppercase italic">Empty Sector</h3>
                  <p className="text-xs text-gray-600 max-w-sm">No security telemetry detected. Run an automated discovery scan to populate this feed.</p>
                </div>
                <button onClick={() => navigate('/recon')} className="cyber-button px-10 py-5">
                  <Search size={18} />
                  <span className="font-black tracking-[0.2em]">INITIATE DISCOVERY</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <Activity size={14} className="text-cyber-neon" /> Intelligence Feed
                </h3>
                <div className="space-y-4">
                  {(vulnerabilities || []).map(v => (
                    <VulnerabilityCard 
                      key={v.id || v.name} 
                      vuln={v} 
                      onExploit={(result) => {
                        setActiveExploit({ ...result, scan_id: v.scan_id });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="exploitation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <CyberCard title="Attack Scope" icon={Target} className="border-cyber-blue/20">
                  <div className="flex flex-col gap-4">
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Active Targets</span>
                        <span className="font-mono text-sm text-cyber-blue">{[...new Set((vulnerabilities || []).map(v => v.target))].length}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Exploit Ready</span>
                        <span className="font-mono text-sm text-cyber-neon">{exploitableFindings.length}</span>
                     </div>
                  </div>
               </CyberCard>
               {/* Simulation Status Card */}
               <CyberCard title="Weaponization Lab" icon={Bug}>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyber-neon shadow-neon-glow animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Compiler Stable</span>
                     </div>
                     <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Metasploit handlers configured for reverse TCP shell templates. Ready for authorized simulation.</p>
                  </div>
               </CyberCard>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <Zap size={14} className="text-cyber-blue" /> Offensive Inventory
              </h3>
              {exploitableFindings.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[3rem]">
                   <p className="text-gray-500 font-bold uppercase tracking-widest">No Metasploit-ready targets found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {exploitableFindings.map((v, i) => (
                    <div key={i} className="bg-cyber-black/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-cyber-blue/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl border ${v.severity === 'Critical' ? 'border-red-500/30 bg-red-500/5 text-red-500' : 'border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue'}`}>
                             <Zap size={24} fill="currentColor" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{v.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] font-mono text-gray-500">{v.cve_id}</span>
                               <span className="text-[10px] font-mono text-cyber-blue uppercase font-black">Port {v.port}</span>
                            </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => setActiveExploit({ finding_id: v.id, scan_id: v.scan_id, status: 'Simulating', output: [] })}
                         className="cyber-button px-8 py-4"
                       >
                          <Play size={16} fill="currentColor" />
                          <span className="font-black tracking-[0.2em]">RUN EXPLOIT</span>
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <ExploitModal 
        isOpen={!!activeExploit} 
        onClose={() => setActiveExploit(null)} 
        exploitData={activeExploit} 
      />
    </div>
  );
};

export default VulnerabilityAnalysis;

