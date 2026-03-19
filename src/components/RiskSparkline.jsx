// src/components/RiskSparkline.jsx
import React from 'react'
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'

export default function RiskSparkline({ data, mini = false }) {
  if (data.length < 2) return null
  
  if (mini) {
    return (
      <div className="w-16 h-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="score" stroke={data.at(-1)?.score > 70 ? '#e03a3a' : '#1a8fff'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 w-full h-12">
      <div className="flex-1 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="score" stroke="#e03a3a" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg4)', border: '1px solid var(--border2)', fontSize: '9px', fontFamily: 'IBM Plex Mono', padding: '4px' }}
              itemStyle={{ color: 'var(--text)', fontSize: '9px' }}
              labelStyle={{ display: 'none' }}
              formatter={(v) => [`${v}/100`, 'Risk']}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="label-mono text-[8px] opacity-40">LATEST_INDEX</span>
        <span className={`font-mono text-[16px] font-bold ${data.at(-1)?.score > 70 ? 'text-[var(--danger)]' : 'text-[var(--warn)]'}`}>
          {data.at(-1)?.score}
        </span>
      </div>
    </div>
  )
}
