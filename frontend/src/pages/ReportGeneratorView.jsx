/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Filter, Loader2, Trash2, Printer, Code } from 'lucide-react';
import { scanService, reportsService } from '../services/apiClient';

const ReportGenerator = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await reportsService.listReports();
      const uniqueScans = response.data.reduce((acc, curr) => {
        if (!acc[curr.scan_id]) {
          acc[curr.scan_id] = {
            id: curr.scan_id,
            target: curr.target,
            date: new Date(curr.timestamp).toLocaleDateString(),
            findings: 0,
            status: "Ready"
          };
        }
        acc[curr.scan_id].findings += 1;
        return acc;
      }, {});
      setReports(Object.values(uniqueScans));
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await scanService.deleteScan(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  // Open full HTML report in a new tab â€” authenticated download via Blob
  const handlePrintPDF = async (id) => {
    const url = reportsService.download(id, 'html');
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.status === 401) {
          alert("Session expired. Please log in again.");
          return;
      }
      const htmlContent = await res.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error("Report load failed", err);
    }
  };

  // Download raw JSON report
  const handleDownloadJSON = async (id) => {
    const url = reportsService.download(id, 'json');
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
          alert("Session expired. Please log in again.");
          return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `REP-${id}.json`;
      a.click();
    } catch (err) {
      console.error("JSON download failed", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="text-cyber-blue animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold neon-text font-mono tracking-tighter">Reporting Engine</h2>
          <p className="text-gray-400 mt-1">Generate, export, and print professional penetration testing reports.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-cyber-surface border border-cyber-border px-4 py-2 rounded text-sm hover:border-gray-500 transition-all flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="cyber-panel py-20 text-center">
          <FileText className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-400">No Reports Available</h3>
          <p className="text-gray-500 mt-2">Go to the dashboard or Network Scan to initiate a security audit first.</p>
        </div>
      ) : (
        <div className="cyber-panel overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cyber-border text-gray-400 text-sm">
                <th className="pb-4 font-medium px-4">Report ID</th>
                <th className="pb-4 font-medium">Target Infrastructure</th>
                <th className="pb-4 font-medium">Scan Date</th>
                <th className="pb-4 font-medium">Findings</th>
                <th className="pb-4 font-medium text-right px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {reports.map((rep) => (
                <tr key={rep.id} className="group hover:bg-cyber-surface/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-cyber-blue" size={18} />
                      <span className="font-mono text-sm tracking-tight">REP-{rep.id}</span>
                    </div>
                  </td>
                  <td className="py-5 font-medium">{rep.target}</td>
                  <td className="py-5 text-gray-500 text-sm">{rep.date}</td>
                  <td className="py-5 text-sm">
                    <span className="px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-[10px] font-bold">
                      {rep.findings} DETECTED
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePrintPDF(rep.id)}
                        className="p-2 hover:bg-cyber-blue/10 text-cyber-blue rounded transition-colors"
                        title="Open Report (Print / Save as PDF)"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadJSON(rep.id)}
                        className="p-2 hover:bg-cyber-neon/10 text-cyber-neon rounded transition-colors"
                        title="Download Raw JSON"
                      >
                        <Code size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rep.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="cyber-panel border-dashed border-2 border-cyber-border flex flex-col items-center justify-center py-12 group hover:border-cyber-blue transition-all cursor-pointer">
           <Download className="text-gray-600 group-hover:text-cyber-blue mb-4 transition-colors" size={40} />
           <h4 className="font-bold text-gray-400 group-hover:text-white transition-colors">Export All Data (JSON)</h4>
           <p className="text-xs text-gray-600 mt-2 text-center max-w-[200px]">Full raw data export for external SIEM integration.</p>
        </div>
        <div className="cyber-panel border-dashed border-2 border-cyber-border flex flex-col items-center justify-center py-12 group hover:border-cyber-neon transition-all cursor-pointer">
           <CheckCircle className="text-gray-600 group-hover:text-cyber-neon mb-4 transition-colors" size={40} />
           <h4 className="font-bold text-gray-400 group-hover:text-white transition-colors">Compliance Packages</h4>
           <p className="text-xs text-gray-600 mt-2 text-center max-w-[200px]">Generate NIST and OWASP compliance reports.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;

