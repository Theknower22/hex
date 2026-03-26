/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Terminal, BarChart3, ChevronRight, Search, Activity, Cpu, Globe, Zap, ShieldCheck, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-cyber-black text-white selection:bg-cyber-blue relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-blue/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-neon/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-cyber-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
              <div className="p-2 bg-cyber-blue/10 rounded-lg border border-cyber-blue/20">
                <Shield className="text-cyber-blue" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">HEXA<span className="text-cyber-blue">SHIELD</span></span>
            </Link>
          </motion.div>
          <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#features" className="hover:text-cyber-blue transition-colors">Tactical Features</a>
            <a href="#intelligence" className="hover:text-cyber-blue transition-colors">Intelligence Hub</a>
            <a href="#security" className="hover:text-cyber-blue transition-colors">Protocol Spec</a>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/login" className="cyber-button text-[10px] px-8 py-3">
              LAUNCH TERMINAL
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue text-[10px] font-black tracking-widest uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></span>
              Neural Defense Engine v4.0 Active
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl font-black tracking-tight leading-[0.9] text-white"
            >
              SECURE THE <br /> 
              <span className="text-cyber-blue drop-shadow-[0_0_30px_rgba(0,112,255,0.3)]">FRONTIER.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 font-medium max-w-xl leading-relaxed"
            >
              Autonomous penetration testing powered by neural intelligence. 
              Identify vulnerabilities, map attack surfaces, and orchestrate 
              remediation before the first breach occurs.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 pt-4"
            >
              <Link to="/login" className="cyber-button text-xs px-12 py-5 flex items-center justify-center gap-3 group">
                PLATFORM ACCESS
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="px-12 py-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyber-blue/50 transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white">
                Register Credentials
              </Link>
            </motion.div>
          </div>

          {/* Abstract Cyber Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="absolute -inset-10 bg-cyber-blue/10 blur-[100px] rounded-full animate-pulse"></div>
            <div className="relative aspect-square rounded-[3rem] border border-white/5 bg-cyber-black/40 backdrop-blur-3xl overflow-hidden p-8 group">
               <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="h-full w-full border border-white/5 rounded-2xl relative flex items-center justify-center">
                  <Cpu className="text-cyber-blue opacity-20 absolute scale-[3] blur-sm animate-pulse" />
                  <div className="relative z-10 text-center space-y-6">
                     <ShieldCheck size={80} className="text-cyber-blue mx-auto filter drop-shadow-[0_0_20px_rgba(0,112,255,0.5)]" />
                     <div className="space-y-1">
                        <div className="text-4xl font-black font-mono tracking-tighter text-white">99.8%</div>
                        <div className="text-[10px] font-black text-cyber-neon uppercase tracking-widest">Confidence Score</div>
                     </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute top-10 right-10 p-3 bg-cyber-black/60 border border-white/10 rounded-xl backdrop-blur-md animate-bounce">
                     <Activity size={16} className="text-cyber-neon" />
                  </div>
                  <div className="absolute bottom-10 left-10 p-3 bg-cyber-black/60 border border-white/10 rounded-xl backdrop-blur-md animate-pulse">
                     <Zap size={16} className="text-cyber-warning" />
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { label: 'Real-time Intelligence', icon: Activity, desc: 'Live monitoring of global threat vectors and zero-day databases.' },
            { label: 'Neural Mapping', icon: Globe, desc: 'AI-assisted attack path visualization and asset reconnaissance.' },
            { label: 'Secure Storage', icon: Database, desc: 'Military-grade encryption for all audit logs and finding reports.' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6 border-l border-white/5 pl-8"
            >
              <div className="p-3 bg-cyber-blue/10 rounded-xl border border-cyber-blue/20">
                <item.icon size={20} className="text-cyber-blue" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2 tracking-tight">{item.label}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-cyber-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <Shield className="text-cyber-blue" size={28} />
              <span className="text-2xl font-black tracking-tighter">HEXA<span className="text-cyber-blue">SHIELD</span></span>
            </Link>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Cyber Intelligence Platform</p>
            <p className="text-gray-700 text-[9px] font-bold mt-2">Â© 2026 HexaShield Security. By Khaled Hani. Graduation Research Project.</p>
          </div>
          
          <div className="flex gap-12">
            <div>
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Resources</h5>
              <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                <a href="#" className="hover:text-cyber-blue transition-colors">Framework Specs</a>
                <a href="#" className="hover:text-cyber-blue transition-colors">API Docs</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

