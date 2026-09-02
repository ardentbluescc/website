'use client'

import { useState } from 'react'

function bestBattingLine(m: any): string {
  return `${m.runs ?? 0}${m.notOut ? '*' : ''} (${m.balls ?? 0}b)`
}

function bestBowlingLine(m: any): string {
  return `${m.wickets ?? 0}-${m.runsConceded ?? 0} (${m.overs ?? 0}ov)`
}

// Best bowling comparator: most wickets, fewest runs conceded on tie.
function isBetterBowling(a: any, b: any): boolean {
  if (!b) return true
  if ((a.wickets ?? 0) !== (b.wickets ?? 0)) return (a.wickets ?? 0) > (b.wickets ?? 0)
  return (a.runsConceded ?? Infinity) < (b.runsConceded ?? Infinity)
}

const COLS = [
  { key: 'apps', label: 'Apps' },
  { key: 'innings', label: 'Inns' },
  { key: 'runs', label: 'Runs' },
  { key: 'avg', label: 'Avg' },
  { key: 'wickets', label: 'Wkts' },
  { key: 'maidens', label: 'Mdns' },
]

export default function CompetitionBreakdown({ matchLog }: { matchLog: any[] }) {
  const years = Array.from(
    new Set(matchLog.filter((m) => m.date).map((m) => new Date(m.date).getFullYear().toString()))
  ).sort((a, b) => b.localeCompare(a))

  const scopes = ['Career', ...years]
  const [activeScope, setActiveScope] = useState(years[0] ?? 'Career')

  if (matchLog.length === 0) return null

  const scoped = activeScope === 'Career'
    ? matchLog
    : matchLog.filter((m) => m.date && new Date(m.date).getFullYear().toString() === activeScope)

  if (scoped.length === 0) return null

  // Group by competition
  const byCompetition = new Map<string, any[]>()
  for (const m of scoped) {
    const key = m.competition || 'Other'
    if (!byCompetition.has(key)) byCompetition.set(key, [])
    byCompetition.get(key)!.push(m)
  }

  const rows = Array.from(byCompetition.entries()).map(([competition, matches]) => {
    const batted = matches.filter((m) => m.didBat)
    const bowled = matches.filter((m) => m.didBowl)
    const runs = batted.reduce((s, m) => s + (m.runs ?? 0), 0)
    const notOuts = batted.filter((m) => m.notOut).length
    const dismissals = batted.length - notOuts
    const avg = dismissals > 0 ? (runs / dismissals).toFixed(1) : batted.length > 0 ? '—' : '—'
    const wickets = bowled.reduce((s, m) => s + (m.wickets ?? 0), 0)
    const maidens = bowled.reduce((s, m) => s + (m.maidens ?? 0), 0)
    return { competition, apps: matches.length, innings: batted.length, runs, avg, wickets, maidens }
  }).sort((a, b) => b.apps - a.apps)

  const bestBatting = scoped.filter((m) => m.didBat).sort((a, b) => (b.runs ?? 0) - (a.runs ?? 0))[0]
  const bestBowling = scoped.filter((m) => m.didBowl).reduce((best, m) => (isBetterBowling(m, best) ? m : best), null as any)

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-xl font-semibold text-white">By Competition</h2>
        <div className="flex gap-1.5">
          {scopes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveScope(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                s === activeScope
                  ? 'bg-ardent text-white border-ardent'
                  : 'bg-transparent text-gray-500 border-ardent-border hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Best batting / bowling highlight cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {bestBatting && (
          <div className="rounded-xl border border-ardent-border bg-ardent-card p-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Best Batting</p>
            <p className="text-white text-2xl font-semibold tabular-nums mb-1">{bestBattingLine(bestBatting)}</p>
            <p className="text-gray-500 text-xs">{bestBatting.competition}</p>
          </div>
        )}
        {bestBowling && (
          <div className="rounded-xl border border-ardent-border bg-ardent-card p-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Best Bowling</p>
            <p className="text-white text-2xl font-semibold tabular-nums mb-1">{bestBowlingLine(bestBowling)}</p>
            <p className="text-gray-500 text-xs">{bestBowling.competition}</p>
          </div>
        )}
      </div>

      {/* Competition table */}
      <div className="overflow-x-auto rounded-xl border border-ardent-border">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-navy-800 border-b border-ardent-border">
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Competition</th>
              {COLS.map(({ label }) => (
                <th key={label} className="px-3 py-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ardent-border/40">
            {rows.map((row) => (
              <tr key={row.competition} className="bg-ardent-card hover:bg-navy-800/60 transition-colors">
                <td className="px-4 py-3.5 text-white font-medium">{row.competition}</td>
                {COLS.map(({ key }) => (
                  <td key={key} className="px-3 py-3.5 text-center text-gray-300 tabular-nums">
                    {(row as any)[key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
