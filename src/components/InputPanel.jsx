// src/components/InputPanel.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, GitCompare, ChevronDown, ChevronRight, Send, Search } from 'lucide-react';
import { PRESETS } from '../utils/presets';
import { loadObjects } from '../api/foundry';
import { SkeletonLoader } from './SkeletonLoader';
import { FoundryObjectCard } from './FoundryObjectCard';
import { NewsFeed } from './NewsFeed';

export function InputPanel({ 
  input, 
  setInput, 
  isAnalyzing, 
  onAnalyze, 
  onCompare,
  selectedObjectType,
  setSelectedObjectType
}) {
  const [showFoundry, setShowFoundry] = useState(false);
  const [foundryObjects, setFoundryObjects] = useState([]);
  const [loadingFoundry, setLoadingFoundry] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (showFoundry && selectedObjectType) {
      fetchObjects();
    }
  }, [selectedObjectType, showFoundry]);

  const fetchObjects = async () => {
    setLoadingFoundry(true);
    try {
      const data = await loadObjects(selectedObjectType);
      setFoundryObjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFoundry(false);
    }
  };

  const charCount = input.length;
  const tokenEstimate = Math.round(charCount / 4);

  const FoundryLogo = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-[var(--accent)]">
      <rect x="0" y="0" width="4" height="4" rx="1" />
      <rect x="6" y="0" width="4" height="4" rx="1" />
      <rect x="0" y="6" width="4" height="4" rx="1" />
      <rect x="6" y="6" width="4" height="4" rx="1" />
    </svg>
  );

  return (
    <div className="w-[280px] h-full flex flex-col bg-[var(--bg2)] border-r border-[var(--border)] relative z-20">
      {/* Panel Header */}
      <div className="h-[36px] px-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <span className="font-mono text-[9px] font-medium tracking-[0.12em] text-[var(--text3)] uppercase">RAW INPUT</span>
        {input && (
          <button
            onClick={() => setInput('')}
            className="font-mono text-[9px] text-[var(--text3)] hover:text-[var(--text2)] transition-colors animate-fade-in uppercase"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Foundry Object Loader */}
        <div className="border-b border-[var(--border)] shrink-0">
          <button
            onClick={() => setShowFoundry(!showFoundry)}
            className="w-full h-[36px] px-3 flex items-center justify-between hover:bg-[var(--bg3)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FoundryLogo />
              <span className="font-mono text-[9px] text-[var(--text2)] tracking-wider">FOUNDRY OBJECTS</span>
            </div>
            <div className="flex items-center gap-2">
              {foundryObjects.length > 0 && (
                <span className="bg-[var(--bg4)] px-1.5 py-0.5 rounded-[2px] border border-[var(--border2)] font-mono text-[8px] text-[var(--text3)]">
                  {foundryObjects.length}
                </span>
              )}
              {showFoundry ? <ChevronDown size={12} className="text-[var(--text3)]" /> : <ChevronRight size={12} className="text-[var(--text3)]" />}
            </div>
          </button>

          {showFoundry && (
            <div className="p-3 bg-[var(--bg)] border-t border-[var(--border)] space-y-3 animate-fade-in">
              <div className="relative">
                <select
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] px-2 py-1.5 text-[10px] font-mono text-[var(--text2)] appearance-none focus:outline-none focus:border-[var(--accent-dim)]"
                  value={selectedObjectType}
                  onChange={(e) => setSelectedObjectType(e.target.value)}
                >
                  <option value="SupplyChainIncident">SupplyChainIncident</option>
                  <option value="ServerAlert">ServerAlert</option>
                  <option value="ThreatIntelReport">ThreatIntelReport</option>
                  <option value="LogCluster">LogCluster</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text3)]" />
              </div>

              <button
                onClick={fetchObjects}
                disabled={loadingFoundry}
                className="w-full btn-outline flex items-center justify-center gap-2 font-mono text-[9px] hover:bg-[var(--accent-bg)] transition-all"
                style={{ height: '28px' }}
              >
                {loadingFoundry ? <Loader2 size={12} className="animate-spin" /> : 'LOAD OBJECTS'}
              </button>

              <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-hide">
                {loadingFoundry ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 skeleton" />
                    ))}
                  </div>
                ) : (
                  foundryObjects.map((obj, i) => (
                    <div
                      key={obj.__primaryKey || i}
                      onClick={() => setInput(obj.description || obj.content || obj.text || obj.note || JSON.stringify(obj))}
                      className="bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius)] p-2 hover:border-[var(--border2)] cursor-pointer group stagger-1 transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-[var(--accent)]">{obj.__primaryKey?.slice(0, 8) || 'OBJ-ID'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          obj.severity === 'critical' ? 'bg-[var(--danger)]' : 
                          obj.severity === 'high' ? 'bg-[var(--warn)]' : 
                          'bg-[var(--success)]'
                        }`} />
                      </div>
                      <div className="text-[11px] text-[var(--text)] font-sans truncate mb-1">
                        {obj.title || obj.name || obj.label || 'Untitled Object'}
                      </div>
                      <div className="font-mono text-[8px] text-[var(--text3)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Use as input →
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Textarea Area */}
        <div className={`flex-1 relative transition-all duration-200 border-l-2 ${isFocused ? 'border-l-[var(--accent)]' : 'border-l-transparent'}`}>
          <textarea
            className="w-full h-full bg-[var(--bg)] p-3 text-[11px] font-mono text-[var(--text2)] leading-[1.7] resize-none focus:outline-none placeholder:text-[var(--text3)] placeholder:italic"
            placeholder="Paste raw data to analyze..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="absolute bottom-2 right-3 font-mono text-[9px] text-[var(--text3)] pointer-events-none">
            {charCount} chars · ~{tokenEstimate} tokens
          </div>
        </div>
      </div>

      {/* News Feed - Real-time global incidents */}
      <div className="h-[260px] flex flex-col shrink-0">
         <NewsFeed onSelect={(text) => setInput(text)} />
      </div>

      {/* Analyze Button (Sticky at bottom) */}
      <div className="shrink-0 bg-[var(--bg2)] border-t border-[var(--border)] p-1.5 space-y-1.5">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className={`w-full btn btn-accent relative overflow-hidden flex items-center justify-center gap-2 ${isAnalyzing ? 'btn-analyzing cursor-wait' : ''}`}
            style={{ borderRadius: 0 }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>ANALYZING…</span>
              </>
            ) : (
              <>
                <span>ANALYZE INCIDENT</span>
              </>
            )}
          </button>
          
          <button
            onClick={onCompare}
            disabled={isAnalyzing || !input.trim()}
            className="w-full h-[32px] border border-[var(--accent-dim)] bg-[var(--accent-bg)] text-[var(--accent)] flex items-center justify-center gap-2 font-mono text-[9px] tracking-widest hover:brightness-110 active:opacity-80 transition-all uppercase"
            style={{ borderRadius: 0 }}
          >
            <GitCompare size={12} />
            <span>Compare Analyses →</span>
          </button>
      </div>
    </div>
  );
}
