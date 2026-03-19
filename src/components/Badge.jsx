// src/components/Badge.jsx
import React from 'react';

export function Badge({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-[var(--bg4)] border-[var(--border2)] text-[var(--text2)]',
    accent: 'bg-[var(--accent-bg)] border-[var(--accent-dim)] text-[var(--accent)]',
    success: 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]',
    warn: 'bg-[var(--warn-bg)] border-[var(--warn)] text-[var(--warn)]',
    danger: 'bg-[var(--danger-bg)] border-[var(--danger)] text-[var(--danger)]',
    mono: 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text3)]',
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`label-mono border px-1.5 py-0.5 rounded-[2px] inline-flex items-center gap-1.5 ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity, className = '' }) {
  const s = severity?.toLowerCase();
  
  const config = {
    critical: { variant: 'danger', label: 'CRITICAL' },
    high: { variant: 'warn', label: 'HIGH' },
    medium: { variant: 'accent', label: 'MED' },
    low: { variant: 'success', label: 'LOW' },
  };

  const { variant, label } = config[s] || { variant: 'default', label: s?.toUpperCase() || 'NA' };

  return (
    <Badge variant={variant} className={`text-[8px] font-bold tracking-[0.15em] ${className}`}>
      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'currentColor' }} />
      {label}
    </Badge>
  );
}
