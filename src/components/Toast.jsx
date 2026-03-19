// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const config = {
    success: { color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle2 },
    error: { color: 'var(--danger)', bg: 'var(--danger-bg)', icon: AlertCircle },
    info: { color: 'var(--accent)', bg: 'var(--accent-bg)', icon: Info },
  };

  const { color, bg, icon: Icon } = config[toast.type] || config.info;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-fade-up">
      <div 
        className="flex flex-col min-w-[320px] bg-[var(--bg2)] border border-[var(--border2)] rounded-[var(--radius)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Icon size={16} style={{ color }} />
          <span className="flex-1 font-sans text-[12px] text-[var(--text)] font-medium">
            {toast.message}
          </span>
          <button 
            onClick={onClose} 
            className="text-[var(--text3)] hover:text-[var(--text2)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-[2px] w-full bg-[var(--bg4)]">
           <div 
             className="h-full animate-shrink-width origin-left" 
             style={{ 
               backgroundColor: color,
               animationDuration: '4s'
             }} 
           />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrink-width {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        .animate-shrink-width {
          animation: shrink-width linear forwards;
        }
      `}} />
    </div>
  );
}
