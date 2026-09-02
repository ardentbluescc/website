'use client'

import { useState } from 'react'
import Link from 'next/link'

function formLine(m: any): string {
  const parts: string[] = []
  if (m.didBat) parts.push(`${m.runs ?? 0}${m.notOut ? '*' : ''} (${m.balls ?? 0}b)`)
  if (m.didBowl) parts.push(`${m.wickets ?? 0}-${m.runsConceded ?? 0} (${m.overs ?? 0}ov)`)
  if (m.catches) parts.push(`${m.catches}ct`)
  if (m.stumpings) parts.push(`${m.stumpings}st`)
  if (m.runOuts) parts.push(`${m.runOuts}ro`)
  return parts.length > 0 ? parts.join(' · ') : 'Did not bat or bowl'
}

export default function RecentFormSection({ matchLog }: { matchLog: any[] }) {
  const byYear = new Map<string, any[]>()
  for (const m of matchLog) {
    if (!m.date) continue
    const year = new Date(m.date).getFullYear().toString()
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(m)
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b.localeCompare(a))
  const [activeYear, setActiveYear] = useState(years[0])

  if (years.length === 0) return null

  const matches = (byYear.get(activeYear) ?? [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold text-white">Recent Form</h2>
          <span className="text-sm text-gray-500">every innings of {activeYear}</span>
        </div>
        {years.length > 1 && (
          <div className="flex gap-1.5">
            {years.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => setActiveYear(y)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  y === activeYear
                    ? 'bg-ardent text-white border-ardent'
                    : 'bg-transparent text-gray-500 border-ardent-border hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ardent-border overflow-hidden divide-y divide-ardent-border/40">
        {matches.map((m: any, i: number) => {
          const row = (
            <>
              <span className="text-xs text-gray-500 w-24 flex-shrink-0 tabular-nums">
                {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-white font-semibold text-sm tabular-nums">{formLine(m)}</span>
              <span className="ml-auto text-xs text-gray-500 text-right">
                {m.teamLabel && m.opponent ? `${m.teamLabel} v ${m.opponent}` : m.opponent ?? ''}
                {m.competition && <> · <span className="text-gray-400">{m.competition}</span></>}
              </span>
              {m.matchId && <span className="text-gray-600 flex-shrink-0">›</span>}
            </>
          )
          const rowClass = 'flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 bg-ardent-card hover:bg-navy-800/60 transition-colors'
          return m.matchId ? (
            <Link key={m.matchId} href={`/matches/${m.matchId}`} className={rowClass}>{row}</Link>
          ) : (
            <div key={i} className={rowClass}>{row}</div>
          )
        })}
      </div>
    </section>
  )
}
