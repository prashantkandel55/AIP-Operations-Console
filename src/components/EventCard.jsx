// src/components/EventCard.jsx
import React from 'react';
import { Tag, Clock, ShieldCheck } from 'lucide-react';
import { SeverityBadge } from './Badge';

export function EventCard({ event, index, className = '' }) {
  const severityColors = {
    critical: 'var(--danger)',
    high: 'var(--warn)',
    medium: 'var(--accent)',
    low: 'var(--success)'
  };

  const accentColor = severityColors[event.severity?.toLowerCase()] || 'var(--text3)';

  return (
    <div 
      className={`bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden hover:bg-[var(--bg4)]/50 transition-all group relative ${className}`}
      data-interactive
    >
      {/* 2px Left Accent Stripe */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[2px]" 
        style={{ backgroundColor: accentColor }}
      />

      <div className="pl-[14px] pr-3 py-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="label-mono text-[var(--accent)] shrink-0 font-medium">[{event.id || 'EVT'}]</span>
            <h4 className="font-sans text-[12px] font-medium text-[var(--text)] truncate">{event.title}</h4>
          </div>
          <SeverityBadge severity={event.severity} />
        </div>

        {/* Content Area */}
        <p className="text-secondary mb-3 line-clamp-2 leading-[1.6]">
          {event.detail}
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-2.5">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-[var(--text3)]">
            <Clock size={10} className="shrink-0" />
            <span className="label-mono text-[8px] whitespace-nowrap">
              {event.timestamp ? new Date(event.timestamp).toISOString().split('T')[1].split('.')[0] + 'Z' : '00:00:00Z'}
            </span>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-1.5 text-[var(--text3)]">
            <ShieldCheck size={10} className="shrink-0" />
            <div className="w-[30px] h-[3px] bg-[var(--bg4)] rounded-full overflow-hidden shrink-0">
               <div className="h-full bg-[var(--accent)]" style={{ width: `${event.confidence || 0}%` }} />
            </div>
            <span className="label-mono text-[8px]">{event.confidence || 0}%</span>
          </div>

          {/* Entities */}
          {event.entities?.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Tag size={10} className="text-[var(--text3)] shrink-0" />
              <div className="flex gap-1 overflow-hidden">
                {event.entities.map((entity, i) => (
                  <span 
                    key={i} 
                    className="label-mono text-[7px] px-1.5 py-0.5 bg-[var(--bg4)] border border-[var(--border2)] rounded-[2px] transition-colors group-hover:border-[var(--accent-dim)]"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
