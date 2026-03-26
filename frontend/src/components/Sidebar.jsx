/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React from 'react';
import { LayoutDashboard, Shield, Search, Network, AlertTriangle, FileText, Settings, HelpCircle, LogOut, BookOpen, ChevronRight } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Reconnaissance', icon: <Search size={18} />, path: '/recon' },
    { name: 'Network Scan', icon: <Network size={18} />, path: '/scan' },
    { name: 'Vulnerabilities', icon: <AlertTriangle size={18} />, path: '/vulnerabilities' },
    { name: 'Attack Path', icon: <Shield size={18} />, path: '/attack-path' },
    { name: 'Reports', icon: <FileText size={18} />, path: '/reports' },
    { name: 'Framework', icon: <BookOpen size={18} />, path: '/about' },
    { name: 'Admin Panel', icon: <Settings size={18} />, path: '/admin' },
  ];

  return (
    <div className="w-64 h-screen bg-cyber-black/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-40">
      <div className="flex items-center gap-3 mb-12">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-cyber-blue rounded-xl flex items-center justify-center shadow-blue-glow group-hover:scale-110 transition-transform">
            <Shield className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tighter leading-tight">HEXA<span className="text-cyber-neon">SHIELD</span></h1>
            <span className="text-[8px] text-cyber-blue font-bold uppercase tracking-[0.2em]">Intel Platform</span>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center group relative px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-cyber-blue/20 text-white border border-cyber-blue/30 shadow-blue-glow' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'text-cyber-neon' : 'text-gray-500 group-hover:text-cyber-blue'} transition-colors duration-300`}>
                  {item.icon}
                </div>
                <span className="ml-3 font-semibold text-sm tracking-tight">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-bar"
                    className="absolute left-0 w-1 h-6 bg-cyber-neon rounded-r-full"
                  />
                )}
                {isActive && <ChevronRight size={14} className="ml-auto text-cyber-neon" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="mb-6 p-4 bg-cyber-deep-blue/20 border border-cyber-blue/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</span>
          </div>
          <div className="text-[10px] text-gray-500">All modules operational. Neural link stable.</div>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-cyber-alert transition-colors group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

