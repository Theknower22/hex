/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Target, 
  Activity, 
  Zap, 
  FileText, 
  ArrowLeft, 
  Globe, 
  Server, 
  Hash, 
  Terminal, 
  AlertTriangle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { reportsService } from '../services/apiClient';
import { motion } from 'framer-motion';
import AttackPathVisualizer from '../components/AttackPathVisualizer';
import GlobalHeader from '../components/GlobalHeader';

const ReportSection = ({ title, icon: Icon, children, sectionNumber }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
       {sectionNumber && <span className="text-cyber-alert font-black text-xl italic">{sectionNumber}</span>}
       <h3 className="text-xl font-black text-white tracking-widest uppercase">{title}</h3>
    </div>
    {children}
  </section>
);

const ReportDetailView = ({ isMonochrome, onToggleMonochrome, headerTitle, headerSubtitle }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const res = await reportsService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HexaShield_Audit_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to generate PDF report from server. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await reportsService.getReportDetails(id);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch report details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 size={40} className="animate-spin text-cyber-blue" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono animate-pulse">Reconstructing Audit Trail...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <AlertTriangle size={48} className="text-cyber-alert" />
        <h2 className="text-2xl font-bold uppercase tracking-tighter">Report Not Found</h2>
        <button onClick={() => navigate('/reports')} className="cyber-button">Return to Inventory</button>
      </div>
    );
  }

  const { recon, ports, findings, target, timestamp } = report;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <GlobalHeader 
        title={`Report Intelligence #${id}`} 
        subtitle={`${target} • ${new Date(timestamp).toLocaleString()}`} 
        isMonochrome={isMonochrome} 
        onToggleMonochrome={onToggleMonochrome} 
      />

      {/* Action Bar / Premium Layout */}
      <div className="flex justify-between items-start mb-12">
         <div>
            <button 
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={14} /> Back to Inventory
            </button>
         </div>
          <div className="flex gap-4">
            <a 
              href={`http://127.0.0.1:8000/api/reports/download/${id}?format=html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-3"
            >
              <Globe size={16} /> View Executive HTML
            </a>
            <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-10 py-4 bg-[#0047ff] hover:bg-[#1a5eff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg shadow-[0_0_30px_rgba(0,71,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
            >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF REPORT'}
            </button>
          </div>
      </div>

      {/* 1. Infrastructure Overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         {/* Service Fingerprint */}
         <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-2xl shadow-2xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Service Fingerprint</h4>
            <div className="space-y-4 font-mono">
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">Detected Version:</span>
                  <span className="text-cyber-neon font-black text-xs uppercase tracking-tight">{recon?.headers?.version || 'Unknown'}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">Server Type:</span>
                  <span className="text-gray-200 font-black text-xs uppercase tracking-tight">{recon?.headers?.headers?.Server || 'gws'}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">Powered By:</span>
                  <span className="text-gray-200 font-black text-xs uppercase tracking-tight">{recon?.headers?.headers?.['X-Powered-By'] || 'N/A'}</span>
               </div>
            </div>
         </div>

         {/* Geospatial Telemetry */}
         <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Geospatial Telemetry</h4>
            <div className="space-y-4 font-mono">
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">Coordinates:</span>
                  <span className="text-cyber-blue font-black text-xs tracking-tight">{recon?.ip_intelligence?.lat || '37.4225'}, {recon?.ip_intelligence?.lon || '-122.085'}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">Location:</span>
                  <span className="text-gray-200 font-black text-xs uppercase tracking-tight">{recon?.ip_intelligence?.city || 'Mountain View'}, {recon?.ip_intelligence?.country || 'United States'}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-gray-500 uppercase text-[10px] w-32">ASN/ISP:</span>
                  <span className="text-gray-200 font-black text-xs uppercase tracking-tight">{recon?.ip_intelligence?.asn || 'AS15169 Google LLC'}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Mapped Subdomains */}
      {recon?.subdomains?.length > 0 && (
         <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-2xl shadow-2xl mb-12">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Mapped Subdomains</h4>
            <div className="flex flex-wrap gap-4">
               {recon.subdomains.map((sub, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-cyber-blue/5 border border-cyber-blue/20 rounded-lg text-cyber-blue font-mono text-[10px] font-black hover:bg-cyber-blue/10 transition-colors">
                     {sub}
                  </span>
               ))}
            </div>
         </div>
      )}

      {/* 3. Vulnerability Deep-Dive */}
      <ReportSection title="Vulnerability Deep-Dive" sectionNumber="03/">
         <div className="space-y-8">
            {findings && findings.length > 0 ? findings.map((f, idx) => (
               <div key={idx} className="bg-[#0a0a0b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Finding Header */}
                  <div className="bg-white/[0.02] border-b border-white/5 px-8 py-5 flex justify-between items-center">
                     <h4 className="text-sm md:text-md font-black text-white uppercase tracking-[0.1em]">{f.name}</h4>
                     <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg
                        ${f.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
                          f.severity === 'High' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 
                          'bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon'}
                     `}>
                        {f.severity} (CVSS: {f.cvss || '5.0'})
                     </div>
                  </div>
                  
                  {/* Finding Body */}
                  <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div>
                        <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4 border-l-2 border-gray-800 pl-3">Vulnerability Description</h5>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                           {f.description}
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                           <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                              <span className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">OWASP Category</span>
                              <span className="text-[10px] font-black text-cyber-neon uppercase tracking-tight">{f.owasp_category || f.owasp || 'A03:2021-Injection'}</span>
                           </div>
                           <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                              <span className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">MITRE ATT&CK</span>
                              <span className="text-[10px] font-black text-cyber-blue uppercase tracking-tight">{f.mitre_id || f.mitre || 'T1190'}</span>
                           </div>
                        </div>

                        {/* Aggregated Sources indicator for Reports */}
                        <div className="mt-6 flex flex-wrap gap-2">
                           {(f.aggregated_sources || ["NIST NVD", "Local Mirror"]).map((source, i) => (
                              <div key={i} className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                 {source}
                              </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="relative">
                        <h5 className="text-[9px] font-black text-cyber-neon uppercase tracking-widest mb-4 border-l-2 border-cyber-neon pl-3 italic">Recommended Remediation</h5>
                        <div className="bg-[#39ff14]/[0.02] border border-[#39ff14]/20 p-6 rounded-2xl backdrop-blur-sm relative group overflow-hidden mb-6">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Shield size={40} className="text-cyber-neon" />
                           </div>
                           <p className="text-xs text-cyber-neon leading-relaxed font-bold z-10 relative">
                              {f.remediation || 'Apply input validation and parameterized queries to mitigate this risk across all vulnerable endpoints.'}
                           </p>
                        </div>

                        {/* External Intelligence Block */}
                        {(f.reference_url || (f.exploit_db_id && f.exploit_db_id !== 'N/A')) && (
                           <div className="grid grid-cols-2 gap-4">
                              {f.reference_url && (
                                <a 
                                  href={f.reference_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                                >
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">NVD Database</span>
                                  <Globe size={14} className="text-cyber-blue group-hover:scale-110 transition-transform" />
                                </a>
                              )}
                              {f.exploit_db_id && f.exploit_db_id !== 'N/A' && (
                                <a 
                                  href={`https://www.exploit-db.com/exploits/${f.exploit_db_id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                                >
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Exploit-DB</span>
                                  <Hash size={14} className="text-cyber-alert group-hover:scale-110 transition-transform" />
                                </a>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )) : (
               <div className="py-20 text-center text-gray-600 border border-dashed border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">No vulnerability findings documented.</div>
            )}
         </div>
      </ReportSection>

      {/* 4. Attack Path Mapping */}
      <ReportSection title="Tactical Incursion Chain" sectionNumber="04/">
         <div className="h-[500px] bg-[#0a0a0b] rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl">
            <AttackPathVisualizer findings={findings} target={target} />
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
               <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse shadow-[0_0_10px_rgba(0,71,255,0.8)]" />
               <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest">Dynamic Path Mapping Reactive</span>
            </div>
         </div>
      </ReportSection>
    </div>
  );
};

export default ReportDetailView;
