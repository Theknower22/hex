/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Server, Shield, Globe, Terminal, Activity } from 'lucide-react';

const AttackPathVisualizer = () => {
  const nodes = [
    { id: 1, icon: Globe, label: 'External IP', x: 50, y: 150, color: '#3b82f6' },
    { id: 2, icon: Shield, label: 'Firewall', x: 200, y: 150, color: '#39ff14' },
    { id: 3, icon: Server, label: 'Web Server', x: 350, y: 80, color: '#ffcc00' },
    { id: 4, icon: Terminal, label: 'API Gateway', x: 350, y: 220, color: '#ffcc00' },
    { id: 5, icon: Activity, label: 'Database', x: 500, y: 150, color: '#ff003c' },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
  ];

  return (
    <div className="relative w-full h-[300px] bg-cyber-black/40 rounded-xl overflow-hidden border border-cyber-border">
      <svg className="w-full h-full">
        {/* Draw connections */}
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1, delay: i * 0.2 }}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#0047ff"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}
        
        {/* Animated pulses on lines */}
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="3"
              fill="#39ff14"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              style={{
                offsetPath: `path('M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}')`
              }}
            />
          );
        })}
      </svg>

      {/* Draw Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, delay: node.id * 0.1 }}
            style={{ left: node.x, top: node.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
              style={{ 
                 backgroundColor: `${node.color}20`,
                 border: `1px solid ${node.color}50`,
                 boxShadow: `0 0 10px ${node.color}30`
              }}
            >
              <Icon size={20} style={{ color: node.color }} />
            </div>
            <span className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
              {node.label}
            </span>
          </motion.div>
        );
      })}
      
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Activity size={14} className="text-cyber-neon animate-pulse" />
        <span className="text-[10px] font-bold text-cyber-neon uppercase tracking-widest">Live Attack Path</span>
      </div>
    </div>
  );
};

export default AttackPathVisualizer;



