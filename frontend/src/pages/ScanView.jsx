/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Search, Shield, Zap, Play, Terminal, Cloud, Activity, Loader2, Cpu, Globe, AlertCircle } from 'lucide-react';
import { scanService } from '../services/apiClient';
import { useNotification } from '../components/NotificationSystem';
import CyberCard from '../components/CyberCard';

const ScanView = () => {
  const showNotification = useNotification();
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('full');
  const [isScanning, setIsScanning] = useState(false);
  const [livePorts, setLivePorts] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState([]);

  const addLog = (line, color = 'text-gray-400') => {
    setLogLines(prev => [...prev, { line, color }]);
  };

  const startScan = async () => {
    if (!target) {
      showNotification("Please enter a target address", "warning");
      return;
    }
    setIsScanning(true);
    setProgress(0);
    setLivePorts([]);
    setScanResult(null);
    setLogLines([]);

    addLog(`[INIT] HEXA-SCAN TCP ENGINE V4.1 STARTING...`, 'text-cyber-blue');
    addLog(`[INFO] TARGET: ${target}`, 'text-gray-400');
    addLog(`[INFO] PROBING TOP 30 COMMON PORTS...`, 'text-gray-400');

    // Animate progress while scan runs
    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + 3, 90);
      setProgress(prog);
    }, 400);

    try {
      const res = await scanService.startScan(target, scanType);
      const data = res.data;

      clearInterval(interval);
      setProgress(100);

      if (data.error) {
        addLog(`[ERROR] ${data.error}`, 'text-cyber-alert');
        showNotification(data.error, "error");
      } else {
        addLog(`[DONE] RESOLVED IP: ${data.ip}`, 'text-cyber-neon');
        addLog(`[DONE] OPEN PORTS FOUND: ${data.open_count}`, 'text-cyber-neon');
        if (data.open_count === 0) {
          addLog(`[INFO] Target is well-hardened. No standard ports exposed.`, 'text-cyber-warning');
          addLog(`[INFO] Vulnerability intel recorded via exposure analysis.`, 'text-gray-500');
        }
        (data.ports || []).forEach(p => {
          const color = p.risk === 'Critical' ? 'text-cyber-alert' : p.risk === 'High' ? 'text-orange-500' : p.risk === 'Medium' ? 'text-cyber-warning' : 'text-cyber-neon';
          addLog(`[OPEN] ${p.port}/TCP â†’ ${p.service} [${p.risk.toUpperCase()}]${p.banner ? ` | ${p.banner}` : ''}`, color);
        });
        addLog(`[VULN] ${data.findings_count} VULNERABILITY FINDING(S) RECORDED.`, 'text-cyber-blue');
        setLivePorts(data.ports || []);
        setScanResult(data);
        showNotification(`Scan complete. ${data.open_count} open ports, ${data.findings_count} findings.`, "success");
      }
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      addLog(`[ERROR] Scan failed: ${err.message}`, 'text-cyber-alert');
      showNotification("Scan failed. Check your connection to the backend.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight text-white mb-1"
          >
            Network <span className="text-cyber-neon">Scanning</span>
          </motion.h2>
          <p className="text-gray-500 text-sm font-medium">Deep packet inspection and service version discovery.</p>
        </div>
      </header>

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
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Engine Profile</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'full', name: 'Intense Audit', desc: 'Comprehensive scripts & OS discovery', icon: Zap, color: 'text-cyber-neon' },
                    { id: 'quick', name: 'Stealth Discovery', desc: 'Top 100 ports, fast evasion', icon: Shield, color: 'text-cyber-blue' },
                  ].map(profile => (
                    <button 
                      key={profile.id}
                      onClick={() => setScanType(profile.id)}
                      className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-4 group
                        ${scanType === profile.id ? 'bg-cyber-deep-blue/20 border-cyber-blue/50 shadow-blue-glow' : 'bg-cyber-black/40 border-white/5 hover:border-white/10'}`}
                    >
                      <div className={`p-2 rounded-lg bg-cyber-black border border-white/5 ${scanType === profile.id ? profile.color : 'text-gray-700'}`}>
                        <profile.icon size={20} />
                      </div>
                      <div>
                        <div className={`text-sm font-bold tracking-tight ${scanType === profile.id ? 'text-white' : 'text-gray-500'}`}>{profile.name}</div>
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
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isScanning ? 'Engine Active' : 'Sensor Ready'}</span>
                  <span className="text-xl font-mono font-bold text-cyber-neon tracking-tighter">{progress}%</span>
                </div>
                <div className="w-full bg-cyber-black h-1.5 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-cyber-neon shadow-neon-glow" 
                   />
                </div>
              </div>

              {/* Console Output */}
              <div className="flex-1 bg-cyber-black/80 rounded-xl p-5 font-mono text-[11px] text-gray-400 overflow-y-auto h-64 border border-white/5 relative">
                 <div className="absolute top-4 right-4 text-[8px] font-black text-cyber-blue/30 uppercase tracking-widest">Live Log</div>
                 <div className="space-y-1">
                    {logLines.length === 0 && (
                      <p className="text-cyber-blue">[READY] HEXA-SCAN TCP ENGINE V4.1 STANDBY...</p>
                    )}
                    {logLines.map((log, i) => (
                      <p key={i} className={log.color}>{log.line}</p>
                    ))}
                    {isScanning && <div className="animate-pulse text-cyber-blue mt-2 font-black">_</div>}
                 </div>
              </div>

              {/* Ports Table */}
              <AnimatePresence>
                {progress === 100 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <table className="w-full text-left">
                       <thead>
                         <tr className="text-[10px] text-gray-600 uppercase font-black border-b border-white/5 pb-2">
                           <th className="pb-3">Port/Proto</th>
                           <th className="pb-3">Service</th>
                           <th className="pb-3">Version Architecture</th>
                           <th className="pb-3 text-right">Risk</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {livePorts.map((p, i) => (
                           <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                             <td className="py-4 font-mono text-xs text-cyber-blue">{p.port}/TCP</td>
                             <td className="py-4 font-bold text-sm tracking-tight">{p.service.toUpperCase()}</td>
                             <td className="py-4 text-[11px] text-gray-500 font-mono tracking-tighter">{p.banner}</td>
                             <td className="py-4 text-right">
                               <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                                 p.risk === 'High' ? 'border-cyber-alert text-cyber-alert bg-cyber-alert/5' : 
                                 p.risk === 'Medium' ? 'border-cyber-warning text-cyber-warning bg-cyber-warning/5' : 
                                 'border-cyber-blue text-cyber-blue bg-cyber-blue/5'
                               }`}>
                                 {p.risk}
                               </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state when scan is done with no ports */}
              {progress === 100 && livePorts.length === 0 && scanResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-5 border border-dashed border-white/10 rounded-xl text-center"
                >
                  <Globe size={32} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-600">No Open Standard Ports</p>
                  <p className="text-[10px] text-gray-700 mt-1 font-mono">Target <span className="text-cyber-blue">{scanResult.target}</span> has a hardened firewall. Intelligence still recorded in Vulnerability Analysis.</p>
                </motion.div>
              )}
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
};

export default ScanView;

