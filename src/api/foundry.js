// src/api/foundry.js
// Palantir Foundry REST API client
// Spec: https://www.palantir.com/docs/foundry/api/
// Uses OAuth2 Bearer token auth

const FOUNDRY_HOST = import.meta.env.VITE_FOUNDRY_HOST
const FOUNDRY_TOKEN = import.meta.env.VITE_FOUNDRY_TOKEN
const ONTOLOGY_RID = import.meta.env.VITE_FOUNDRY_ONTOLOGY_RID
const IS_LIVE = !!(FOUNDRY_HOST && FOUNDRY_TOKEN && ONTOLOGY_RID)

// ── Foundry REST helpers ──────────────────────────────────────────────────────

async function foundryFetch(path, options = {}) {
  const res = await fetch(`${FOUNDRY_HOST}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${FOUNDRY_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`Foundry API error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ── Object loading ────────────────────────────────────────────────────────────

// GET /api/v2/ontologies/{ontologyRid}/objects/{objectType}
export async function loadObjects(objectType, pageSize = 5) {
  if (!IS_LIVE) return getMockObjects(objectType)

  const data = await foundryFetch(
    `/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}?pageSize=${pageSize}`
  )
  return data.data // array of Foundry objects
}

// GET /api/v2/ontologies/{ontologyRid}/objects/{objectType}/{primaryKey}
export async function getObject(objectType, primaryKey) {
  if (!IS_LIVE) return getMockObjects(objectType)[0]
  return foundryFetch(
    `/api/v2/ontologies/${ONTOLOGY_RID}/objects/${objectType}/${primaryKey}`
  )
}

// ── Actions ───────────────────────────────────────────────────────────────────

// POST /api/v2/ontologies/{ontologyRid}/actions/{actionType}/apply
export async function applyAction(actionType, parameters) {
  if (!IS_LIVE) {
    // Mock: simulate network delay and return success
    await new Promise(r => setTimeout(r, 800))
    return { success: true, mock: true }
  }

  return foundryFetch(
    `/api/v2/ontologies/${ONTOLOGY_RID}/actions/${actionType}/apply`,
    { method: 'POST', body: JSON.stringify({ parameters }) }
  )
}

// Save analysis result as a Foundry object via Action
export async function saveAnalysisToFoundry(analysis, rawInput) {
  return applyAction('createIncidentAnalysis', {
    summary: analysis.summary,
    severity: analysis.severity,
    riskScore: analysis.risk_score,
    rawInput: rawInput.slice(0, 2000),
    structuredJson: JSON.stringify(analysis),
    analystId: 'AN-001',
    createdAt: new Date().toISOString(),
  })
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export { IS_LIVE }

function getMockObjects(objectType) {
  const mocks = {
    SupplyChainIncident: [
      { __primaryKey: 'SCI-2041', title: 'Port congestion — Shanghai Yangshan', severity: 'critical', region: 'APAC', supplier: 'Cosco Shipping', impactValue: 4200000, detectedAt: '2026-03-17T06:14:00Z' },
      { __primaryKey: 'SCI-2038', title: 'Semiconductor fab yield drop — TSMC N3', severity: 'critical', region: 'APAC', supplier: 'TSMC', impactValue: 8900000, detectedAt: '2026-03-14T09:00:00Z' },
      { __primaryKey: 'SCI-2035', title: 'Lithium carbonate shortage — SQM Chile', severity: 'high', region: 'LATAM', supplier: 'SQM', impactValue: 2100000, detectedAt: '2026-03-11T14:22:00Z' },
    ],
    ServerAlert: [
      { __primaryKey: 'ALT-8821', title: 'DB connection pool exhausted — prod-primary', severity: 'critical', service: 'db-primary-01', sloBreached: true, detectedAt: '2026-03-19T02:14:33Z' },
      { __primaryKey: 'ALT-8819', title: 'Replication lag > 45s — db-replica-02', severity: 'high', service: 'db-replica-02', sloBreached: false, detectedAt: '2026-03-19T02:14:35Z' },
      { __primaryKey: 'ALT-8817', title: 'Cache eviction rate 94% — cache-cluster-2', severity: 'high', service: 'cache-cluster-2', sloBreached: false, detectedAt: '2026-03-19T02:15:03Z' },
    ],
    ThreatIntelReport: [
      { __primaryKey: 'TIR-0441', title: 'VELVET PHANTOM — pre-op staging detected', severity: 'high', actor: 'VELVET PHANTOM', region: 'EMEA', confidence: 70, detectedAt: '2026-03-19T00:00:00Z' },
      { __primaryKey: 'TIR-0438', title: 'Phishing campaign — logistics sector', severity: 'medium', actor: 'UNKNOWN', region: 'EMEA', confidence: 55, detectedAt: '2026-03-17T00:00:00Z' },
    ],
    LogCluster: [
      { __primaryKey: 'LC-3301', title: 'API gateway 503 cluster — 847 requests', severity: 'critical', service: 'api-gateway', errorCount: 847, detectedAt: '2026-03-19T02:14:36Z' },
      { __primaryKey: 'LC-3298', title: 'Payment service timeout cluster', severity: 'high', service: 'payments-svc', errorCount: 23, detectedAt: '2026-03-19T02:15:11Z' },
    ],
  }
  return mocks[objectType] || []
}
