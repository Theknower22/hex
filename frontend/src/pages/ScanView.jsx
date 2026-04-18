/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Search, Shield, Zap, Play, Terminal, Cloud, Activity, Loader2, Cpu, Globe, AlertCircle, ChevronRight, ShieldCheck, Lock, Server, ExternalLink } from 'lucide-react';
import { scanService } from '../services/apiClient';
import { useSecurity } from '../context/SecurityContext';
import { useNotification } from '../components/NotificationSystem';
import CyberCard from '../components/CyberCard';
import GlobalHeader from '../components/GlobalHeader';

const ExpandablePortRow = ({ port: p, isPortsOnly }) => {
  const [isDeepDive, setIsDeepDive] = useState(false);

  const getAdvisory = (port, service) => {
    const s = service.toLowerCase();
    if (s.includes('http')) return "Ensure TLS 1.3 is enforced and use HSTS headers. Audit for XSS and SQLi on all endpoints.";
    if (s.includes('ssh')) return "Disable root login and migrate to key-based authentication only. Fail2Ban recommended.";
    if (s.includes('smb') || port === 445) return "CRITICAL: Disable SMBv1 immediately. Enforce packet signing and restrict to internal VLANs.";
    if (s.includes('ftp') || port === 21) return "Insecure Protocol: Migrate to SFTP or FTPS. Anonymous login must be disabled.";
    if (s.includes('sql')) return "Restrict access to application tier only. Enforce complex authentication and audit query logs.";
    return "Standard service identified. Follow principle of least privilege and monitor for anomalous traffic patterns.";
  };

  if (isPortsOnly) {
    return (
      <tr className="hover:bg-white/[0.02] transition-colors">
        <td className="py-4 pl-6 font-mono text-xs text-cyber-blue">
          {p.port}/TCP
        </td>
        <td className="py-4 font-bold text-sm tracking-tight text-cyber-neon uppercase">
          {p.state || 'OPEN'}
        </td>
      </tr>
    );
  }

  return (
    <React.Fragment>
      <tr 
        onClick={() => setIsDeepDive(!isDeepDive)}
        className={`group cursor-pointer transition-all duration-300 ${isDeepDive ? 'bg-cyber-blue/10' : 'hover:bg-white/[0.02]'}`}
      >
        <td className="py-4 pl-6 font-mono text-xs text-cyber-blue">
          {p.port}/TCP
        </td>
        <td className="py-4 font-bold text-sm tracking-tight">
          {p.service.toUpperCase()}
        </td>
        <td className="py-4 text-[11px] text-gray-500 font-mono tracking-tighter">
          {p.version || 'N/A'}
        </td>
        <td className="py-4 pr-6 text-right">
          <div className="flex items-center justify-end gap-3">
            {p.source && p.source.includes('SHODAN') && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[8px] font-black uppercase tracking-widest">
                <Cloud size={10} /> Global Intel
              </div>
            )}
            <span className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all ${
              p.risk === 'Critical' ? 'border-red-600 text-red-600 bg-red-900/10 shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 
              p.risk === 'High' ? 'border-cyber-alert text-cyber-alert bg-cyber-alert/5' : 
              p.risk === 'Medium' ? 'border-cyber-warning text-cyber-warning bg-cyber-warning/5' : 
              'border-cyber-blue/40 text-cyber-blue/80 bg-cyber-blue/5'
            }`}>
              {p.risk}
            </span>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isDeepDive && (
          <tr>
            <td colSpan="5" className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-cyber-black/40 border-l-2 border-cyber-blue/30 mx-4 mb-4 rounded-br-2xl"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Service Identity Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Cpu size={14} className="text-cyber-blue" />
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Service Intelligence</h5>
                    </div>
                    <div className="bg-cyber-black/60 border border-white/5 rounded-xl p-4 space-y-3">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Raw Banner Metadata</span>
                          <code className="text-[10px] text-cyber-neon font-mono truncate">{p.version || 'Version probe incomplete'}</code>
                       </div>
                       <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-gray-500">Service Reliability</span>
                          <span className="text-[9px] font-black text-cyber-blue uppercase tracking-widest">Verified (sV)</span>
                       </div>
                    </div>
                  </div>

                  {/* Analyst Perspective Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck size={14} className="text-cyber-neon" />
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Analyst Briefing</h5>
                    </div>
                    <div className="bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl p-4">
                       <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          {getAdvisory(p.port, p.service)}
                       </p>
                       <div className="mt-4 flex items-center gap-3">
                          <span className="text-[8px] font-black text-cyber-blue uppercase tracking-widest flex items-center gap-1">
                             <Lock size={10} /> Compliance: Level 3
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

const ScanView = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const showNotification = useNotification();
  const { 
    scanResults, setScanResults, 
    scanLogs, setScanLogs, 
    scanProgress, setScanProgress, 
    livePorts: ctxLivePorts, setLivePorts: setCtxLivePorts,
    activeTarget, setActiveTarget 
  } = useSecurity();

  const [target, setTarget] = useState(activeTarget || '');
  const [intensity, setIntensity] = useState('pulse');
  const [isScanning, setIsScanning] = useState(false);

  // No persistence for inputs as per user request
  useEffect(() => {
    // Keeping this empty or removing the sessionStorage sync entirely
  }, [target, intensity]);

  const addLog = (line, color = 'text-gray-400') => {
    setScanLogs(prev => [...prev, { line, color }]);
  };

  const startScan = async () => {
    if (!target) {
      showNotification("Please enter a target address", "warning");
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
    setCtxLivePorts([]);
    setScanResults(null);
    setScanLogs([]);

    addLog(`[INIT] HEXA-SCAN QUANTUM INTELLIGENCE ENGINE V6.0 STARTING...`, 'text-cyber-blue');
    addLog(`[INFO] TARGET: ${target}`, 'text-gray-400');

    try {
      // 1. Kickoff the scan
      const startRes = await scanService.startScan(target, intensity);
      const scanId = startRes.data.id;
      
      if (!scanId) throw new Error("Faulty Engine Initialization.");

      addLog(`[EXEC] PIPELINE ${scanId} REGISTERED. MONITORING TELEMETRY...`, 'text-cyber-neon');

      // 2. Begin Reactive Polling (Turbo Interval)
      let completed = false;
      let lastPhase = '';
      let pollCount = 0;

      while (!completed && pollCount < 400) { // Max 4 mins polling with 500ms interval
        pollCount++;
        await new Promise(r => setTimeout(r, 500)); // Optimized to 500ms for Real-Time feel
        
        const statusRes = await scanService.getStatus(scanId);
        const scanData = statusRes.data;
        
        // Safety check for results_json
        let results = {};
        try {
          results = scanData.results_json ? (typeof scanData.results_json === 'string' ? JSON.parse(scanData.results_json) : scanData.results_json) : {};
        } catch (e) { console.error("Parse Error", e); }

        // Update Progress based on Phase
        const phase = results.phase || 'Initializing';
        if (phase !== lastPhase) {
          lastPhase = phase;
          const color = phase.includes('Complete') ? 'text-cyber-neon' : 'text-yellow-400';
          addLog(`[ENGINE] PHASE SHIFT: ${phase.toUpperCase()}`, color);
        }

        // Dynamic Progress Smoothing
        let targetProgress = 10;
        if (phase.includes('DNS')) targetProgress = 25;
        else if (phase.includes('Discovery')) targetProgress = 50;
        else if (phase.includes('Aggregation')) targetProgress = 75;
        else if (phase.includes('Mapping')) targetProgress = 90;
        else if (phase.includes('Complete')) targetProgress = 100;
        
        setScanProgress(prev => {
           if (prev < targetProgress) return Math.min(targetProgress, prev + 5); // Faster increment
           return prev;
        });

        // Stream live ports immediately as they appear in results
        if (results.ports && results.ports.length > 0) {
          setCtxLivePorts(results.ports);
        }

        if (scanData.status === 'completed') {
          completed = true;
          setScanProgress(100);
          setScanResults(scanData);
          setCtxLivePorts(results.ports || []);
          
          addLog(`[DONE] FULL AUDIT SPECTRUM COMPLETE.`, 'text-cyber-neon');
          const vuln_count = scanData.findings_count || (results.findings?.length) || 0;
          addLog(`[INTEL] ${vuln_count} CRITICAL VULNERABILITY FINDINGS MAPPED.`, 'text-cyber-blue');
          
          showNotification(`Intelligence Audit Complete.`, "success");
        } else if (scanData.status === 'failed') {
          throw new Error("Engine Aborted. Discovery logic failure.");
        }
      }

    } catch (err) {
      setScanProgress(0);
      addLog(`[ERROR] ENGINE CRITICAL FAILURE: ${err.message}`, 'text-cyber-alert');
      showNotification("Cyber-Sensor Connectivity Error.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      <GlobalHeader 
        title={headerTitle} 
        subtitle={headerSubtitle} 
        isMonochrome={isMonochrome} 
        onToggleMonochrome={onToggleMonochrome} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-4 space-y-6">
          <CyberCard title="Scan Configuration" icon={Cpu}>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Target Infrastructure</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-blue group-focus-within:text-cyber-neon transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="HOST, IP, OR SUBNET..."
                    className="w-full bg-cyber-black/50 border border-cyber-border rounded-xl py-4 pl-12 pr-4 focus:border-cyber-blue outline-none transition-all font-mono text-xs tracking-widest placeholder:text-gray-700"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isScanning && startScan()}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Engine Profile</label>
                <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'pulse', name: 'Policy Discovery', desc: 'Standard Policy audit & Discovery', icon: Shield, color: 'text-cyber-blue' },
                      { id: 'deep', name: 'Technical', desc: 'Technical Deep Audit + Service Intel', icon: Zap, color: 'text-cyber-neon' },
                      { id: 'ports_only', name: 'Port Only', desc: 'Rapid Recon - Only port discovery', icon: Terminal, color: 'text-cyber-neon' },
                    ].map(profile => (
                      <button 
                        key={profile.id}
                        onClick={() => setIntensity(profile.id)}
                        className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-4 group
                          ${intensity === profile.id ? 'bg-cyber-deep-blue/20 border-cyber-blue/50 shadow-blue-glow' : 'bg-cyber-black/40 border-white/5 hover:border-white/10'}`}
                      >
                        <div className={`p-2 rounded-lg bg-cyber-black border border-white/5 ${intensity === profile.id ? (profile.id === 'ultra' ? 'text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : profile.color) : 'text-gray-700'}`}>
                          <profile.icon size={20} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold tracking-tight ${intensity === profile.id ? 'text-white' : 'text-gray-500'}`}>{profile.name}</div>
                          <div className="text-[10px] text-gray-600 font-medium">{profile.desc}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <button 
                disabled={isScanning}
                onClick={startScan}
                className="cyber-button w-full py-5 active:scale-[0.98]"
              >
                {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                <span className="font-black tracking-[0.2em]">{isScanning ? 'SCANNING' : 'START SENSOR'}</span>
              </button>
            </div>
          </CyberCard>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <CyberCard title="Telemetry Feed" icon={Activity}>
            <div className="space-y-6 min-h-[500px] flex flex-col">
              {/* Target Infrastructure Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyber-black/40 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">
                    <Globe size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target IP Address</div>
                    <div className="text-sm font-bold text-white font-mono">{scanResults?.results_json ? (typeof scanResults.results_json === 'string' ? JSON.parse(scanResults.results_json).ip : scanResults.results_json.ip) || 'Resolving...' : 'Standby'}</div>
                  </div>
                </div>
                <div className="bg-cyber-black/40 border border-white/5 rounded-xl p-4 flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-lg bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon shrink-0">
                    <Network size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Open Ports Count</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-white font-mono shrink-0">{ctxLivePorts?.length || 0} PORTS DISCOVERED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isScanning ? 'Engine Active' : 'Sensor Ready'}</span>
                  <span className="text-xl font-mono font-bold text-cyber-neon tracking-tighter">{scanProgress}%</span>
                </div>
                <div className="w-full bg-cyber-black h-1.5 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    className="h-full bg-cyber-neon shadow-neon-glow" 
                   />
                </div>
              </div>

              {/* Console Output */}
              <div className="flex-1 bg-cyber-black/80 rounded-xl p-5 font-mono text-[11px] text-gray-400 overflow-y-auto h-64 border border-white/5 relative">
                 <div className="absolute top-4 right-4 text-[8px] font-black text-cyber-blue/30 uppercase tracking-widest">Live Log</div>
                 <div className="space-y-1">
                    {scanLogs.length === 0 && (
                      <p className="text-cyber-blue">[READY] HEXA-SCAN TCP ENGINE V4.1 STANDBY...</p>
                    )}
                    {scanLogs.map((log, i) => (
                      <p key={i} className={log.color}>{log.line}</p>
                    ))}
                    {isScanning && <div className="animate-pulse text-cyber-blue mt-2 font-black">_</div>}
                 </div>
              </div>

              {/* Web Intelligence Section */}
              <AnimatePresence>
                {scanProgress === 100 && scanResults && scanResults.web_analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-2xl bg-cyber-blue/5 border border-cyber-blue/20"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="text-cyber-blue" size={20} />
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Web Intelligence Audit</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Tech Stack */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Cpu size={12} /> Tech Stack
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-400">Server:</span>
                              <span className="text-white font-mono">{scanResults.web_analysis.server}</span>
                           </div>
                           <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-400">Framework:</span>
                              <span className="text-cyber-blue font-mono">{scanResults.web_analysis.framework}</span>
                           </div>
                           <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-400">CMS:</span>
                              <span className="text-cyber-neon font-mono">{scanResults.web_analysis.cms}</span>
                           </div>
                        </div>
                      </div>

                      {/* Security Indicators */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={12} /> Vulnerability Markers
                        </div>
                        <div className="space-y-2">
                           {scanResults.web_analysis.vulnerability_indicators?.length > 0 ? (
                             scanResults.web_analysis.vulnerability_indicators.map((ind, i) => (
                               <div key={i} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-[9px] font-bold uppercase">
                                  {ind}
                               </div>
                             ))
                           ) : (
                             <div className="text-[10px] text-gray-600 italic">No surface-level indicators found.</div>
                           )}
                        </div>
                      </div>

                      {/* Admin Panels */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Lock size={12} /> Admin Recon
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {scanResults.web_analysis.admin_panels?.length > 0 ? (
                             scanResults.web_analysis.admin_panels.map((p, i) => (
                               <span key={i} className="text-[10px] bg-cyber-black px-2 py-1 rounded border border-white/10 text-gray-300 font-mono">
                                  {p}
                               </span>
                             ))
                           ) : (
                             <div className="text-[10px] text-gray-600 italic">No admin panels discovered.</div>
                           )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NIST Vulnerability Intelligence */}
              <AnimatePresence>
                {scanProgress === 100 && scanResults && scanResults.findings && scanResults.findings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-2xl bg-cyber-alert/5 border border-cyber-alert/20"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Shield className="text-cyber-alert" size={20} />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Vulnerability Intelligence (NIST NVD)</h4>
                      </div>
                      <div className="text-[10px] bg-cyber-alert/20 border border-cyber-alert/40 text-cyber-alert px-2 py-1 rounded font-black uppercase">
                        {scanResults.findings.length} COUNTER-MEASURES REQUIRED
                      </div>
                    </div>

                    <div className="space-y-4">
                      {scanResults.findings.map((vuln, i) => (
                        <div key={i} className="p-4 rounded-xl bg-cyber-black/40 border border-white/5 group hover:border-cyber-alert/30 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-black text-cyber-alert bg-cyber-alert/10 px-2 py-1 rounded border border-cyber-alert/20">
                                {vuln.cve || 'N/A'}
                              </span>
                              <h5 className="text-sm font-bold text-white group-hover:text-cyber-alert transition-colors">{vuln.name}</h5>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] font-bold text-gray-500 uppercase">CVSS:</div>
                                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${vuln.cvss_score >= 9 ? 'bg-red-600' : vuln.cvss_score >= 7 ? 'bg-orange-500' : 'bg-yellow-500'}`} 
                                    style={{ width: `${(vuln.cvss_score || 0) * 10}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono font-bold text-white">{(vuln.cvss_score || 0).toFixed(1)}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                vuln.severity === 'CRITICAL' ? 'border-red-600 bg-red-900/10 text-red-600' :
                                vuln.severity === 'HIGH' ? 'border-orange-500 bg-orange-900/10 text-orange-500' :
                                'border-yellow-500 bg-yellow-900/10 text-yellow-500'
                              }`}>
                                {vuln.severity}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-white/5 pl-4 ml-1">
                            {vuln.description}
                          </p>

                          {/* Exploitation Intelligence Layer */}
                          <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-cyber-alert" /> Exploitation Pathway
                              </div>
                              <div className="flex items-center gap-3">
                                {vuln.exploit_available ? (
                                  <a 
                                    href={vuln.exploit_url || `https://www.exploit-db.com/search?cve=${vuln.cve}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold hover:bg-red-500/20 transition-all shadow-red-glow"
                                  >
                                    <Cloud size={12} /> Exploit-DB Payload
                                  </a>
                                ) : (
                                  <div className="text-[10px] text-gray-600 italic">No public exploit verified.</div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={12} /> Searchsploit Toolkit
                              </div>
                              <div className="relative group/cmd">
                                <code className="block p-2 rounded bg-cyber-black border border-white/10 text-[10px] text-cyber-blue font-mono group-hover/cmd:border-cyber-blue/30 transition-all">
                                  {vuln.searchsploit_cmd || `searchsploit --cve ${vuln.cve}`}
                                </code>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(vuln.searchsploit_cmd)}
                                  className="absolute top-1/2 -right-2 -translate-y-1/2 p-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue opacity-0 group-hover/cmd:opacity-100 transition-all hover:bg-cyber-blue/20"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ports Table */}
              <AnimatePresence>
                {scanProgress === 100 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <table className="w-full text-left">
                       <thead>
                         <tr className="text-[10px] text-gray-600 uppercase font-black border-b border-white/5 pb-2">
                           <th className="pb-3 pl-6">{intensity === 'ports_only' ? 'PORT' : 'PORT/PROTO'}</th>
                           {intensity !== 'ports_only' && <th className="pb-3 text-left">SERVICE</th>}
                           {intensity === 'ports_only' ? <th className="pb-3 text-left">STATE</th> : <th className="pb-3 text-left">VERSION ARCHITECTURE</th>}
                           {intensity !== 'ports_only' && <th className="pb-3 pr-6 text-right">RISK</th>}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {(ctxLivePorts || []).length > 0 ? (
                            ctxLivePorts.map((p, i) => (
                              <ExpandablePortRow key={`${p.port}-${i}`} port={p} isPortsOnly={intensity === 'ports_only'} />
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-10 text-center">
                                 <p className="text-xs text-gray-600 font-mono">INTELLIGENCE SYNTHESIS ACTIVE: NO PHYSICAL PORTS DETECTED</p>
                              </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
};

export default ScanView;

