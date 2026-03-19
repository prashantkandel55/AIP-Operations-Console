// src/utils/exportReport.js
export function generateReport(analysis, input, timestamp) {
  const lines = [
    '═══════════════════════════════════════════════════',
    'AIP OPERATIONS CONSOLE — INCIDENT ANALYSIS REPORT',
    '═══════════════════════════════════════════════════',
    `Generated:  ${new Date(timestamp).toISOString()}`,
    `Severity:   ${analysis.severity?.toUpperCase()}`,
    `Category:   ${analysis.category}`,
    `Risk Score: ${analysis.risk_score}/100`,
    '',
    'SUMMARY',
    '───────────────────────────────────────────────────',
    analysis.summary,
    '',
    'STRUCTURED EVENTS',
    '───────────────────────────────────────────────────',
    ...(analysis.structured_events || []).map(e =>
      `[${e.id}] ${e.title}\n  Severity: ${e.severity} | Confidence: ${e.confidence}%\n  ${e.detail}\n  Entities: ${e.entities?.join(', ') || 'none'}\n`
    ),
    '',
    'RECOMMENDED ACTIONS',
    '───────────────────────────────────────────────────',
    ...(analysis.recommended_actions || []).map(a =>
      `${a.priority}. ${a.action}\n   Rationale: ${a.rationale}\n`
    ),
    '',
    'INTELLIGENCE GAPS',
    '───────────────────────────────────────────────────',
    ...(analysis.intelligence_gaps || []).map(g => `• ${g}`),
    '',
    'RAW INPUT',
    '───────────────────────────────────────────────────',
    input,
    '',
    '═══════════════════════════════════════════════════',
    'CLASSIFICATION: SENSITIVE // AIP GENERATED',
    '═══════════════════════════════════════════════════',
  ]
  return lines.join('\n')
}

export function downloadReport(analysis, input) {
  const text = generateReport(analysis, input, Date.now())
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `incident-report-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
