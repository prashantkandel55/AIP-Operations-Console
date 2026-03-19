// src/components/AnalysisPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Terminal, AlertCircle, Save, Download, ChevronRight, GitCompare, X, Eye, Layers, History, Brain, Info, Database, ScrollText, CheckCircle2 } from 'lucide-react';
import { SeverityBanner } from './SeverityBanner';
import { RiskGauge } from './RiskGauge';
import { EventCard } from './EventCard';
import { Badge } from './Badge';
import EntityGraph from './EntityGraph';
import TimelineView from './TimelineView';
import { downloadReport } from '../utils/exportReport';

// Heatmap word component for AI Confidence / Divergence
const HeatmapText = ({ text, confidenceMap, comparisonText }) => {
  if (!text) return null;
  const words = text.split(' ');
  const compWords = comparisonText ? comparisonText.toLowerCase().split(' ') : [];
  
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-1 leading-[1.8]">
      {words.map((word, i) => {
        const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isDivergent = comparisonText && !compWords.includes(wordLower) && wordLower.length > 3;
        const conf = confidenceMap ? (confidenceMap[wordLower] || 0.3) : 0.5;
        
        return (
          <span 
            key={i} 
            className={`px-0.5 rounded-[1px] transition-all hover:scale-105 cursor-help ${isDivergent ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: isDivergent ? 'rgba(232, 160, 32, 0.25)' : `rgba(26,143,255, ${conf * 0.4})`,
              borderBottom: `1px solid ${isDivergent ? 'var(--warn)' : `rgba(26,143,255, ${conf})`}`
            }}
            title={isDivergent ? 'Persona Divergence Detected' : `Confidence: ${(conf * 100).toFixed(0)}%`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Operational Log Feed Component
const OperationLog = ({ logs }) => {
  const scrollRef = useRef();
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="h-[120px] bg-black/40 border-t border-[var(--border2)] flex flex-col shrink-0">
      <div className="h-7 px-3 flex items-center justify-between bg-[var(--bg4)] border-b border-[var(--border2)]">
        <div className="flex items-center gap-2">
          <Terminal size={10} className="text-[var(--accent)]" />
          <span className="label-mono text-[8px] tracking-[0.2em] opacity-60">SYSTEM_OPERATIONAL_LOG</span>
        </div>
        <div className="flex items-center gap-3">
           <span className="label-mono text-[7px] text-[var(--success)] animate-pulse">STREAMING_ACTIVE</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-[9px] space-y-1 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-[var(--text3)] shrink-0">[{log.time}]</span>
            <span className={log.type === 'error' ? 'text-[var(--danger)]' : log.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--accent)]'}>
              {log.msg}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-[var(--text3)] opacity-30 italic">No operational signals detected...</div>}
      </div>
    </div>
  );
};

export function AnalysisPanel({
  currentAnalysis,
  comparisonAnalysis,
  streamingText,
  comparisonStreamText,
  isAnalyzing,
  isComparing,
  parseError,
  onRetry,
  onSaveToFoundry,
  isSavingToFoundry,
  onExitCompare,
  input,
  sessionHistory = [],
  riskHistory = []
}) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFoundryPreview, setShowFoundryPreview] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Editable fields for Foundry commit
  const [editedSeverity, setEditedSeverity] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  
  const timerRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }].slice(-50));
  };

  useEffect(() => {
    if (isAnalyzing) {
      addLog('Initializing AIP Analysis Pipeline...', 'info');
      addLog(`Selected Model: LLAMA-3.3-70B`, 'success');
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (currentAnalysis) addLog('Analysis Vector Structured successfully.', 'success');
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isAnalyzing]);

  useEffect(() => {
    if (currentAnalysis) {
      setEditedSeverity(currentAnalysis.severity);
      setEditedSummary(currentAnalysis.summary);
    }
  }, [currentAnalysis]);

  const isEmpty = !currentAnalysis && !streamingText && !isAnalyzing && !parseError;

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--bg)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="mb-6 w-16 h-16 border-2 border-dashed border-[var(--border2)] rounded-full flex items-center justify-center animate-pulse">
            <Brain size={32} className="text-[var(--text3)]" />
          </div>
          <h3 className="label-mono text-[var(--accent)] mb-2">INTELLIGENCE_LAYER_DISCONNECTED</h3>
          <p className="text-secondary max-w-[280px]">
            Upload operational telemetry or select a Foundry Object to initialize the AIP Analysis Pipeline.
          </p>
        </div>
        <OperationLog logs={logs} />
      </div>
    );
  }

  const renderAnalysisContent = (analysis, stream, isPersonaB = false) => {
    if (!analysis && stream) {
      return (
        <div className="p-4 flex-1 flex flex-col overflow-hidden animate-fade-in">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                <span className="label-mono text-[var(--text2)]">SIGNAL_PROCESSING</span>
                <span className="label-mono text-[var(--text3)] text-[8px]">· VECTOR_TRIAGE</span>
             </div>
             <span className="label-mono text-[var(--text3)]">{elapsedTime.toFixed(1)}S_ELAPSED</span>
          </div>
          <div className="flex-1 bg-[var(--bg2)] border border-[var(--border2)] rounded-[var(--radius)] p-4 font-mono text-[10px] text-[var(--text2)] leading-[1.8] overflow-y-auto relative border-l-2 border-l-[var(--accent)]">
             <div className="absolute inset-0 scanline opacity-30" />
             {stream}
             <span className="stream-cursor" />
          </div>
        </div>
      );
    }

    if (!analysis) return null;

    return (
      <div className="animate-fade-in pb-10">
        <SeverityBanner 
          severity={analysis.severity} 
          category={analysis.category} 
          riskScore={analysis.risk_score} 
        />

        <div className="p-5 space-y-8">
          <section className="relative">
            <div className="section-hdr flex items-center justify-between">
               <span>EXECUTIVE SUMMARY</span>
               <div className="flex items-center gap-3">
                  {isComparing && (
                    <div className="flex items-center gap-1.5 text-[7px] text-[var(--warn)]">
                      <GitCompare size={8} /> <span className="label-mono tracking-tighter">DIVERGENCE_HILITE</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[7px] text-[var(--accent)]">
                    <Eye size={8} /> <span className="label-mono tracking-tighter">HEATMAP_ACTIVE</span>
                  </div>
               </div>
            </div>
            <div className="bg-[var(--bg3)]/30 p-4 border border-[var(--border)] rounded-[var(--radius)]">
               <HeatmapText 
                  text={analysis.summary} 
                  comparisonText={isComparing ? (isPersonaB ? currentAnalysis?.summary : comparisonAnalysis?.summary) : null} 
               />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section>
                <div className="section-hdr">RISK_GRADIENT</div>
                <RiskGauge score={analysis.risk_score} />
             </section>
             <section>
                <div className="section-hdr">OBJECT_VECTOR_STATUS</div>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-2 bg-[var(--bg4)] border border-[var(--border2)] rounded-[var(--radius)]">
                      <span className="label-mono text-[8px]">CONFIDENCE_INDEX</span>
                      <span className="label-mono font-bold text-[var(--success)]">{(analysis.confidence_score || 88)}%</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-[var(--bg4)] border border-[var(--border2)] rounded-[var(--radius)]">
                      <span className="label-mono text-[8px]">TRIAGE_SPEED</span>
                      <span className="label-mono font-bold text-[var(--accent)]">{elapsedTime.toFixed(1)}S</span>
                   </div>
                </div>
             </section>
          </div>

          {!isComparing && (
            <>
              <section>
                <div className="section-hdr flex justify-between items-center text-[var(--text3)]">
                  <span>STRUCTURED_EVENTS</span>
                  <span className="label-mono text-[var(--text2)]">COUNT_{analysis.structured_events?.length || 0}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {analysis.structured_events?.map((evt, i) => (
                    <EventCard key={evt.id || i} event={evt} index={i} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>
              </section>

              <section>
                <div className="section-hdr">ACTIONABLE_INTELLIGENCE</div>
                <div className="space-y-3">
                  {analysis.recommended_actions?.map((action, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg3)] transition-all group relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${i === 0 ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`} />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <h5 className="font-sans font-medium text-[13px] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{action.action}</h5>
                        <p className="text-secondary leading-relaxed">{action.rationale}</p>
                      </div>
                      <ChevronRight size={14} className="text-[var(--text3)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex items-center gap-3 pt-6">
                   <button
                      onClick={() => {
                        setShowFoundryPreview(true);
                        addLog('Initiating Ontology Commit Preview...', 'info');
                      }}
                      disabled={isSavingToFoundry}
                      className="flex-1 h-9 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-mono text-[10px] tracking-[0.15em] uppercase rounded-[2px] transition-all flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(26,143,255,0.3)]"
                   >
                      <Save size={14} /> Commit to Foundry Ontology
                   </button>
                   
                   <button
                      onClick={() => {
                        downloadReport(analysis, input);
                        addLog('Exporting signal report to PDF.', 'info');
                      }}
                      className="px-6 h-9 bg-[var(--bg4)] border border-[var(--border3)] hover:bg-[var(--border3)]/20 text-[var(--text)] font-mono text-[10px] tracking-[0.15em] uppercase rounded-[1px] transition-all flex items-center justify-center gap-2"
                   >
                      <Download size={14} /> EXPORT_SIGNAL
                   </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] h-full relative overflow-hidden">
      {/* Tab Row */}
      {!isComparing ? (
        <div className="flex items-center justify-between border-b border-[var(--border2)] bg-[var(--bg2)] px-4 shrink-0 z-20">
          <div className="flex items-end h-[44px] gap-1">
            {[
              { id: 'analysis', label: 'ANALYST_VIEW', icon: Brain },
              { id: 'graph', label: 'ENTITY_GRAPH', icon: Layers },
              { id: 'timeline', label: 'TEMPORAL_SEQ', icon: History },
              { id: 'historical', label: 'HISTORIC_SYNC', icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-[44px] px-4 flex items-center gap-2 relative transition-all group label-mono ${
                  activeTab === tab.id ? 'text-[var(--accent)]' : 'text-[var(--text3)] hover:text-[var(--text2)]'
                }`}
              >
                <tab.icon size={11} className={activeTab === tab.id ? 'text-[var(--accent)]' : 'opacity-40'} />
                <span className="text-[9px] tracking-[0.15em] font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[var(--accent)] shadow-[0_-2px_8px_rgba(26,143,255,0.5)] z-10" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 label-mono text-[8px] opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                <span>AIP_READY</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="h-[44px] border-b border-[var(--border)] bg-[var(--bg2)] flex items-center justify-between px-4 shrink-0 z-20 animate-fade-in shadow-xl">
           <div className="flex items-center gap-3">
              <GitCompare size={14} className="text-[var(--accent)]" />
              <span className="label-mono text-[var(--accent)] font-bold tracking-[0.2em] animate-pulse">VECTOR_COMPARISON_ACTIVE</span>
           </div>
           <button onClick={onExitCompare} className="flex items-center gap-2 label-mono text-[var(--text3)] hover:text-[var(--warn)] transition-colors bg-[var(--bg3)] border border-[var(--border)] px-4 py-1.5 rounded-[1px]">
              <X size={12} />
              <span>TERMINATE_SESSION</span>
           </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative flex flex-col">
        {isComparing ? (
          <div className="flex-1 flex overflow-hidden divide-x divide-[var(--border2)] animate-fade-up">
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
              <div className="h-10 px-4 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-10">
                <span className="label-mono text-[var(--accent)] font-medium">CONSERVATIVE_TRIAGE_A</span>
                <span className="label-mono text-[8px] opacity-50">SCORE_BASE_{currentAnalysis?.risk_score || 0}</span>
              </div>
              {renderAnalysisContent(currentAnalysis, streamingText)}
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative">
              <div className="h-10 px-4 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-10">
                <span className="label-mono text-[var(--warn)] font-medium">PRAGMATIC_STRATEGY_B</span>
                {currentAnalysis && comparisonAnalysis && (
                   <div className="flex items-center gap-3">
                      <span className={`label-mono font-bold px-2 py-0.5 rounded-[1px] ${comparisonAnalysis.risk_score < currentAnalysis.risk_score ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'}`}>
                        Δ{Math.abs(currentAnalysis.risk_score - comparisonAnalysis.risk_score)}
                      </span>
                   </div>
                )}
              </div>
              {renderAnalysisContent(comparisonAnalysis, comparisonStreamText, true)}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'analysis' && renderAnalysisContent(currentAnalysis, streamingText)}
            
            {activeTab === 'graph' && (
              <div className="flex-1 animate-fade-in h-min min-h-full bg-[var(--bg)]">
                {currentAnalysis ? <EntityGraph analysis={currentAnalysis} /> : (
                  <div className="h-full flex items-center justify-center label-mono opacity-30 tracking-[0.2em]">STRUCTURED_VECTOR_MAP_MISSING</div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="flex-1 animate-fade-in h-min min-h-full bg-[var(--bg)]">
                {currentAnalysis ? <TimelineView analysis={currentAnalysis} riskHistory={riskHistory} /> : (
                  <div className="h-full flex items-center justify-center label-mono opacity-30 tracking-[0.2em]">TEMPORAL_SEQ_MISSING</div>
                )}
              </div>
            )}

            {activeTab === 'historical' && (
              <div className="flex-1 p-8 animate-fade-in bg-[var(--bg)] flex flex-col min-h-full">
                 <div className="max-w-4xl mx-auto w-full">
                    <div className="section-hdr mb-8 flex items-center gap-3">
                       <History size={16} /> <span className="tracking-[0.2em]">SESSION_MEMORY_RECALL</span>
                    </div>
                    {sessionHistory.length > 0 ? (
                       <div className="space-y-6">
                          {sessionHistory.map((item, id) => (
                             <div key={id} className="p-4 bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--accent)] transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                      <span className="label-mono text-[9px] text-[var(--text3)]">{new Date(item.timestamp).toISOString().replace('T', ' ').slice(0, 19)}</span>
                                      <div className="w-[1px] h-3 bg-[var(--border)]" />
                                      <span className="label-mono text-[var(--accent)]">RESULT_{id.toString().padStart(2, '0')}</span>
                                   </div>
                                   <Badge variant={item.analysis.severity === 'critical' ? 'danger' : 'accent'}>{item.analysis.severity.toUpperCase()}</Badge>
                                </div>
                                <p className="text-secondary line-clamp-2 leading-relaxed group-hover:text-[var(--text)] transition-colors">{item.analysis.summary}</p>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="h-40 flex items-center justify-center border border-dashed border-[var(--border2)] rounded-[var(--radius)] label-mono opacity-30">SESSION_MEMORY_EMPTY</div>
                    )}
                 </div>
              </div>
            )}
            {!isComparing && activeTab === 'analysis' && <OperationLog logs={logs} />}
          </>
        )}
      </div>
      
      {/* Foundry Action Preview Modal */}
      {showFoundryPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg)]/90 backdrop-blur-md animate-fade-in">
           <div className="w-full max-w-2xl bg-[var(--bg2)] border border-[var(--accent-dim)] rounded-[var(--radius)] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="h-12 px-5 bg-[var(--accent-bg)] border-b border-[var(--accent-dim)] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Database size={16} className="text-[var(--accent)] animate-pulse" />
                    <span className="label-mono text-[var(--accent)] font-bold tracking-[0.2em]">FOUNDRY_COMMIT_OVERRIDE</span>
                 </div>
                 <button onClick={() => setShowFoundryPreview(false)} className="text-[var(--text3)] hover:text-white transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <div className="p-6">
                 <div className="flex items-center gap-4 mb-6 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)]">
                    <Info size={16} className="text-[var(--accent)] shrink-0" />
                    <p className="label-mono text-[8px] leading-relaxed text-[var(--text2)] opacity-80 uppercase">Human-in-the-loop: Revalidate or override specific fields before the vector is committed to the ontology.</p>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-1.5">
                       <label className="label-mono text-[8px] opacity-60">OVERRIDE_SEVERITY</label>
                       <div className="flex gap-2">
                          {['critical', 'high', 'medium', 'low'].map(s => (
                             <button
                                key={s}
                                onClick={() => setEditedSeverity(s)}
                                className={`flex-1 h-7 rounded-[1px] label-mono text-[9px] border transition-all ${
                                   editedSeverity === s ? 'bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--accent)]' : 'bg-transparent border-[var(--border2)] text-[var(--text3)]'
                                }`}
                             >
                                {s.toUpperCase()}
                             </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                       <label className="label-mono text-[8px] opacity-60">ANALYST_REWRITTEN_SUMMARY</label>
                       <textarea 
                          value={editedSummary}
                          onChange={(e) => setEditedSummary(e.target.value)}
                          className="w-full h-24 bg-black/40 border border-[var(--border2)] rounded-[var(--radius)] p-3 font-sans text-[12px] text-[var(--text2)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                       />
                    </div>
                 </div>

                 <div className="bg-black/40 rounded-[2px] p-5 font-mono text-[11px] text-[var(--accent)]/90 border border-[var(--border2)] max-h-[160px] overflow-y-auto custom-scrollbar">
                    <div className="flex gap-2">
                       <span className="text-[var(--text3)]">PREVIEW_PAYLOAD:</span>
                    </div>
                    <pre className="mt-3 text-[var(--text2)] text-[10px]">
{JSON.stringify({
  actionType: "palantir.aip.incident-triage",
  parameters: {
    incident_id: currentAnalysis?.structured_events?.[0]?.id || "INC-999",
    severity: editedSeverity,
    summary: editedSummary,
    risk_index: currentAnalysis?.risk_score,
    timestamp: new Date().toISOString()
  },
  audit: { user: "OPERATIONS_DESK_AN", role: "TriageLead" }
}, null, 2)}
                    </pre>
                 </div>

                 <div className="mt-8 flex gap-3">
                    <button 
                       onClick={() => { 
                         onSaveToFoundry({ ...currentAnalysis, severity: editedSeverity, summary: editedSummary }); 
                         setShowFoundryPreview(false); 
                         addLog('Executing Ontology commit with Analyst Overrides...', 'success');
                       }}
                       className="flex-1 h-10 bg-[var(--accent)] text-white label-mono font-bold tracking-[0.2em] rounded-[1px] hover:bg-[var(--accent)]/90 flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 size={16} /> AUTHORIZE_COMMIT
                    </button>
                    <button 
                       onClick={() => { setShowFoundryPreview(false); addLog('Ontology commit aborted by agent.', 'error'); }}
                       className="px-8 h-10 border border-[var(--border2)] text-[var(--text3)] label-mono hover:text-[var(--text2)] transition-colors"
                    >
                       CANCEL
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {parseError && (
        <div className="p-4 absolute bottom-0 left-0 right-0 z-[60] bg-[var(--bg2)] border-t-2 border-[var(--danger)] animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[var(--danger)]">
              <AlertCircle size={14} />
              <span className="label-mono font-bold tracking-widest text-[10px]">VECTOR_PARSING_FAULT</span>
            </div>
            <button onClick={onRetry} className="bg-[var(--danger)] text-white label-mono px-4 py-1 rounded-[1px] hover:opacity-90 tracking-tighter shadow-[0_0_8px_rgba(224,58,58,0.4)]">REINITIALIZE</button>
          </div>
          <div className="bg-black/50 rounded-[var(--radius)] p-3 border border-[var(--border)] font-mono text-[9px] text-[var(--text3)] max-h-[100px] overflow-y-auto">
             {parseError.raw}
          </div>
        </div>
      )}
    </div>
  );
}

