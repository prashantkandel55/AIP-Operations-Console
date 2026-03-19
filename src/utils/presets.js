export const PRESETS = {
  supplyChain: {
    label: 'Supply chain',
    text: `URGENT - Port Operations Alert
Timestamp: 2026-03-19 06:14 UTC
Location: Shanghai Yangshan Terminal 4

Vessel MV Eastern Promise (IMO 9234871) held at anchorage 72 hours due to combined labor action and weather. Current queue: 340 vessels.

Impact: 18 contracted vessels affected. 312 SKUs delayed minimum 18 days. Q1 commitments at risk. Financial exposure: $4.2M.

Secondary: Tier-2 PCB supplier Foxconn Industrial (Shenzhen) missed two consecutive delivery windows citing component shortages. No formal notification received.

Action requested: Routing alternatives via Busan and Kaohsiung confirmed — 22% cost premium. Awaiting procurement sign-off.`
  },
  serverLogs: {
    label: 'Server logs',
    text: `[2026-03-19T02:14:33Z] ERROR db-primary-01: Connection pool exhausted (max=200, active=200, idle=0)
[2026-03-19T02:14:34Z] WARN  api-gateway-3: Request timeout after 30000ms - endpoint /api/v2/orders
[2026-03-19T02:14:35Z] ERROR db-replica-02: Replication lag 47329ms - replica falling behind
[2026-03-19T02:14:36Z] ERROR api-gateway-1: 503 upstream unavailable - 847 requests queued
[2026-03-19T02:14:40Z] CRITICAL alert-manager: SLO breach - p99 latency 12400ms (threshold: 2000ms)
[2026-03-19T02:15:01Z] ERROR db-primary-01: Deadlock detected on table orders (txn_id: 88291)
[2026-03-19T02:15:03Z] WARN  cache-cluster-2: Eviction rate 94% - memory pressure critical
[2026-03-19T02:15:11Z] ERROR payments-svc: Failed to process 23 transactions - downstream timeout`
  },
  threatIntel: {
    label: 'Threat intel',
    text: `Source: OSINT aggregation + HUMINT (reliability B2)
Classification: SENSITIVE

Actor group tracked as VELVET PHANTOM observed acquiring infrastructure consistent with pre-operational staging. Three shell companies registered in Malta (Feb 2026) share beneficial ownership with known front organization. Financial flows traced through Riga and Istanbul intermediaries — pattern matches 2024 campaign targeting European logistics networks.

Technical indicators: 4 new C2 domains registered via Namecheap 2026-03-14 to 2026-03-17. IP ranges overlap with previous intrusions against freight management systems.

Assessment: 70% probability of targeted phishing campaign against logistics sector within 30 days. EMEA operators should elevate monitoring posture.`
  }
}
