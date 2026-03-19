// src/api/groq.js
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_BASE = 'https://api.groq.com/openai/v1'

// Main analysis — returns async generator of text chunks
export async function* analyzeWithGroq(rawInput) {
  const systemPrompt = `You are an operational intelligence analyst AI embedded in Palantir's AIP platform. You receive raw operational data — logs, reports, threat intel, supply chain alerts, or any unstructured text — and return a structured JSON analysis.

Always respond with ONLY valid JSON matching this exact schema. No markdown fences, no explanation, no text outside the JSON:

{
  "summary": "Detailed technical summary using high-fidelity operational language",
  "severity": "critical|high|medium|low",
  "category": "Logistics|Cybersecurity|Supply Chain|Infrastructure|Threat Intel|Other",
  "confidence_score": 90,
  "structured_events": [
    {
      "id": "EVT-001",
      "title": "short title",
      "detail": "1-2 sentence detail",
      "severity": "critical|high|medium|low",
      "timestamp": "ISO timestamp or null",
      "entities": ["named", "entities"],
      "confidence": 0
    }
  ],
  "connections": [
    { "from": "EVT-001", "to": "EVT-002", "relationship": "description" }
  ],
  "recommended_actions": [
    { "priority": 1, "action": "action text", "rationale": "why" }
  ],
  "risk_score": 0,
  "intelligence_gaps": ["what is unknown or missing"]
}`

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: true,
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this operational data:\n\n${rawInput}` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const text = parsed.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {
        // skip malformed chunks
      }
    }
  }
}

// Follow-up chat — returns async generator of text chunks
export async function* chatWithGroq(messages, analysisContext) {
  const systemPrompt = `You are an operational intelligence analyst AI. The analyst has processed an incident through Palantir AIP. You have the full structured analysis as context. Answer follow-up questions concisely and precisely. Reference specific events by ID when relevant. Plain text only, no markdown.

Current analysis context:
${JSON.stringify(analysisContext, null, 2)}`

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: true,
      temperature: 0.3,
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const text = parsed.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {}
    }
  }
}

// Persona-based analysis — returns async generator of text chunks
export async function* analyzeWithGroqPersona(rawInput, persona) {
  const personas = {
    A: `You are a cautious, conservative operational analyst. You flag risks early, err on the side of higher severity ratings, and always highlight what could go wrong. Return ONLY valid JSON matching the schema.`,
    B: `You are a pragmatic, action-oriented operational analyst. You focus on what can be done right now, prefer lower severity unless clearly justified, and prioritize speed of response. Return ONLY valid JSON matching the schema.`
  }

  const systemPrompt = `${personas[persona] || personas.A}

Schema:
{
  "summary": "Detailed technical summary using high-fidelity operational language",
  "severity": "critical|high|medium|low",
  "category": "Logistics|Cybersecurity|Supply Chain|Infrastructure|Threat Intel|Other",
  "confidence_score": 90,
  "structured_events": [
    {
      "id": "EVT-001",
      "title": "short title",
      "detail": "1-2 sentence detail",
      "severity": "critical|high|medium|low",
      "timestamp": "ISO timestamp or null",
      "entities": ["named", "entities"],
      "confidence": 0
    }
  ],
  "connections": [
    { "from": "EVT-001", "to": "EVT-002", "relationship": "description" }
  ],
  "recommended_actions": [
    { "priority": 1, "action": "action text", "rationale": "why" }
  ],
  "risk_score": 0,
  "intelligence_gaps": ["what is unknown or missing"]
}`

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: true,
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this operational data:\n\n${rawInput}` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const text = parsed.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {}
    }
  }
}
