/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { Target, Shield, ArrowRight, Zap, Ghost, Database, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { vulnService } from '../services/apiClient';

const Node = ({ icon: Icon, title, desc, active, type }) => (
  <div className={`relative flex flex-col items-center group w-48 transition-all duration-700 ${active ? 'scale-110' : 'opacity-40 grayscale'}`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 
      ${active ? 'bg-cyber-blue shadow-[0_0_20px_rgba(0,71,255,0.6)] neon-border ring-2 ring-cyber-blue/50' : 'bg-cyber-surface border border-cyber-border'}`}>
      <Icon className={active ? 'text-white' : 'text-gray-500'} size={28} />
    </div>
    <div className="text-center mt-4">
      <h5 className={`font-bold text-sm mb-1 ${active ? 'text-white' : 'text-gray-600'}`}>{title}</h5>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{type}</p>
    </div>
    
    <div className="absolute top-20 opacity-0 group-hover:opacity-100 transition-opacity bg-cyber-dark border border-cyber-border p-3 rounded-lg w-56 z-20 pointer-events-none shadow-2xl">
      <p className="text-xs text-gray-300 leading-normal">{desc}</p>
    </div>
  </div>
);

const Connector = ({ active }) => (
  <div className="w-20 pt-8">
    <div className="relative h-px w-full bg-cyber-border overflow-hidden">
      {active && (
        <div className="absolute inset-0 bg-cyber-blue animate-pulse w-full"></div>
      )}
    </div>
    <div className="flex justify-center mt-2">
      <ArrowRight className={active ? 'text-cyber-blue animate-pulse' : 'text-gray-800'} size={14} />
    </div>
  </div>
);

const AttackPath = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const res = await vulnService.getAllFindings();
        setFindings(res.data || []);
      } catch (err) {
        console.error("Path analysis error", err);
        setFindings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, []);

  const hasCritical = findings.some(f => f.severity === 'Critical');
  const hasHigh = findings.some(f => f.severity === 'High');

  if (loading) {
     return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-cyber-blue" size={40} />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">MAP-GEN: ANALYZING NETWORK TOPOLOGY...</p>
        </div>
     );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="mb-12">
        <h2 className="text-3xl font-bold neon-text">Attack Path Analysis</h2>
        <p className="text-gray-400 mt-1">Live visualization of exploit possibility chains based on current scan results.</p>
      </header>

      <div className="flex-1 cyber-panel flex flex-col items-center justify-center bg-cyber-dark/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="h-full w-full bg-grid-pattern bg-[size:30px_30px]"></div>
        </div>

        <div className="relative flex items-start gap-0 z-10 px-10">
          <Node 
            icon={Target} 
            title="External Entry" 
            type="Initial Access" 
            active={true}
            desc="Exposed attack surface identified via port scanning."
          />
          <Connector active={findings.length > 0} />
          <Node 
            icon={Ghost} 
            title="Injection Point" 
            type="Exploitation" 
            active={findings.length > 0}
            desc={findings.length > 0 ? "Potential for code or data injection confirmed." : "Waiting for scan data..."}
          />
          <Connector active={hasCritical} />
          <Node 
            icon={Zap} 
            title="Escalation" 
            type="Impact" 
            active={hasCritical}
            desc={hasCritical ? "Critical flaw allows for account takeover or RCE." : "No critical escalation path found."}
          />
          <Connector active={hasHigh && hasCritical} />
          <Node 
            icon={Database} 
            title="Data Access" 
            type="Lateral Movement" 
            active={hasHigh && hasCritical}
            desc="Ability to pivot into internal data storage confirmed."
          />
          <Connector active={hasCritical && findings.length > 5} />
          <Node 
            icon={Lock} 
            title="Breach Node" 
            type="Exfiltration" 
            active={hasCritical && findings.length > 5}
            desc="Full path for data exfiltration exists."
          />
        </div>

        <div className="mt-20 flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-blue"></div>
            <span className="text-xs text-gray-400">Confirmed Path</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-3 h-3 rounded-full bg-cyber-border"></div>
            <span className="text-xs">Potential Vector</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cyber-panel border-l-4 border-l-red-500">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} />
            Highest Impact Threat
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {hasCritical 
              ? "A critical path has been mapped directly to administrative infrastructure. Immediate remediation of SQL injection and IAM policies is required."
              : "No direct critical breach path detected, but multiple high-risk entry points remain open."}
          </p>
        </div>
        <div className="cyber-panel border-l-4 border-l-cyber-blue">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="text-cyber-blue" size={18} />
            Strategic Interception
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Break the chain at the <strong>Injection Point</strong> node by implementing strict input sanitization and a zero-trust network architecture.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttackPath;

