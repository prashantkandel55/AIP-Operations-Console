// src/components/RiskGauge.jsx
import React from 'react';

export function RiskGauge({ score }) {
  const clampedScore = Math.min(100, Math.max(0, score || 0));

  // Generate 11 tick marks (0, 10, ..., 100)
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-1">
        <span className="label-mono text-[9px] text-[var(--accent)] font-medium">OBJECT RISK GRADIENT</span>
        <span className="font-mono text-[22px] font-medium leading-none text-[var(--text)]">{clampedScore}</span>
      </div>

      <div className="relative h-[24px] flex flex-col justify-center">
        {/* Track */}
        <div className="h-[4px] w-full bg-[var(--bg4)] rounded-[1px] relative overflow-hidden">
          {/* Fill Segment */}
          <div 
            className="h-full transition-all duration-1000 ease-out animate-expand-width"
            style={{ 
              width: `${clampedScore}%`,
              background: 'linear-gradient(90deg, var(--success) 0%, var(--warn) 50%, var(--danger) 100%)',
              backgroundSize: '100% 100%',
              '--target-width': `${clampedScore}%`
            }}
          />
        </div>

        {/* Tick Marks Overlay */}
        <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
          {ticks.map(t => (
            <div 
              key={t} 
              className={`w-[1px] h-[8px] bg-[var(--border2)] transition-colors ${clampedScore >= t ? 'bg-[var(--text3)] shadow-[0_0_2px_currentColor]' : ''}`} 
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center px-[2px]">
        <span className="label-mono text-[8px]">0 / SAFE</span>
        <span className="label-mono text-[8px] opacity-40">50 / ELEVATED</span>
        <span className="label-mono text-[8px]">100 / CRITICAL</span>
      </div>
    </div>
  );
}
