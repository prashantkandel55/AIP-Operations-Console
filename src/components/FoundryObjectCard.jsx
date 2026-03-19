// src/components/FoundryObjectCard.jsx
import React from 'react';
import { SeverityBadge } from './Badge';

export function FoundryObjectCard({ obj, objectType, onUse }) {
  const serializeFoundryObject = (o, type) => {
    const lines = [`Foundry Object: ${type}`, `ID: ${o.__primaryKey}`]
    Object.entries(o).forEach(([k, v]) => {
      if (k !== '__primaryKey') lines.push(`${k}: ${v}`)
    })
    return lines.join('\n')
  }

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius)] p-3 space-y-2 group hover:border-[var(--border2)] transition-colors">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[9px] text-[var(--text3)] uppercase">{obj.__primaryKey}</span>
        {obj.severity && <SeverityBadge severity={obj.severity} />}
      </div>
      <h4 className="text-[11px] leading-tight font-medium text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
        {obj.title || obj.id || obj.__primaryKey}
      </h4>
      <div className="flex justify-between items-center pt-1">
        <span className="font-mono text-[8px] text-[var(--text3)]">
          {obj.detectedAt ? new Date(obj.detectedAt).toLocaleDateString() : 'Active'}
        </span>
        <button
          onClick={() => onUse(serializeFoundryObject(obj, objectType))}
          className="text-[9px] font-mono text-[var(--accent)] hover:underline uppercase"
        >
          Use as input
        </button>
      </div>
    </div>
  );
}
