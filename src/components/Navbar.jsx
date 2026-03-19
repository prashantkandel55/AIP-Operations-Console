// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Pencil, Activity, Database, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { IS_LIVE } from '../api/foundry';
import RiskSparkline from './RiskSparkline';

export function Navbar({ workspaceName, setWorkspaceName, riskHistory = [] }) {
  const [time, setTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [latency, setLatency] = useState(42);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const upTimer = setInterval(() => setUptime(prev => prev + 1), 1000);
    const latencyTimer = setInterval(() => {
      setLatency(prev => Math.max(30, Math.min(120, prev + (Math.random() * 10 - 5))));
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(upTimer);
      clearInterval(latencyTimer);
    };
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatUTC = (date) => {
    return date.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  };

  return (
    <>
      <nav className="h-[44px] border-b border-[var(--border2)] bg-[var(--bg)] flex items-center justify-between px-4 shrink-0 z-50 relative">
        {/* Left Side: Brand */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="font-mono text-[11px] font-bold text-[var(--accent)] tracking-[0.15em] uppercase">PALANTIR</span>
            <div className="h-[14px] w-[1px] bg-[var(--border2)] mx-[10px]" />
            <span className="font-mono text-[9px] text-[var(--text3)] tracking-[0.1em] uppercase font-bold">AIP</span>
          </div>

          <div className="h-[14px] w-[1px] bg-[var(--border2)] mx-[2px]" />

          {/* Operational Metrics */}
          <div className="flex items-center gap-4 ml-2">
             <div className="flex flex-col">
                <span className="label-mono text-[7px] leading-none opacity-50">API_LATENCY</span>
                <span className="font-mono text-[10px] text-[var(--text2)] leading-none mt-0.5">{latency.toFixed(0)}<span className="text-[7px] opacity-40 ml-0.5">MS</span></span>
             </div>
             <div className="flex flex-col">
                <span className="label-mono text-[7px] leading-none opacity-50">SYS_UPTIME</span>
                <span className="font-mono text-[10px] text-[var(--text2)] leading-none mt-0.5">{formatUptime(uptime)}</span>
             </div>
             {riskHistory.length > 1 && (
               <div className="flex flex-col">
                  <span className="label-mono text-[7px] leading-none opacity-50">RISK_TREND</span>
                  <div className="mt-0.5">
                    <RiskSparkline data={riskHistory} mini />
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Center Side: Workspace Name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center min-w-[120px]">
          {isEditing ? (
            <input
              autoFocus
              className="bg-[var(--bg3)] border border-[var(--border2)] text-center text-[12px] font-normal font-sans text-[var(--text)] focus:outline-none px-4 py-0.5 rounded-[var(--radius)]"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 group px-4 py-1 hover:bg-[var(--bg3)] transition-colors rounded-[var(--radius)] border border-transparent hover:border-[var(--border2)]"
            >
              <span className="text-[12px] font-normal font-sans text-[var(--text)] tracking-wide">{workspaceName}</span>
              <Pencil size={11} className="text-[var(--text3)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Right Side: Status Indicators */}
        <div className="flex items-center gap-[14px]">
          {/* Foundry Status */}
          <div className={`flex items-center gap-[6px] px-2 py-1.5 rounded-[1px] border h-[24px] ${
            IS_LIVE ? 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)] shadow-[0_0_8px_var(--success-bg)]' : 'bg-[var(--warn-bg)] border-[var(--warn)] text-[var(--warn)]'
          }`}>
            <Database size={10} className={IS_LIVE ? 'animate-pulse' : ''} />
            <span className="font-mono text-[9px] font-bold tracking-[0.05em] uppercase">
              {IS_LIVE ? 'ONTOLOGY_LIVE' : 'ONTOLOGY_MOCK'}
            </span>
          </div>

          <div className="h-[12px] w-[1px] bg-[var(--border2)]" />

          {/* UTC Clock */}
          <div className="flex flex-col items-end min-w-[130px]">
             <span className="label-mono text-[7px] leading-none opacity-40">TEMPORAL_MARKER</span>
             <span className="font-mono text-[10px] text-[var(--text3)] leading-none mt-0.5 font-medium">{formatUTC(time)}</span>
          </div>

          <div className="h-[12px] w-[1px] bg-[var(--border2)]" />

          {/* Pipeline Status */}
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="label-mono text-[7px] leading-none opacity-40">SIGNAL_STATUS</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${IS_LIVE ? 'bg-[var(--success)] shadow-[0_0_4px_var(--success)] animate-pulse' : 'bg-[var(--warn)]'}`} />
                   <span className="label-mono text-[8px] text-[var(--text2)]">{IS_LIVE ? 'STABLE' : 'DEGRADED'}</span>
                </div>
             </div>
             
             {/* Profile Avatar */}
             <div 
               className="w-[26px] h-[26px] rounded-full bg-[var(--bg4)] border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] font-mono text-[9px] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all relative group"
               data-interactive
             >
               AN
               <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[var(--success)] border-2 border-[var(--bg)] rounded-full" />
             </div>
          </div>
        </div>
      </nav>
      {/* Decorative divider for depth */}
      <div className="h-[1px] bg-gradient-to-r from-[var(--border)] via-[var(--border3)] to-[var(--border)] opacity-30 shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />
    </>
  );
}
