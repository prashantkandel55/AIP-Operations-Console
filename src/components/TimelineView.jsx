// src/components/TimelineView.jsx
import React, { useMemo } from 'react';
import { Clock, Tag, TrendingUp } from 'lucide-react';
import { SeverityBadge } from './Badge';
import RiskSparkline from './RiskSparkline';

export default function TimelineView({ analysis, riskHistory = [] }) {
  const events = useMemo(() => {
    if (!analysis?.structured_events) return [];
    return [...analysis.structured_events]
      .map((e, i) => ({ ...e, _index: i }))
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) return new Date(a.timestamp) - new Date(b.timestamp);
        return a._index - b._index;
      });
  }, [analysis]);

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
        <Clock size={32} className="mb-4 text-[var(--text3)]" />
        <span className="label-mono text-[10px] tracking-[0.2em]">TEMPORAL_SEQ_EMPTY</span>
      </div>
    );
  }

  const severityColors = {
    critical: 'var(--danger)',
    high: 'var(--warn)',
    medium: 'var(--accent)',
    low: 'var(--success)'
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6 bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
        <div className="section-hdr flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-[var(--accent)]" />
              <span>TEMPORAL_RISK_DISTRIBUTION</span>
           </div>
           <span className="label-mono text-[8px] opacity-40">AUTO_SCALE_AXIS_TRUE</span>
        </div>
        <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-4 flex justify-center">
           <RiskSparkline data={riskHistory} />
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Central Vertical Line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-[var(--border)]" />

        <div className="space-y-8">
          {events.map((evt, i) => {
            const color = severityColors[evt.severity?.toLowerCase()] || 'var(--text3)';
            
            return (
              <div 
                key={evt.id || i} 
                className={`relative pl-10 animate-fade-in stagger-${(i % 5) + 1}`}
              >
                {/* Timeline Node */}
                <div 
                  className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 bg-[var(--bg)] z-10 flex items-center justify-center transition-all hover:scale-125"
                  style={{ borderColor: color, boxShadow: `0 0 8px ${color}44` }}
                >
                   <div className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: color }} />
                </div>

                {/* Event Metadata */}
                <div className="flex items-center gap-3 mb-2">
                   <span className="label-mono text-[10px] text-[var(--text)] font-bold">
                     {evt.timestamp ? new Date(evt.timestamp).toISOString().split('T')[1].split('.')[0] + 'Z' : '00:00:00Z'}
                   </span>
                   <div className="w-[1px] h-3 bg-[var(--border2)]" />
                   <span className="label-mono text-[9px] text-[var(--accent)]">[{evt.id || 'EVT'}]</span>
                   <SeverityBadge severity={evt.severity} />
                </div>

                {/* Event Card */}
                <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-4 transition-all hover:border-[var(--border3)] group relative overflow-hidden">
                   {/* 2px accent stripe */}
                   <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: color }} />
                   
                   <h4 className="font-sans text-[13px] font-medium text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                     {evt.title}
                   </h4>
                   <p className="text-secondary leading-[1.6]">
                     {evt.detail}
                   </p>

                   {evt.entities?.length > 0 && (
                     <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                        <Tag size={10} className="text-[var(--text3)]" />
                        <div className="flex flex-wrap gap-1.5">
                           {evt.entities.map((ent, idx) => (
                             <span key={idx} className="label-mono text-[7px] px-1 bg-[var(--bg3)] border border-[var(--border2)] rounded-[1px]">
                               {ent}
                             </span>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
