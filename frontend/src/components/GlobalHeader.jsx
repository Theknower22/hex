/* eslint-disable no-unused-vars */
import React from 'react';
import { Bell, User, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const GlobalHeader = ({ title, subtitle, isMonochrome, onToggleMonochrome }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black tracking-tighter uppercase text-white"
          >
            {title}
          </motion.h2>
          <div className="px-2 py-0.5 bg-cyber-blue/20 border border-cyber-blue/30 rounded text-[10px] font-bold text-cyber-blue animate-pulse">
            SECURE_SESSION
          </div>
        </div>
        {subtitle && (
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMonochrome}
          className={`relative w-10 h-10 flex items-center justify-center transition-all rounded-lg border ${
            isMonochrome 
              ? 'bg-cyber-neon/20 border-cyber-neon text-cyber-neon shadow-[0_0_10px_rgba(57,255,20,0.5)]' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Monochrome Aesthetics"
        >
          <Palette size={18} />
        </button>

        <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border-l border-white/10 pl-4">
          <Bell size={18} />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyber-alert rounded-full border border-cyber-black" />
        </button>

        <div className="flex items-center gap-4 pl-4 border-l border-white/10 text-right">
          <div className="hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-white">SOC Admin</p>
            <p className="text-[8px] text-cyber-neon font-black uppercase tracking-tighter mt-1">CLEARED</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyber-surface border border-white/10 flex items-center justify-center overflow-hidden">
            <User size={20} className="text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
