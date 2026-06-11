'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

interface Match {
  matchId: string
  type: 'live' | 'fixture' | 'result'
  competition: string
  team1: string
  team2: string
  team1Score: string | null
  team2Score: string | null
  team1Image: string | null
  team2Image: string | null
  result: string | null
  winner: string | null
  venue: string | null
  date: string | null
  dateFormatted: string | null
}

function isArdent(name: string) {
  return name.toLowerCase().includes('ardent')
}

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'Starting soon'
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hrs}h away`
  const mins = Math.floor((diff % 3600000) / 60000)
  return hrs > 0 ? `${hrs}h ${mins}m away` : `${mins}m away`
}

function TeamLogo({ url, name, size = 9 }: { url: string | null; name: string; size?: number }) {
  const initials = name.replace(/\d+(st|nd|rd|th)\s?XI$/i, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const cls = `w-${size} h-${size} flex-shrink-0 object-contain bg-navy-800 border border-ardent-border p-0.5`
  if (url) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} style={{ borderRadius: '50%' }} className={cls} />
  )
  return (
    <div style={{ borderRadius: '50%', width: size * 4, height: size * 4 }} className={`flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isArdent(name) ? 'bg-ardent text-white border border-ardent' : 'bg-navy-700 text-gray-400 border border-ardent-border'}`}>
      {initials}
    </div>
  )
}

function MatchRow({ match }: { match: Match }) {
  const ardentWon = match.winner ? isArdent(match.winner) : null
  const isLive = match.type === 'live'
  const isFixture = match.type === 'fixture'

  let outcomeLabel = ''
  let outcomeColor = ''
  if (isFixture) { outcomeLabel = 'Upcoming'; outcomeColor = 'text-ardent-bright bg-ardent/10 border-ardent/30' }
  else if (isLive) { outcomeLabel = 'Live'; outcomeColor = 'text-green-400 bg-green-400/10 border-green-400/30' }
  else if (ardentWon === true) { outcomeLabel = 'Win'; outcomeColor = 'text-green-400 bg-green-400/10 border-green-400/30' }
  else if (ardentWon === false) { outcomeLabel = 'Loss'; outcomeColor = 'text-red-400 bg-red-400/10 border-red-400/30' }
  else { outcomeLabel = 'Draw'; outcomeColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' }

  const dateStr = match.dateFormatted ?? (match.date ? new Date(match.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '')

  return (
    <div className="bg-ardent-card border border-ardent-border hover:border-ardent/40 transition-all">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-navy-800/60 border-b border-ardent-border">
        <span className="text-[10px] font-bold text-ardent-bright uppercase tracking-wider truncate max-w-[60%]">{match.competition}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isLive && (
            <span className="relative flex h-1.5 w-1.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75" style={{ borderRadius: '50%' }} />
              <span className="relative inline-flex h-1.5 w-1.5 bg-green-400" style={{ borderRadius: '50%' }} />
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 border ${outcomeColor}`}>{outcomeLabel}</span>
          <span className="text-gray-600 text-[10px]">{dateStr}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Team 1 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogo url={match.team1Image} name={match.team1} size={9} />
          <span className={`text-sm font-semibold truncate ${isArdent(match.team1) ? 'text-white' : 'text-gray-300'}`}>{match.team1}</span>
        </div>

        {/* Scores / VS */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 text-center px-2">
          {match.team1Score || match.team2Score ? (
            <>
              <span className="text-white font-bold text-sm tabular-nums leading-none">{match.team1Score ?? '—'}</span>
              <span className="text-gray-700 text-[9px] font-bold uppercase">vs</span>
              <span className="text-white font-bold text-sm tabular-nums leading-none">{match.team2Score ?? '—'}</span>
            </>
          ) : (
            <span className="text-gray-600 text-xs font-bold uppercase">vs</span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-semibold truncate text-right ${isArdent(match.team2) ? 'text-white' : 'text-gray-300'}`}>{match.team2}</span>
          <TeamLogo url={match.team2Image} name={match.team2} size={9} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between gap-3">
        {match.venue ? (
          <div className="flex items-center gap-1.5 text-gray-600 text-xs min-w-0">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{match.venue}</span>
          </div>
        ) : <span />}
        {isFixture && match.date && (
          <span className="text-gray-500 text-xs shrink-0">{getCountdown(match.date)}</span>
        )}
        {match.result && !isFixture && !isLive && (
          <p className="text-gray-500 text-xs truncate text-right">{match.result}</p>
        )}
      </div>
    </div>
  )
}

export default function FixturesPage() {
  const [live, setLive] = useState<Match[]>([])
  const [fixtures, setFixtures] = useState<Match[]>([])
  const [results, setResults] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'fixtures' | 'results'>('fixtures')
  const [activeYear, setActiveYear] = useState<number | 'all'>('all')

  useEffect(() => {
    fetch('/api/nvplay/matches')
      .then(r => r.json())
      .then(data => {
        setLive(data.live ?? [])
        setFixtures(data.fixtures ?? [])
        setResults(data.results ?? [])
        if ((data.fixtures ?? []).length === 0) setTab('results')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build year list from results
  const years = Array.from(
    new Set(results.map(m => m.date ? new Date(m.date).getFullYear() : null).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number)) as number[]

  const visibleResults = activeYear === 'all'
    ? results
    : results.filter(m => m.date && new Date(m.date).getFullYear() === activeYear)

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-none tracking-tight mb-2">
          Fixtures &amp; Results
        </h1>
        <p className="text-gray-400 text-sm mb-10">NCU competitions · 2023–present</p>

        {/* Live matches banner */}
        {live.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75" style={{ borderRadius: '50%' }} />
                <span className="relative inline-flex h-2 w-2 bg-green-400" style={{ borderRadius: '50%' }} />
              </span>
              <span className="text-green-400 text-sm font-bold uppercase tracking-wider">Live Now</span>
            </div>
            <div className="space-y-2">
              {live.map(m => <MatchRow key={m.matchId} match={m} />)}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-ardent-border mb-6 overflow-x-auto">
          <button
            onClick={() => setTab('fixtures')}
            className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === 'fixtures' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Upcoming {fixtures.length > 0 && <span className="ml-1.5 text-[10px] bg-ardent/20 text-ardent-bright px-1.5 py-0.5">{fixtures.length}</span>}
            {tab === 'fixtures' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent" />}
          </button>
          <button
            onClick={() => setTab('results')}
            className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === 'results' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Results {results.length > 0 && <span className="ml-1.5 text-[10px] bg-ardent/20 text-ardent-bright px-1.5 py-0.5">{results.length}</span>}
            {tab === 'results' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent" />}
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-ardent-card border border-ardent-border h-24 animate-pulse" />
            ))}
          </div>
        ) : tab === 'fixtures' ? (
          fixtures.length === 0 ? (
            <div className="bg-ardent-card border border-ardent-border p-12 text-center">
              <p className="text-gray-400 font-semibold">No upcoming fixtures</p>
              <p className="text-gray-600 text-sm mt-1">Schedule updates automatically from NV Play.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fixtures.map(m => <MatchRow key={m.matchId} match={m} />)}
            </div>
          )
        ) : (
          <>
            {/* Year filter tabs */}
            {years.length > 1 && (
              <div className="flex gap-1 mb-5 overflow-x-auto">
                <button
                  onClick={() => setActiveYear('all')}
                  className={`px-4 py-1.5 text-xs font-semibold border transition-colors ${activeYear === 'all' ? 'bg-ardent text-white border-ardent' : 'border-ardent-border text-gray-400 hover:text-white'}`}
                >
                  All years
                </button>
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => setActiveYear(y)}
                    className={`px-4 py-1.5 text-xs font-semibold border transition-colors ${activeYear === y ? 'bg-ardent text-white border-ardent' : 'border-ardent-border text-gray-400 hover:text-white'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {visibleResults.length === 0 ? (
              <div className="bg-ardent-card border border-ardent-border p-12 text-center">
                <p className="text-gray-400 font-semibold">No results for {activeYear}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleResults.map(m => <MatchRow key={m.matchId} match={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
