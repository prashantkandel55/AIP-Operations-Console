// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InputPanel } from './components/InputPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatThread } from './components/ChatThread';
import { Toast } from './components/Toast';
import { analyzeWithGroq, analyzeWithGroqPersona } from './api/groq';
import { saveAnalysisToFoundry } from './api/foundry';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [workspaceName, setWorkspaceName] = useState('Workspace Alpha');
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSavingToFoundry, setIsSavingToFoundry] = useState(false);
  
  // New features state
  const [riskHistory, setRiskHistory] = useState([]);
  const [comparisonAnalysis, setComparisonAnalysis] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonStreamText, setComparisonStreamText] = useState('');
  const [selectedObjectType, setSelectedObjectType] = useState('SupplyChainIncident');

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setStreamingText('');
    setCurrentAnalysis(null);
    setParseError(null);
    setChatMessages([]);

    let fullText = '';
    try {
      if (isComparing) {
        // Run both personas in parallel
        const analyzeA = async () => {
          let text = '';
          for await (const chunk of analyzeWithGroqPersona(input, 'A')) {
            text += chunk;
            setStreamingText(text);
          }
          return JSON.parse(text.replace(/```json|```/g, '').trim());
        };

        const analyzeB = async () => {
          let text = '';
          for await (const chunk of analyzeWithGroqPersona(input, 'B')) {
            text += chunk;
            setComparisonStreamText(text);
          }
          return JSON.parse(text.replace(/```json|```/g, '').trim());
        };

        const [resA, resB] = await Promise.all([analyzeA(), analyzeB()]);
        setCurrentAnalysis(resA);
        setComparisonAnalysis(resB);
        
        setRiskHistory(prev => [...prev, { score: resA.risk_score, time: Date.now() }]);
      } else {
        for await (const chunk of analyzeWithGroq(input)) {
          fullText += chunk;
          setStreamingText(fullText);
        }

        // Strip any accidental markdown fences
        const clean = fullText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        setCurrentAnalysis(parsed);
        setRiskHistory(prev => [...prev, { score: parsed.risk_score, time: Date.now() }]);
        setSessionHistory(prev => [{
          input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
          analysis: parsed,
          timestamp: new Date()
        }, ...prev].slice(0, 20));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setParseError({
        message: err.message || 'Failed to analyze or parse response.',
        raw: fullText || 'No response received from Groq.'
      });
    } finally {
      setIsAnalyzing(false);
      setStreamingText('');
    }
  };

  const handleSaveToFoundry = async () => {
    if (!currentAnalysis || isSavingToFoundry) return;

    setIsSavingToFoundry(true);
    try {
      const result = await saveAnalysisToFoundry(currentAnalysis, input);
      setToast({
        type: 'success',
        message: result.mock ? 'Saved to Foundry (mock mode)' : 'Saved to Foundry ✓'
      });
    } catch (err) {
      console.error('Save error:', err);
      setToast({
        type: 'error',
        message: `Save failed: ${err.message}`
      });
    } finally {
      setIsSavingToFoundry(false);
    }
  };

  const restoreFromHistory = (analysis) => {
    setCurrentAnalysis(analysis);
    setChatMessages([]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg)] font-sans selection:bg-[var(--accent)] selection:text-white">
      <Navbar 
        workspaceName={workspaceName} 
        setWorkspaceName={setWorkspaceName} 
        riskHistory={riskHistory}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Side: Input & Settings (280px) */}
        <InputPanel
          input={input}
          setInput={setInput}
          isAnalyzing={isAnalyzing}
          onAnalyze={() => { setIsComparing(false); handleAnalyze(); }}
          onCompare={() => { setIsComparing(true); handleAnalyze(); }}
          selectedObjectType={selectedObjectType}
          setSelectedObjectType={setSelectedObjectType}
        />

        {/* Center: Structured Analysis Area (flex-1) */}
        <div className="flex-1 flex flex-col bg-[var(--bg)] relative overflow-hidden">
          {!GROQ_API_KEY && (
            <div className="absolute top-4 left-4 right-4 z-[60] p-4 bg-[var(--warn-bg)] border border-[var(--warn)] rounded-[var(--radius2)] flex items-center justify-between text-[13px] shadow-lg shadow-black/50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-[var(--warn)]" />
                <div className="flex flex-col">
                  <span className="font-medium text-[var(--warn)]">Groq API Key Missing</span>
                  <span className="text-[var(--text2)] text-xs">Analysis features will not work until a valid key is provided in .env.local.</span>
                </div>
              </div>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline border-[var(--warn)]/40 hover:bg-[var(--warn-bg)] text-[var(--warn)] font-mono text-[10px]"
              >
                Get Key
              </a>
            </div>
          )}

          <AnalysisPanel
            currentAnalysis={currentAnalysis}
            comparisonAnalysis={comparisonAnalysis}
            streamingText={streamingText}
            comparisonStreamText={comparisonStreamText}
            isAnalyzing={isAnalyzing}
            isComparing={isComparing}
            parseError={parseError}
            onRetry={handleAnalyze}
            onSaveToFoundry={handleSaveToFoundry}
            isSavingToFoundry={isSavingToFoundry}
            input={input}
            sessionHistory={sessionHistory}
            riskHistory={riskHistory}
            onExitCompare={() => setIsComparing(false)}
          />
        </div>

        {/* Right Side: History & Chat (320px) */}
        <div className="w-[320px] h-full flex flex-col border-l border-[var(--border)] bg-[var(--bg2)] shrink-0 z-20">
          <div className="flex flex-col h-[40%] border-b border-[var(--border)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
              <span className="label-mono uppercase">This session</span>
              <RefreshCw size={12} className="text-[var(--text3)]" />
            </div>
            <HistoryPanel
              history={sessionHistory}
              onSelect={restoreFromHistory}
              currentAnalysis={currentAnalysis}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <ChatThread
              messages={chatMessages}
              setMessages={setChatMessages}
              currentAnalysis={currentAnalysis}
            />
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
