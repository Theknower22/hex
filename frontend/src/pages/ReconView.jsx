/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reconService } from '../services/apiClient';
import { useSecurity } from '../context/SecurityContext';
import { Search, Globe, Fingerprint, Play, Loader2, Target, Wifi, MapPin, Database, Shield, Zap, Activity, ShieldCheck, Server, AlertCircle, Info } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import GlobalHeader from '../components/GlobalHeader';
import MapModal from '../components/MapModal';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const ReconView = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const { reconResults, setReconResults, activeTarget, setActiveTarget } = useSecurity();
  const [target, setTarget] = useState(activeTarget || '');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // No persistence for inputs as per user request
  useEffect(() => {
    // sessionStorage.setItem('reconState', JSON.stringify({ target }));
  }, [target]);

  const handleDiscovery = async () => {
    if (!target.trim()) return;
    setIsScanning(true);
    setError(null);
    setReconResults(null);
    try {
      const res = await reconService.fullRecon(target);
      setReconResults(res.data);
      setActiveTarget(target);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Recon failed. Check the target and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const geo = reconResults?.ip_intelligence || {};
  const dnsRecords = reconResults?.dns_records || [];
  const headers = reconResults?.headers?.headers || {};
  const version = reconResults?.headers?.version || "Unknown";
  const sslInfo = reconResults?.ssl_info || {};
  const subdomains = reconResults?.subdomains || [];
  const whoisInfo = reconResults?.whois_info || {};

  // Prepare DNS Chart Data
  const dnsCounts = dnsRecords.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {});
  
  const dnsChartData = {
    labels: Object.keys(dnsCounts),
    datasets: [
      {
        label: 'DNS Record Count',
        data: Object.values(dnsCounts),
        backgroundColor: 'rgba(57, 255, 20, 0.6)',
        borderColor: '#39ff14',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { ticks: { color: '#888', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#888' }, grid: { display: false } },
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

      {/* Target Input */}
      <CyberCard className="border-cyber-blue/20">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-blue animate-pulse" size={20} />
            <input
              type="text"
              placeholder="ENTER DOMAIN, URL, OR IP..."
              className="w-full bg-cyber-black/50 border border-cyber-border rounded-xl py-4 pl-12 pr-4 focus:border-cyber-blue outline-none transition-all font-mono text-sm tracking-widest placeholder:text-gray-700 uppercase"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDiscovery()}
            />
          </div>
          <button
            onClick={handleDiscovery}
            disabled={isScanning}
            className="cyber-button px-10 py-4 h-full w-full md:w-auto"
          >
            {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            <span className="font-black tracking-[0.2em]">{isScanning ? 'ANALYZING' : 'INITIATE'}</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
            [ERROR] {error}
          </div>
        )}
      </CyberCard>

      {!reconResults && !isScanning && (
        <div className="text-center py-20">
          <Globe className="mx-auto text-gray-700 mb-4" size={60} />
          <p className="text-gray-500 font-medium">Enter a target above to start reconnaissance.</p>
        </div>
      )}

      {reconResults && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* IP Intelligence & Network Range */}
          <div className="lg:col-span-4 space-y-8">
            <CyberCard title="Target Intelligence" icon={Globe}>
              <div className="space-y-3">
                {[
                  { label: 'Target', value: geo.target, icon: Target },
                  { label: 'Resolved IP', value: geo.ip, icon: Wifi },
                  { label: 'Hostname', value: geo.hostname, icon: Globe },
                  { label: 'Network ASN', value: geo.asn, icon: Database },
                ].map(({ label, value, icon: Icon }) => value && (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Icon size={10} /> {label}
                    </span>
                    <span className="font-mono text-xs text-cyber-blue truncate max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>

              {geo.city && (
                <div className="mt-4 p-4 bg-cyber-deep-blue/20 border border-cyber-blue/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-cyber-neon" size={16} />
                    <span className="text-[10px] font-black text-cyber-neon uppercase tracking-widest">Geolocation</span>
                  </div>
                  {[
                    { label: 'Exact Address', value: geo.exact_address, icon: Target, isPrimary: true },
                    { label: 'City', value: geo.city },
                    { label: 'Country', value: geo.country },
                    { label: 'Coords', value: `${geo.lat}, ${geo.lon}` },
                    { label: 'ISP', value: geo.isp },
                  ].filter(r => r.value).map(({ label, value, isPrimary }) => (
                    <div key={label} className={`flex flex-col space-y-1 py-1 ${isPrimary ? 'pb-2 border-b border-white/5' : ''}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isPrimary ? 'text-cyber-neon' : 'text-gray-500'}`}>{label}</span>
                      <span className={`font-mono text-[10px] ${isPrimary ? 'text-white font-black leading-relaxed' : 'text-gray-300'}`}>{value}</span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsMapOpen(true)}
                    className="w-full mt-4 py-3 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded-xl text-[10px] font-black uppercase"
                  >
                    VIEW ON MAP
                  </button>
                </div>
              )}

              <MapModal 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)} 
                lat={geo.lat} 
                lon={geo.lon} 
                city={geo.city} 
                country={geo.country}
                title={geo.exact_address}
              />
            </CyberCard>

            {/* WHOIS Registry Info */}
            <CyberCard title="Domain WHOIS Info" icon={Fingerprint}>
              {whoisInfo && !whoisInfo.error ? (
                <div className="space-y-3">
                  {[
                    { label: 'Registrar', value: whoisInfo.registrar },
                    { label: 'Created', value: whoisInfo.creation_date?.split('T')[0] },
                    { label: 'Expires', value: whoisInfo.expiration_date?.split('T')[0] },
                    { label: 'Owner', value: whoisInfo.org || whoisInfo.name },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                      <span className="font-mono text-[10px] text-gray-300 truncate max-w-[140px]">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-xs py-4 text-center">{whoisInfo.error || "WHOIS data unavailable"}</p>
              )}
            </CyberCard>
          </div>

          {/* SSL & Headers */}
          <div className="lg:col-span-4 space-y-8">
            <CyberCard title="Service Information" icon={Fingerprint}>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 mb-4">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Service Version</span>
                 <span className="font-mono text-xs text-cyber-neon">{version}</span>
              </div>
            </CyberCard>

            <CyberCard title="SSL/TLS Certificate" icon={Fingerprint}>
              {sslInfo && !sslInfo.error ? (
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Issuer</span>
                    <span className="text-[11px] text-gray-300 font-mono break-all">{sslInfo.issuer.O || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Expiry</span>
                    <span className={`text-[11px] font-mono ${sslInfo.expired ? 'text-red-500' : 'text-cyber-neon'}`}>{sslInfo.notAfter?.split('T')[0]}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-xs py-4 text-center">{sslInfo.error || "SSL data unavailable"}</p>
              )}
            </CyberCard>

            <CyberCard title="HTTP Headers" icon={Fingerprint}>
              <div className="space-y-4">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{key}</span>
                    <span className="text-[11px] text-gray-300 font-mono break-all">{value}</span>
                  </div>
                ))}
                {Object.keys(headers).length === 0 && <p className="text-gray-600 text-xs">No headers detected.</p>}
              </div>
            </CyberCard>
          </div>

          {/* DNS and Subdomains */}
          <div className="lg:col-span-4 space-y-8">
            {dnsRecords.length > 0 && (
              <CyberCard title="DNS Record Distribution" icon={Database}>
                <div className="mt-4 h-48">
                  <Bar data={dnsChartData} options={chartOptions} />
                </div>
              </CyberCard>
            )}
            
            <CyberCard title="DNS Records (Table)" icon={Database}>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-gray-500">
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-mono text-gray-300">
                    {dnsRecords.map((record, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 text-cyber-blue font-bold">{record.type}</td>
                        <td className="py-2 px-3 break-all">{record.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dnsRecords.length === 0 && <p className="text-gray-600 text-xs py-4 text-center">No DNS records found.</p>}
              </div>
            </CyberCard>

            <CyberCard title="Discovered Subdomains" icon={Globe}>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-gray-500">
                      <th className="py-2 px-3">Subdomain</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-mono text-gray-300">
                    {subdomains.map((sub, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 break-all">{sub}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subdomains.length === 0 && <p className="text-gray-600 text-xs py-4 text-center">No subdomains resolved.</p>}
              </div>
            </CyberCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconView;

