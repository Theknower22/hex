/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal, Info } from 'lucide-react';
import { aiService } from '../services/apiClient';


const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your AI Security Assistant. I can help you analyze scan results, explain complex vulnerabilities, or suggest remediation steps for your project. How can I assist you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiService.chat(input, "Current scan context");
      const assistantMsg = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Assistant error", err);
      const errMsg = err.response?.data?.detail || err.message || "Link error: failed to reach the security core.";
      setMessages(prev => [...prev, { role: 'assistant', content: `[SYSTEM ALERT] ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col animate-in fade-in duration-500">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold neon-text flex items-center gap-3">
            <Sparkles className="text-cyber-blue" />
            AI Security Assistant
          </h2>
          <p className="text-gray-400 mt-1">Intelligent threat analysis and remediation guidance.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded-full text-[10px] font-bold text-cyber-blue animate-pulse">
            AI ENGINE ONLINE
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 cyber-panel flex flex-col bg-cyber-dark/30 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="h-full w-full bg-grid-pattern bg-[size:20px_20px]"></div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyber-border">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center 
                    ${msg.role === 'user' ? 'bg-cyber-blue text-white' : 'bg-cyber-surface border border-cyber-border text-cyber-neon'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-lg text-sm leading-relaxed shadow-lg
                    ${msg.role === 'user' ? 'bg-cyber-blue/20 text-blue-100 border border-cyber-blue/30' : 'bg-cyber-surface text-gray-300 border border-cyber-border'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-cyber-surface border border-cyber-border p-3 rounded-lg flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-cyber-border bg-cyber-black/50">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ask about vulnerabilities, remediation, or scan results..."
                className="flex-1 bg-cyber-black border border-cyber-border rounded-lg px-4 py-3 text-sm focus:border-cyber-blue outline-none transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="bg-cyber-blue text-white p-3 rounded-lg hover:bg-blue-600 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,71,255,0.4)]"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 space-y-6 hidden lg:block">
          <div className="cyber-panel">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-cyber-blue text-sm">
              <Terminal size={16} />
              Suggested Queries
            </h4>
            <div className="space-y-2">
              {[
                "Explain CVE-2021-44228 (Log4Shell)",
                "What is the Cyber Kill Chain?",
                "How to remediate SQL Injection?",
                "Analyze critical vulnerabilities in detail",
                "Summarize OWASP Top 10 findings",
                "Explain MITRE ATT&CK T1190"
              ].map(q => (
                <button 
                  key={q} 
                  onClick={() => { setInput(q); }}
                  className="w-full text-left p-2.5 text-xs text-gray-400 hover:text-white hover:bg-cyber-surface rounded-lg border border-transparent hover:border-cyber-border transition-all"
                >
                  â†’ {q}
                </button>
              ))}
            </div>
          </div>

          <div className="cyber-panel bg-cyber-blue/5 border-cyber-blue/20">
            <h4 className="font-bold mb-2 flex items-center gap-2 text-cyber-blue text-sm">
              <Info size={16} />
              Context Awareness
            </h4>
            <p className="text-[10px] text-gray-500 leading-normal">
              The AI is currently processing the latest scan results for <strong>hexa-shield.io</strong>. All suggestions are tailored to your specific infrastructure findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

