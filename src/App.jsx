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
  const FOUNDRY_HOST = import.meta.env.VITE_FOUNDRY_HOST;
  const FOUNDRY_TOKEN = import.meta.env.VITE_FOUNDRY_TOKEN;
  const FOUNDRY_ONTOLOGY_RID = import.meta.env.VITE_FOUNDRY_ONTOLOGY_RID;

  // Debug: Log environment variables (remove in production)
  console.log('Environment variables:', {
    GROQ_API_KEY: GROQ_API_KEY ? 'SET' : 'MISSING',
    FOUNDRY_HOST: FOUNDRY_HOST || 'MISSING',
    FOUNDRY_TOKEN: FOUNDRY_TOKEN ? 'SET' : 'MISSING',
    FOUNDRY_ONTOLOGY_RID: FOUNDRY_ONTOLOGY_RID || 'MISSING',
    ALL_ENV_VARS: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });

  // Test Groq API connection
  const testGroqConnection = async () => {
    if (!GROQ_API_KEY) return false;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Groq connection test failed:', error);
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setStreamingText('');
    setCurrentAnalysis(null);
    setParseError(null);
    setChatMessages([]);

    // If no API key, show mock analysis
    if (!GROQ_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      const mockAnalysis = {
        summary: "Mock analysis: No Groq API key configured. This is a demo response showing the expected output format.",
        severity: "medium",
        category: "Other",
        confidence_score: 85,
        structured_events: [
          {
            id: "EVT-001",
            title: "Configuration Issue Detected",
            detail: "Environment variables not properly configured in deployment",
            severity: "high",
            timestamp: new Date().toISOString(),
            entities: ["Netlify", "Environment Variables"],
            confidence: 95
          }
        ],
        connections: [],
        recommended_actions: [
          { priority: 1, action: "Configure Netlify environment variables", rationale: "Required for AI analysis functionality" }
        ],
        risk_score: 45,
        intelligence_gaps: ["Actual operational data to analyze"]
      };
      
      setCurrentAnalysis(mockAnalysis);
      setRiskHistory(prev => [...prev, { score: mockAnalysis.risk_score, time: Date.now() }]);
      setSessionHistory(prev => [{
        input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
        analysis: mockAnalysis,
        timestamp: new Date()
      }, ...prev].slice(0, 20));
      
      setIsAnalyzing(false);
      return;
    }

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
          {/* Debug Panel - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-4 right-4 z-[60] p-3 bg-black/80 border border-yellow-500 rounded text-xs text-yellow-300 font-mono max-w-xs">
              <div>🔍 DEBUG INFO:</div>
              <div>GROQ: {GROQ_API_KEY ? '✅ SET' : '❌ MISSING'}</div>
              <div>FOUNDRY: {FOUNDRY_HOST ? '✅ SET' : '❌ MISSING'}</div>
              <div>TOKEN: {FOUNDRY_TOKEN ? '✅ SET' : '❌ MISSING'}</div>
              <div>ONTOLOGY: {FOUNDRY_ONTOLOGY_RID ? '✅ SET' : '❌ MISSING'}</div>
              <div className="mt-2 text-xs">Check browser console for details</div>
            </div>
          )}

          {!GROQ_API_KEY && (
            <div className="absolute top-4 left-4 right-4 z-[60] p-4 bg-[var(--warn-bg)] border border-[var(--warn)] rounded-[var(--radius2)] flex items-center justify-between text-[13px] shadow-lg shadow-black/50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-[var(--warn)]" />
                <div className="flex flex-col">
                  <span className="font-medium text-[var(--warn)]">Groq API Key Missing</span>
                  <span className="text-[var(--text2)] text-xs">Analysis features will not work until a valid key is provided in Netlify environment variables.</span>
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
