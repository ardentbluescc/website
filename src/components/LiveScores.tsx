'use client'

import { useEffect, useState } from 'react'

interface Match {
  MatchId: string
  MatchTitle: string
  Team1Name: string
  Team2Name: string
  Team1Scores: string | null
  Team2Scores: string | null
  IsTeam1Batting: boolean
  IsTeam2Batting: boolean
  MatchSituation: string
  MatchSituationShort: string
  CompetitionName: string
  VenueName: string
  IsInPlay: boolean
  IsBreak: boolean
  IsComplete: boolean
  Target: string
  RunsRequired: number
  OversRemaining: string | null
  Result: string
  WinningTeamName: string | null
  Team1Image: string | null
  Team2Image: string | null
}

function TeamLogo({ url, name }: { url: string | null; name: string }) {
  const initials = name.replace(/\d+(st|nd|rd|th)\s?XI$/i, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} style={{ borderRadius: '50%' }} className="w-12 h-12 object-contain bg-navy-800 border border-ardent-border p-0.5" />
    )
  }
  return (
    <div style={{ borderRadius: '50%' }} className="w-12 h-12 bg-ardent/20 border border-ardent/30 flex items-center justify-center text-ardent-bright text-xs font-bold">
      {initials}
    </div>
  )
}

function ScoreDisplay({ match }: { match: Match }) {
  const t1Score = match.Team1Scores || null
  const t2Score = match.Team2Scores || null

  return (
    <div className="flex flex-col gap-3">
      {/* Team 1 */}
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${match.IsTeam1Batting ? 'bg-ardent/10 border border-ardent/20' : 'bg-navy-800/40'}`}>
        <div className="flex items-center gap-3">
          <TeamLogo url={match.Team1Image} name={match.Team1Name} />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{match.Team1Name}</p>
            {match.IsTeam1Batting && (
              <span className="text-[10px] font-bold text-ardent-bright bg-ardent/10 px-2 py-0.5 rounded-full">BATTING</span>
            )}
          </div>
        </div>
        <div className="text-right">
          {t1Score ? (
            <p className="text-white font-bold text-lg tabular-nums leading-none">{t1Score}</p>
          ) : (
            <p className="text-gray-600 text-sm">Yet to bat</p>
          )}
        </div>
      </div>

      {/* Team 2 */}
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${match.IsTeam2Batting ? 'bg-ardent/10 border border-ardent/20' : 'bg-navy-800/40'}`}>
        <div className="flex items-center gap-3">
          <TeamLogo url={match.Team2Image} name={match.Team2Name} />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{match.Team2Name}</p>
            {match.IsTeam2Batting && (
              <span className="text-[10px] font-bold text-ardent-bright bg-ardent/10 px-2 py-0.5 rounded-full">BATTING</span>
            )}
          </div>
        </div>
        <div className="text-right">
          {t2Score ? (
            <p className="text-white font-bold text-lg tabular-nums leading-none">{t2Score}</p>
          ) : (
            <p className="text-gray-600 text-sm">Yet to bat</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const isArdentBatting =
    (match.IsTeam1Batting && match.Team1Name.toLowerCase().includes('ardent')) ||
    (match.IsTeam2Batting && match.Team2Name.toLowerCase().includes('ardent'))

  return (
    <div className="bg-ardent-card border border-ardent-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ardent-border bg-navy-800/50">
        <div className="flex items-center gap-2">
          {/* Live pulse */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-green-400 text-[11px] font-bold uppercase tracking-wider">Live</span>
          <span className="text-gray-600 text-xs mx-1">·</span>
          <span className="text-gray-400 text-xs">{match.CompetitionName}</span>
        </div>
        <span className="text-gray-600 text-xs">{match.VenueName}</span>
      </div>

      {/* Scores */}
      <div className="p-4">
        <ScoreDisplay match={match} />
      </div>

      {/* Situation */}
      {match.MatchSituationShort && match.MatchSituationShort !== 'Fixture' && (
        <div className="px-4 pb-4">
          <p className="text-ardent-bright text-xs bg-ardent/8 border border-ardent/15 rounded-lg px-3 py-2 leading-relaxed">
            {match.MatchSituationShort}
          </p>
        </div>
      )}

      {/* Target info */}
      {match.Target && match.RunsRequired > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Target: <strong className="text-white">{match.Target}</strong></span>
            {match.OversRemaining && <span>· {match.OversRemaining} overs left</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LiveScores() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchLive() {
    try {
      const res = await fetch('/api/nvplay')
      const data = await res.json()
      setMatches(data.live ?? [])
      setLastUpdated(new Date())
    } catch {
      // silent fail — don't show error for live scores
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLive()
    const interval = setInterval(fetchLive, 30_000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  // Don't render anything if no live matches
  if (!loading && matches.length === 0) return null

  return (
    <section className="py-12 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
            </span>
            <h2 className="font-display text-2xl font-normal text-white tracking-tight">Live Now</h2>
          </div>
          {lastUpdated && (
            <p className="text-gray-600 text-xs">
              Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-ardent-card border border-ardent-border rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => <MatchCard key={m.MatchId} match={m} />)}
          </div>
        )}
      </div>
    </section>
  )
}
