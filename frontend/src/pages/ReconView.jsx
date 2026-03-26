/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { reconService } from '../services/apiClient';
import { Search, Globe, Fingerprint, Play, Loader2, Target, Wifi, MapPin, Database } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import MapModal from '../components/MapModal';

const ReconView = () => {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleDiscovery = async () => {
    if (!target.trim()) return;
    setIsScanning(true);
    setError(null);
    setResults(null);
    try {
      const res = await reconService.fullRecon(target);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Recon failed. Check the target and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const geo = results?.ip_intelligence || {};
  const dnsRecords = results?.dns_records || [];
  const headers = results?.headers?.headers || {};
  const version = results?.headers?.version || "Unknown";
  const sslInfo = results?.ssl_info || {};
  const subdomains = results?.subdomains || [];
  const whoisInfo = results?.whois_info || {};

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight text-white mb-1"
          >
            Passive <span className="text-cyber-blue">Reconnaissance</span>
          </motion.h2>
          <p className="text-gray-500 text-sm font-medium">Network surface mapping: IP geo, DNS, SSL, subdomains, and WHOIS.</p>
        </div>
      </header>

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
              onKeyPress={(e) => e.key === 'Enter' && handleDiscovery()}
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

      {!results && !isScanning && (
        <div className="text-center py-20">
          <Globe className="mx-auto text-gray-700 mb-4" size={60} />
          <p className="text-gray-500 font-medium">Enter a target above to start reconnaissance.</p>
        </div>
      )}

      {results && (
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
                    { label: 'City', value: geo.city },
                    { label: 'Country', value: geo.country },
                    { label: 'Coords', value: `${geo.lat}, ${geo.lon}` },
                    { label: 'ISP', value: geo.isp },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                      <span className="font-mono text-[10px] text-gray-300">{value}</span>
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

          {/* DNS */}
          <div className="lg:col-span-4">
            <CyberCard title="DNS Records" icon={Database}>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 text-[10px]">
                {dnsRecords.map((record, i) => (
                  <div key={i} className="p-2 bg-white/5 border border-white/5 rounded-lg flex flex-col">
                    <span className="font-bold text-cyber-blue uppercase mb-1">{record.type}</span>
                    <span className="font-mono text-gray-400 break-all">{record.value}</span>
                  </div>
                ))}
                {dnsRecords.length === 0 && <p className="text-gray-600 text-xs">No DNS records found.</p>}
              </div>
            </CyberCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconView;

