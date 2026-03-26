/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/apiClient';
import { Users, Shield, History, Cpu, Server, Activity, AlertCircle, Settings } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({
     total_scans: 0,
     active_targets: 0,
     critical_findings: 0,
     system_health: 'stable'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          adminService.getUsers(),
          adminService.getStats()
        ]);
        setUsers(usersRes.data);
        setSystemStats(statsRes.data);
      } catch (err) {
        console.error("Admin dashboard fetch error", err);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold neon-text">Administrator Console</h2>
        <p className="text-gray-400 mt-1">Global system monitoring, user management, and audit logs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="cyber-panel bg-cyber-blue/5 border-cyber-blue/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyber-blue/10 flex items-center justify-center text-cyber-blue">
            <Cpu size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">CPU Usage</div>
            <div className="text-xl font-bold font-mono">{systemStats.health?.cpu || '0%'}</div>
          </div>
        </div>
        <div className="cyber-panel bg-cyber-neon/5 border-cyber-neon/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyber-neon/10 flex items-center justify-center text-cyber-neon">
            <Server size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Memory</div>
            <div className="text-xl font-bold font-mono">{systemStats.health?.memory || '0 GB / 0 GB'}</div>
          </div>
        </div>
        <div className="cyber-panel bg-red-900/5 border-red-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-red-500/10 flex items-center justify-center text-red-500">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">System Load</div>
            <div className="text-xl font-bold font-mono">{systemStats.health?.load || 'Stable'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="cyber-panel">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Users className="text-cyber-blue" size={18} />
              Registered Users
            </h3>
          </div>
          <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {users.map(u => (
              <div key={u.id} className="p-3 bg-cyber-black/50 border border-cyber-border rounded flex justify-between items-center group hover:border-cyber-blue transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyber-surface flex items-center justify-center text-[10px] font-bold text-cyber-blue border border-cyber-blue/20">
                    {u.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{u.username}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{u.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-[10px] font-bold ${u.status === 'Active' ? 'text-cyber-neon' : 'text-gray-600'}`}>
                    {u.status?.toUpperCase() || 'OFFLINE'}
                  </div>
                  <div className="text-[10px] text-gray-600">{u.last_login}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity */}
        <div className="cyber-panel">
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <History className="text-cyber-blue" size={18} />
            System Audit Audit Log
          </h3>
          <div className="space-y-4">
            {[
              { time: "04:12:01", event: "User 'Admin' authorized scan on 104.21.32.148", type: "info" },
              { time: "04:09:44", event: "New vulnerability definition update installed", type: "success" },
              { time: "03:52:12", event: "Multiple failed login attempts detected - IP 192.168.1.100", type: "warning" },
              { time: "02:15:33", event: "Report 'REP-001' exported as PDF", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 text-[10px] font-mono border-b border-cyber-border/30 pb-3 last:border-0">
                <span className="text-gray-600">{log.time}</span>
                <span className={`
                  ${log.type === 'info' ? 'text-cyber-blue' : ''}
                  ${log.type === 'success' ? 'text-cyber-neon' : ''}
                  ${log.type === 'warning' ? 'text-red-500' : ''}
                `}>
                  [{log.type.toUpperCase()}] {log.event}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-cyber-surface text-gray-400 text-[10px] font-bold border border-cyber-border hover:text-white transition-all">
            DOWNLOAD FULL AUDIT LOG (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

