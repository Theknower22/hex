import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="cyber-panel flex flex-col justify-between h-44 group transition-all duration-500 relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${colorClass.replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-cyber-black border border-white/5 shadow-2xl transition-all duration-300 group-hover:border-white/20 ${colorClass}`}>
          <Icon size={24} />
        </div>
        
        <div className="text-right flex flex-col">
          <span className="text-3xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            {value}
          </span>
          {trend && (
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${trend.positive ? 'text-cyber-neon' : 'text-cyber-alert'}`}>
              {trend.positive ? '↑' : '↓'} {trend.label}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-1.5 group-hover:text-gray-300 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2">
           <div className={`w-1 h-1 rounded-full animate-pulse ${colorClass.replace('text-', 'bg-')}`} />
           <p className="text-[10px] text-gray-500 font-medium font-mono leading-tight">
             {subtext}
           </p>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ${colorClass.replace('text-', 'bg-')}`} />
    </motion.div>
  );
};

export default StatCard;
