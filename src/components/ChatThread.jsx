// src/components/ChatThread.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Send, Loader2, Sparkles, User, BrainCircuit } from 'lucide-react';
import { chatWithGroq } from '../api/groq';

export function ChatThread({ messages, setMessages, currentAnalysis }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !currentAnalysis) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    let fullResponse = '';
    const aiMessageIndex = messages.length + 1;

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const chunk of chatWithGroq([...messages, userMessage], currentAnalysis)) {
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[aiMessageIndex] = { role: 'assistant', content: fullResponse };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[aiMessageIndex] = { role: 'assistant', content: `ERROR_SIGNAL: ${err.message}` };
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg)] border-t border-[var(--border)] overflow-hidden">
      {/* Thread Header */}
      <div className="h-[36px] px-3 bg-[var(--bg3)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
           <Terminal size={12} className="text-[var(--text3)]" />
           <span className="label-mono text-[9px] text-[var(--text3)] uppercase">Contextual Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="label-mono text-[8px] text-[var(--text3)]">LLAMA-3.3-70B</span>
           <div className="w-[1px] h-3 bg-[var(--border)]" />
           <span className="label-mono text-[8px] text-[var(--accent)] font-bold animate-pulse">ACTIVE</span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-3.5 space-y-5"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
            <BrainCircuit size={24} className="mb-3 text-[var(--text3)]" />
            <span className="label-mono text-[9px] text-[var(--text3)] max-w-[180px] leading-relaxed">READY FOR FOLLOW-UP QUESTIONS REGARDING THE CURRENT ANALYSIS STATE.</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 group animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${
              msg.role === 'user' 
              ? 'bg-[var(--accent-bg)] border-[var(--accent-dim)] text-[var(--accent)]' 
              : 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)]'
            }`}>
              {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
            </div>

            <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                 <span className="label-mono text-[8px] text-[var(--text3)]">{msg.role === 'user' ? 'ANALYST_01' : 'AIP_CO-PILOT'}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-[var(--radius2)] font-sans text-[12px] leading-[1.6] ${
                  msg.role === 'user'
                    ? 'bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] rounded-tr-none'
                    : 'bg-[var(--bg2)] border border-[var(--border)] text-[var(--text2)] rounded-tl-none italic'
                }`}
              >
                {msg.content}
                {isTyping && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span className="stream-cursor" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 animate-fade-in">
             <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-[var(--text3)]">
                <Loader2 size={12} className="animate-spin" />
             </div>
             <div className="label-mono text-[8px] text-[var(--text3)] flex items-center">STREAMING DATA…</div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSend} 
        className={`p-1.5 border-t border-[var(--border)] transition-all bg-[var(--bg2)] shrink-0 ${isFocused ? 'bg-[var(--bg3)]' : ''}`}
      >
        <div className={`flex items-center gap-2 border border-transparent transition-all rounded-[1px] p-0.5 ${isFocused ? 'border-[var(--accent-dim)]' : 'border-[var(--border)]'}`}>
          <input
            type="text"
            className="flex-1 bg-transparent px-2.5 py-1.5 font-mono text-[11px] text-[var(--text2)] focus:outline-none placeholder:text-[var(--text3)] placeholder:italic"
            placeholder="Specify query or request action..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={!currentAnalysis || isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || !currentAnalysis}
            className="w-10 h-7 flex items-center justify-center font-mono text-[9px] text-[var(--accent)] hover:bg-[var(--accent-bg)] disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-[1px] border border-transparent hover:border-[var(--accent-dim)] uppercase"
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
}
