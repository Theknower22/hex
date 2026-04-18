/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import RiskScoreGauge from '../components/RiskScoreGauge';
import RiskPrioritizationEngine from '../components/RiskPrioritizationEngine';
import IntelligenceDoughnut from '../components/IntelligenceDoughnut';
import GlobalHeader from '../components/GlobalHeader';
import { adminService, vulnService } from '../services/apiClient';
import { ShieldAlert, AlertTriangle, Network, Cpu } from 'lucide-react';

const Dashboard = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const [stats, setStats] = useState({ users: 0, total_scans: 0, critical_findings: 0, risk_score: 0 });
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, findingsRes] = await Promise.all([
          adminService.getStats(),
          vulnService.getAllFindings()
        ]);
        setStats(statsRes.data);
        setFindings(findingsRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayFindings = findings;
  const criticalFindings = findings.filter(f => f.severity === 'Critical' || f.severity === 'High');

  return (
    <div className="space-y-6">
      <GlobalHeader 
        title={headerTitle} 
        subtitle={headerSubtitle} 
        isMonochrome={isMonochrome} 
        onToggleMonochrome={onToggleMonochrome} 
      />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Global Risk Score" 
          value={(stats?.risk_score || 0).toFixed(1)} 
          subtext="Normalized weight of all active zero-day and CVE vectors."
          icon={ShieldAlert}
          colorClass="text-cyber-alert"
          trend={{ label: "RISK LEVEL: STABLE", positive: true }}
        />
        <StatCard 
          title="Important Vulnerabilities" 
          value={stats.critical_findings || criticalFindings.length} 
          subtext="Count of findings requiring immediate remediation."
          icon={AlertTriangle}
          colorClass="text-cyber-warning"
          trend={{ label: "NEEDS ATTENTION", positive: false }}
        />
        <StatCard 
          title="Total Operational Scans" 
          value={stats.total_scans || 0} 
          subtext="Full pipeline intelligence audits performed to date."
          icon={Network}
          colorClass="text-cyber-blue"
          trend={{ label: "+12% CAPACITY", positive: true }}
        />
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cyber-panel flex flex-col h-64 md:h-80 lg:h-96">
           <RiskScoreGauge score={stats?.risk_score || 0} />
        </div>
        
        <div className="cyber-panel flex flex-col aspect-square max-h-96 mx-auto w-full">
           <IntelligenceDoughnut findings={displayFindings} />
        </div>

        <div className="cyber-panel flex flex-col aspect-square max-h-96 mx-auto w-full">
           <RiskPrioritizationEngine findings={displayFindings} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
