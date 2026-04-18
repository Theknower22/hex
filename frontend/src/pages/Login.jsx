/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Activity, Cpu, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/apiClient';
import { useNotification } from '../components/NotificationSystem';
import CyberCard from '../components/CyberCard';

const Login = () => {
  const showNotification = useNotification();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiClient = (await import('../services/apiClient')).default;
        await apiClient.get('health');
        setBackendStatus('online');
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(username.trim(), password);
      localStorage.setItem('access_token', res.data.access_token);
      showNotification("Welcome back, Commander.", "success");
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        showNotification("Cannot connect to server. Is the backend running?", "error");
        setError("Network error: Backend server is unreachable.");
      } else {
        showNotification(err.response?.data?.detail || "Authentication Failed", "error");
        setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="p-4 bg-cyber-blue/10 rounded-2xl border border-cyber-blue/20 mb-4 shadow-blue-glow">
            <Shield className="text-cyber-blue" size={48} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">HEXA<span className="text-cyber-blue">SHIELD</span></h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-cyber-neon shadow-[0_0_5px_#39ff14]' : backendStatus === 'offline' ? 'bg-cyber-alert shadow-[0_0_5px_#ff003c]' : 'bg-gray-600 animate-pulse'}`} />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
              {backendStatus === 'online' ? 'Neural Link Established' : backendStatus === 'offline' ? 'Neural Link Offline' : 'Initializing Link...'}
            </p>
          </div>
        </motion.div>

        <CyberCard className="!p-8 border-cyber-blue/20">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Console Authorization</h2>
            <p className="text-xs text-gray-500 font-medium">Please provide your security credentials to access the node.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-cyber-alert/5 border border-cyber-alert/20 rounded-xl text-cyber-alert text-[10px] font-black uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Operator Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-cyber-blue transition-colors" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="cyber-input w-full py-4 pl-12"
                  placeholder="analyst_zero"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-cyber-blue transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input w-full py-4 pl-12 pr-12"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-cyber-blue transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="cyber-button w-full py-5 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <span className="font-black tracking-[0.2em]">{loading ? 'AUTHENTICATING' : 'AUTHORIZE ACCESS'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
              No Profile Found? <Link to="/register" className="text-cyber-blue font-black hover:underline underline-offset-4">Register New Access</Link>
            </p>
            <Link to="/" className="text-[10px] font-black text-gray-700 hover:text-white transition-colors uppercase tracking-[0.25em]">
              Return to Landing
            </Link>
          </div>
        </CyberCard>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyber-neon" />
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Uptime 99.9%</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-800" />
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyber-blue" />
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">V4 Protocol</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

