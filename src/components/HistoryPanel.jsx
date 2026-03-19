// src/components/HistoryPanel.jsx
import React from 'react';
import { SeverityBadge } from './Badge';
import { History as HistoryIcon } from 'lucide-react';

export function HistoryPanel({ history, onSelect, currentAnalysis }) {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--bg3)] border border-[var(--border)] flex items-center justify-center mb-3">
          <HistoryIcon size={16} className="text-[var(--text3)] opacity-40" />
        </div>
        <span className="label-mono text-[9px] text-[var(--text3)]">NO SESSION DATA</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {history.map((item, i) => {
        const isActive = currentAnalysis && currentAnalysis.summary === item.analysis.summary;
        return (
          <button
            key={i}
            onClick={() => onSelect(item.analysis)}
            className={`w-full group px-3.5 py-3 border-b border-[var(--border)] transition-all hover:bg-[var(--bg3)] active:opacity-80 relative ${isActive ? 'bg-[var(--bg3)]/80' : ''}`}
            data-interactive
          >
            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />
            )}

            <div className="flex items-center justify-between mb-1.5 overflow-hidden">
               <div className="flex items-center gap-2 overflow-hidden">
                  <span className="label-mono text-[9px] text-[var(--text3)] shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="label-mono text-[8px] text-[var(--text3)] opacity-40 truncate">#{item.analysis.summary.length}c</span>
               </div>
               <SeverityBadge severity={item.analysis.severity} />
            </div>

            <p className="font-mono text-[10px] text-[var(--text2)] line-clamp-2 leading-[1.6] group-hover:text-[var(--text)] transition-colors">
              {item.input}
            </p>
          </button>
        );
      })}
    </div>
  );
}
