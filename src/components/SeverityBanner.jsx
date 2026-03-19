// src/components/SeverityBanner.jsx
import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export function SeverityBanner({ severity, category, riskScore }) {
  const s = severity?.toLowerCase();
  
  const config = {
    critical: { color: 'var(--danger)', bg: 'var(--danger-bg)', icon: AlertCircle, label: 'CRITICAL INCIDENT' },
    high: { color: 'var(--warn)', bg: 'var(--warn-bg)', icon: AlertTriangle, label: 'HIGH SEVERITY' },
    medium: { color: 'var(--accent)', bg: 'var(--accent-bg)', icon: Info, label: 'ELEVATED RISK' },
    low: { color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle2, label: 'ROUTINE EVENT' },
  };

  const { color, bg, icon: Icon, label } = config[s] || config.medium;

  return (
    <div 
      className="h-[52px] flex items-center justify-between px-4 border-b border-[var(--border)] relative overflow-hidden group"
      style={{ backgroundColor: bg }}
    >
      {/* 2px Left Accent Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ backgroundColor: color }} />
      
      {/* Animated Scanline Overlay */}
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <Icon size={14} style={{ color }} className="animate-pulse" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold tracking-[0.15em]" style={{ color }}>{label}</span>
          <span className="font-sans text-[11px] text-[var(--text2)] uppercase tracking-wider">{category || 'Unclassified'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="flex flex-col items-end">
          <span className="label-mono text-[8px] text-[var(--text3)]">RISK INDEX</span>
          <span className="font-mono text-[16px] font-medium leading-none" style={{ color }}>{riskScore || 0}<span className="text-[10px] text-[var(--text3)] opacity-40">/100</span></span>
        </div>
      </div>
    </div>
  );
}
