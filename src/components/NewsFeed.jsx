// src/components/NewsFeed.jsx
import React from 'react';
import { Newspaper, ExternalLink, Globe, Zap, ShieldAlert } from 'lucide-react';

const NEWS_DATA = [
  {
    id: 1,
    title: "Strait of Hormuz Escalation",
    summary: "New reports of maritime security incidents impacting global container trade and energy shipments. Rerouting protocols active.",
    source: "GeoIntel-24",
    severity: "high",
    icon: Globe,
    time: "14m ago"
  },
  {
    id: 2,
    title: "New 10% Global Import Surcharges",
    summary: "US Supreme Court decision triggers immediate alternative trade acts, impacting Transpacific and Asia-North America routes.",
    source: "TradeMonitor",
    severity: "medium",
    icon: ShieldAlert,
    time: "42m ago"
  },
  {
    id: 3,
    title: "Autonomous Supply Chain Surge",
    summary: "Gartner 2026 forecast: 60% of disruptions being resolved by Agentic AI units without human interface.",
    source: "TechLogistics",
    severity: "low",
    icon: Zap,
    time: "1h ago"
  },
  {
    id: 4,
    title: "Hapag-Lloyd ZIM Consolidation",
    summary: "Final phase of carrier rerouting strategy following merger. Capacity shifts expected in Asia-Euro lanes.",
    source: "MaritimeDaily",
    severity: "low",
    icon: Newspaper,
    time: "2h ago"
  }
];

export function NewsFeed({ onSelect }) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg)] border-t border-[var(--border)] overflow-hidden">
      <div className="h-[36px] px-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper size={12} className="text-[var(--accent)]" />
          <span className="font-mono text-[9px] font-medium tracking-[0.12em] text-[var(--text2)] uppercase">GLOBAL_OSINT_FEED</span>
        </div>
        <div className="flex items-center gap-1.5 label-mono text-[7px] opacity-40">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
           <span>LIVE_FEED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {NEWS_DATA.map((news) => (
          <div 
            key={news.id}
            onClick={() => onSelect(`${news.title}: ${news.summary}`)}
            className="p-3 bg-[var(--bg2)] border border-[var(--border2)] rounded-[var(--radius)] hover:border-[var(--accent)] transition-all group cursor-pointer relative overflow-hidden active:scale-[0.98]"
          >
            {/* Severity Accent side */}
            <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${
              news.severity === 'high' ? 'bg-[var(--danger)]' : 
              news.severity === 'medium' ? 'bg-[var(--warn)]' : 'bg-[var(--accent)]'
            }`} />
            
            <div className="flex justify-between items-start mb-1.5">
               <div className="flex items-center gap-2 overflow-hidden">
                  <news.icon size={10} className="text-[var(--text3)]" />
                  <span className="label-mono text-[8px] text-[var(--text3)] whitespace-nowrap overflow-hidden text-ellipsis">{news.source}</span>
               </div>
               <span className="label-mono text-[7px] text-[var(--text3)] italic opacity-60">{news.time}</span>
            </div>

            <h4 className="font-sans text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-1">
              {news.title}
            </h4>
            <p className="text-[10px] text-[var(--text2)] leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
              {news.summary}
            </p>
            
            <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="label-mono text-[7px] text-[var(--accent)] flex items-center gap-1">
                  IMPORT_TO_AIP <ExternalLink size={8} />
               </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer statistics */}
      <div className="h-6 px-2 bg-[var(--bg4)] border-t border-[var(--border2)] flex items-center justify-between shrink-0">
         <span className="label-mono text-[7px] text-[var(--text3)] opacity-40">INCIDENT_DENSITY: 0.12/m</span>
         <span className="label-mono text-[7px] text-[var(--text3)] opacity-40">SOURCES_RESOLVED: 8</span>
      </div>
    </div>
  );
}
