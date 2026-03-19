// src/components/OntologyBrowser.jsx
import React, { useState } from 'react'

const ONTOLOGY_SCHEMA = {
  SupplyChainIncident: {
    icon: '📦',
    primaryKey: 'incidentId',
    properties: {
      incidentId: { type: 'string' },
      title: { type: 'string' },
      severity: { type: 'string', enum: ['critical','high','medium','low'] },
      region: { type: 'string' },
      supplier: { type: 'string' },
      impactValue: { type: 'double' },
      detectedAt: { type: 'timestamp' },
      status: { type: 'string' },
    },
    links: ['ThreatIntelReport']
  },
  ServerAlert: {
    icon: '🖥',
    primaryKey: 'alertId',
    properties: {
      alertId: { type: 'string' },
      title: { type: 'string' },
      severity: { type: 'string' },
      service: { type: 'string' },
      sloBreached: { type: 'boolean' },
      detectedAt: { type: 'timestamp' },
    },
    links: ['LogCluster']
  },
  ThreatIntelReport: {
    icon: '🎯',
    primaryKey: 'reportId',
    properties: {
      reportId: { type: 'string' },
      title: { type: 'string' },
      actor: { type: 'string' },
      region: { type: 'string' },
      confidence: { type: 'integer' },
      detectedAt: { type: 'timestamp' },
    },
    links: ['SupplyChainIncident']
  },
  LogCluster: {
    icon: '📋',
    primaryKey: 'clusterId',
    properties: {
      clusterId: { type: 'string' },
      title: { type: 'string' },
      service: { type: 'string' },
      errorCount: { type: 'integer' },
      detectedAt: { type: 'timestamp' },
    },
    links: ['ServerAlert']
  }
}

export default function OntologyBrowser({ onSelectType }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="p-3 border-t border-[var(--border)] mt-2">
      <div className="font-mono text-[9px] text-[var(--text3)] uppercase tracking-widest mb-3">
        ONTOLOGY BROWSER
      </div>

      <div className="space-y-1">
        {Object.entries(ONTOLOGY_SCHEMA).map(([type, schema]) => (
          <div key={type} className="group">
            <div
              onClick={() => setExpanded(expanded === type ? null : type)}
              className={`flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-[var(--radius)] transition-colors ${
                expanded === type ? 'bg-[var(--bg4)]' : 'hover:bg-[var(--bg3)]'
              }`}
            >
              <span className="text-[11px] text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
                {schema.icon} {type}
              </span>
              <span className="font-mono text-[8px] text-[var(--text3)]">
                {expanded === type ? '▲' : '▼'}
              </span>
            </div>

            {expanded === type && (
              <div className="ml-3 mt-1.5 mb-3 space-y-1 animate-fade-in">
                {Object.entries(schema.properties).map(([prop, meta]) => (
                  <div key={prop} className="flex justify-between px-2 py-0.5">
                    <span className={`font-mono text-[8px] ${prop === schema.primaryKey ? 'text-[var(--accent)]' : 'text-[var(--text3)]'}`}>
                      {prop === schema.primaryKey ? '🔑 ' : ''}{prop}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--text3)] opacity-40 italic">
                      {meta.type}
                    </span>
                  </div>
                ))}
                
                {schema.links?.length > 0 && (
                  <div className="px-2 py-1.5 mt-2 bg-[var(--bg)]/50 rounded-[var(--radius)] border border-[var(--border2)]/50">
                    <span className="font-mono text-[8px] text-[var(--text3)] opacity-60">LINKS → </span>
                    {schema.links.map(l => (
                      <span 
                        key={l} 
                        className="font-mono text-[8px] text-[var(--accent)] ml-1.5 cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); onSelectType(l); }}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => onSelectType(type)}
                  className="w-full mt-2 py-1.5 bg-[var(--accent-bg)] border border-[var(--accent-dim)] rounded-[var(--radius)] text-[var(--accent)] font-mono text-[9px] uppercase tracking-wider hover:bg-[var(--accent-dim)]/20 transition-all"
                >
                  LOAD OBJECTS →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
