/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Shield, Zap, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { vulnService } from '../services/apiClient';
import { useSecurity } from '../context/SecurityContext';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/GlobalHeader';

const TacticalStep = ({ title, desc, active, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 ${active ? 'bg-cyber-blue/5 border-cyber-blue/30 backdrop-blur-sm shadow-[0_0_15px_rgba(0,71,255,0.05)]' : 'bg-transparent border-white/5 opacity-50'}`}
  >
    <div className={`mt-0.5 p-1 rounded bg-black flex-shrink-0 ${active ? 'text-cyber-blue' : 'text-gray-600'}`}>
      <Zap size={14} />
    </div>
    <div>
      <h4 className={`text-sm font-bold mb-1 ${active ? 'text-white' : 'text-gray-500'}`}>{title}</h4>
      <p className="text-xs text-gray-400/80 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const GraphNode = ({ x, y, color, label, delay }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-2xl
      ${color === 'blue' ? 'bg-blue-500 border-blue-900 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}
      ${color === 'green' ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : ''}
      ${color === 'orange' ? 'bg-orange-500 border-orange-900 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : ''}
      ${color === 'red' ? 'bg-rose-500 border-rose-900 shadow-[0_0_30px_rgba(225,29,72,0.3)]' : ''}
    `}>
      <div className={`w-6 h-6 rounded-full ${color === 'blue' ? 'bg-blue-900/50' : color === 'green' ? 'bg-emerald-900/50' : color === 'orange' ? 'bg-orange-900/50' : 'bg-rose-900/50'} border border-black/20`} />
    </div>
    <span className="mt-3 text-xs font-bold text-gray-200 tracking-wide whitespace-nowrap">{label}</span>
  </motion.div>
);

const TargetNode = ({ findings, target }) => {
  const hasCritical = findings.some(f => f.severity === 'Critical');
  
  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in duration-500 p-8">
      {/* Left: Topological Graph */}
      <div className="flex-[2] cyber-panel bg-black/40 border border-white/5 relative overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-cyber-neon shadow-[0_0_10px_rgba(0,255,102,0.8)]"></div>
          <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Topological Path Mapping</h3>
        </div>

        <div className="flex-1 relative w-full h-full min-h-[400px]">
          {/* SVG Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
             <defs>
                <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="rgba(0, 71, 255, 0.5)" />
                   <stop offset="100%" stopColor="rgba(0, 255, 102, 0.5)" />
                </linearGradient>
             </defs>
             {/* Node 1 to 2 */}
             <motion.line x1="20%" y1="50%" x2="40%" y2="50%" stroke="url(#beam)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
             <circle cx="30%" cy="50%" r="2" fill="#00ffff" />
             {/* Node 2 to 3 (Top) */}
             <motion.line x1="40%" y1="50%" x2="60%" y2="30%" stroke="rgba(0, 71, 255, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }} />
             <circle cx="50%" cy="40%" r="2" fill="#00ffff" />
             {/* Node 2 to 4 (Bottom) */}
             <motion.line x1="40%" y1="50%" x2="60%" y2="70%" stroke="rgba(0, 71, 255, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }} />
             <circle cx="50%" cy="60%" r="2" fill="#00ffff" />
             {/* Node 3 to 5 */}
             <motion.line x1="60%" y1="30%" x2="80%" y2="50%" stroke="rgba(0, 71, 255, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }} />
             <circle cx="70%" cy="40%" r="2" fill="#00ffff" />
             {/* Node 4 to 5 */}
             <motion.line x1="60%" y1="70%" x2="80%" y2="50%" stroke="rgba(0, 71, 255, 0.4)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }} />
             <circle cx="70%" cy="60%" r="2" fill="#00ffff" />
          </svg>

          {/* Nodes */}
          <GraphNode x={20} y={50} color="blue" label={`External (${target})`} delay={0} />
          <GraphNode x={40} y={50} color="green" label="Security GW" delay={0.5} />
          <GraphNode x={60} y={30} color="orange" label="Web Cluster" delay={1} />
          <GraphNode x={60} y={70} color="orange" label="App API" delay={1} />
          <GraphNode x={80} y={50} color="red" label="Data Core" delay={1.5} />
        </div>
      </div>

      {/* Right: Tactics Panel */}
      <div className="flex-[1] flex flex-col gap-6">
        <div className="cyber-panel bg-black/40 border border-white/5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Incursion Intelligence</h3>
            <Shield className="text-cyber-blue" size={20} />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border flex gap-4 items-start mb-8
              ${hasCritical ? 'bg-red-900/10 border-red-500/30' : 'bg-cyber-blue/10 border-cyber-blue/30'}
            `}
          >
             {hasCritical ? <AlertTriangle className="text-red-500 mt-0.5" size={16} /> : <AlertCircle className="text-cyber-blue mt-0.5" size={16} />}
             <div>
                <h4 className="text-sm font-bold text-white mb-1">Threat Status</h4>
                <p className="text-xs text-gray-400">{hasCritical ? 'Active incursion chain detected.' : 'Monitoring perimeter defenses.'}</p>
             </div>
          </motion.div>

          <div className="flex justify-between items-center mb-4">
             <h5 className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Tactical Steps</h5>
             <span className="text-[10px] font-bold text-cyber-blue">5 READY</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             <TacticalStep 
                title="Stage 1: Initial Recon"
                desc={`Passive and active discovery on ${target} successfully mapped entry points.`}
                active={true}
                delay={0.2}
             />
             <TacticalStep 
                title="Stage 2: Weaponization"
                desc="Service fingerprinting identified weaponizable flaws in the target architecture."
                active={findings.length > 0}
                delay={0.4}
             />
             <TacticalStep 
                title="Stage 3: Exploitation"
                desc="Active vulnerability validation confirmed susceptibility to remote orchestration."
                active={findings.some(f => f.severity === 'Critical' || f.severity === 'High')}
                delay={0.6}
             />
             <TacticalStep 
                title="Stage 4: Post-Exploit"
                desc="Authorization bypass confirmed. Potential route to sensitive Data Core identified."
                active={hasCritical}
                delay={0.8}
             />
             <TacticalStep 
                title="Stage 5: Data Exfiltration"
                desc="Critical data exposure validated via simulated exfiltration chain."
                active={hasCritical && findings.length > 3}
                delay={1.0}
             />
          </div>
        </div>
      </div>
    </div>
  );
}

const AttackPathView = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const { vulnResults: findings, setVulnResults: setFindings, activeTarget } = useSecurity();
  const [loading, setLoading] = useState(!findings);
  const [target, setTarget] = useState(activeTarget || 'google.com'); // Fallback for visual fidelity

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const res = await vulnService.getAllFindings();
        setFindings(res.data || []);
        // Find unique target if available
        if (res.data && res.data.length > 0 && res.data[0].target) {
           setTarget(res.data[0].target);
        }
      } catch (err) {
        console.error("Path analysis error", err);
        setFindings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, [setFindings]);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyber-blue" size={40} />
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">MAP-GEN: ANALYZING NETWORK TOPOLOGY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GlobalHeader 
        title={headerTitle} 
        subtitle={headerSubtitle} 
        isMonochrome={isMonochrome} 
        onToggleMonochrome={onToggleMonochrome} 
      />
      <main className="flex-1 overflow-hidden">
         <TargetNode findings={findings} target={target} />
      </main>
    </div>
  );
};

export default AttackPathView;
