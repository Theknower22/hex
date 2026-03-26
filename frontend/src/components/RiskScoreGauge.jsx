/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React from 'react';
import { motion } from 'framer-motion';

const RiskScoreGauge = ({ score = 7.5 }) => {
  const percentage = (score / 10) * 100;
  const strokeDasharray = 339.292; // 2 * PI * r (r=54)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  const getColor = (s) => {
    if (s >= 8) return '#ff003c'; // Alert Red
    if (s >= 5) return '#ffcc00'; // Warning Yellow
    return '#39ff14'; // Neon Green
  };

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="54"
          fill="transparent"
          stroke="#1a1a1b"
          strokeWidth="12"
        />
        <motion.circle
          initial={{ strokeDashoffset: strokeDasharray }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="96"
          cy="96"
          r="54"
          fill="transparent"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeDasharray={strokeDasharray}
          style={{ strokeLinecap: 'round' }}
          className="filter drop-shadow-[0_0_8px_rgba(0,71,255,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-bold font-mono tracking-tighter"
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Risk Index</span>
      </div>
      
      {/* Decorative inner rings */}
      <div className="absolute w-32 h-32 border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute w-28 h-28 border border-white/5 rounded-full pointer-events-none animate-pulse-slow" />
    </div>
  );
};

export default RiskScoreGauge;

