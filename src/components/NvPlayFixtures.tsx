'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface NvMatch {
  MatchId: string
  MatchTitle: string
  Team1Name: string
  Team2Name: string
  Team1Scores: string | null
  Team2Scores: string | null
  CompetitionName: string
  VenueName: string
  StartDateTime: string
  IsFixture: boolean
  IsComplete: boolean
  IsInPlay: boolean
  Result: string
  WinningTeamName: string | null
  Team1Image: string | null
  Team2Image: string | null
}

function getCountdown(dateStr: string) {
  const now = new Date()
  const match = new Date(dateStr)
  const diff = match.getTime() - now.getTime()
  if (diff <= 0) return 'Starting soon'
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}d ${hrs}h away`
  if (hrs > 0) return `${hrs}h ${mins}m away`
  return `${mins}m away`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isArdentTeam(name: string) {
  return name.toLowerCase().includes('ardent')
}

function TeamRow({ name, score, batting, isArdent, won, logo }: {
  name: string
  score?: string | null
  batting?: boolean
  isArdent?: boolean
  won?: boolean
  logo?: string | null
}) {
  const initials = name.replace(/\d+(st|nd|rd|th)\s?XI$/i, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`flex items-center justify-between py-2.5 px-4 ${batting ? 'bg-ardent/10 border border-ardent/20' : ''}`}>
      <div className="flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} style={{ borderRadius: '50%' }} className="w-10 h-10 object-contain bg-navy-800 border border-ardent-border p-0.5 flex-shrink-0" />
        ) : (
          <div style={{ borderRadius: '50%' }} className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isArdent ? 'bg-ardent text-white' : 'bg-navy-700 text-gray-400'}`}>
            {initials}
          </div>
        )}
        <span className={`text-sm font-semibold leading-tight ${won ? 'text-white' : 'text-gray-300'}`}>{name}</span>
        {batting && <span className="text-[9px] font-bold text-ardent-bright bg-ardent/10 px-1.5 py-0.5 rounded-full">BAT</span>}
        {won && <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">WON</span>}
      </div>
      {score && <span className="text-white font-bold text-sm tabular-nums">{score}</span>}
    </div>
  )
}

function FixtureCard({ match }: { match: NvMatch }) {
  const { date, time } = formatDate(match.StartDateTime)
  const countdown = getCountdown(match.StartDateTime)
  const ardentIsTeam1 = isArdentTeam(match.Team1Name)
  const ardentIsTeam2 = isArdentTeam(match.Team2Name)
  const opponent = ardentIsTeam1 ? match.Team2Name : match.Team1Name

  return (
    <div className="bg-ardent-card border border-ardent-border rounded-2xl overflow-hidden hover:border-ardent/40 transition-all">
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-navy-800/60 border-b border-ardent-border">
        <span className="text-ardent-bright text-[10px] font-bold uppercase tracking-wider truncate max-w-[60%]">{match.CompetitionName}</span>
        <span className="text-gray-600 text-[10px] shrink-0 ml-2">{date} · {time}</span>
      </div>

      {/* Teams */}
      <div className="p-4 space-y-1.5">
        <TeamRow
          name={ardentIsTeam1 ? match.Team1Name : match.Team2Name}
          logo={ardentIsTeam1 ? match.Team1Image : match.Team2Image}
          isArdent
        />
        <div className="flex items-center gap-2 px-4">
          <div className="flex-1 h-px bg-ardent-border/50" />
          <span className="text-gray-700 text-[10px] font-bold uppercase">vs</span>
          <div className="flex-1 h-px bg-ardent-border/50" />
        </div>
        <TeamRow
          name={opponent}
          logo={ardentIsTeam1 ? match.Team2Image : match.Team1Image}
        />
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate max-w-[130px]">{match.VenueName || 'Venue TBD'}</span>
        </div>
        <span className="text-gray-500 text-xs font-medium">{countdown}</span>
      </div>
    </div>
  )
}

function ResultCard({ match }: { match: NvMatch }) {
  const { date } = formatDate(match.StartDateTime)
  const ardentIsTeam1 = isArdentTeam(match.Team1Name)
  const ardentIsTeam2 = isArdentTeam(match.Team2Name)
  const ardentWon = match.WinningTeamName ? isArdentTeam(match.WinningTeamName) : null
  const drawOrNoResult = match.Result && (match.Result.toLowerCase().includes('no result') || match.Result.toLowerCase().includes('tie') || match.Result.toLowerCase().includes('draw'))

  let outcomeColor = 'text-gray-400'
  let outcomeLabel = 'No Result'
  if (ardentWon === true) { outcomeColor = 'text-green-400'; outcomeLabel = 'Win' }
  else if (ardentWon === false) { outcomeColor = 'text-red-400'; outcomeLabel = 'Loss' }
  else if (drawOrNoResult) { outcomeColor = 'text-yellow-400'; outcomeLabel = 'Draw' }

  return (
    <div className="bg-ardent-card border border-ardent-border rounded-2xl overflow-hidden hover:border-ardent/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-navy-800/60 border-b border-ardent-border">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider truncate max-w-[60%]">{match.CompetitionName}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-[10px] font-bold uppercase ${outcomeColor}`}>{outcomeLabel}</span>
          <span className="text-gray-700 text-[10px]">{date}</span>
        </div>
      </div>

      {/* Teams + scores */}
      <div className="p-4 space-y-1.5">
        <TeamRow
          name={match.Team1Name}
          score={match.Team1Scores ?? undefined}
          logo={match.Team1Image}
          isArdent={ardentIsTeam1}
          won={!!match.WinningTeamName && isArdentTeam(match.WinningTeamName) === ardentIsTeam1}
        />
        <div className="flex items-center gap-2 px-4">
          <div className="flex-1 h-px bg-ardent-border/50" />
          <span className="text-gray-700 text-[10px] font-bold uppercase">vs</span>
          <div className="flex-1 h-px bg-ardent-border/50" />
        </div>
        <TeamRow
          name={match.Team2Name}
          score={match.Team2Scores ?? undefined}
          logo={match.Team2Image}
          isArdent={ardentIsTeam2}
          won={!!match.WinningTeamName && isArdentTeam(match.WinningTeamName) === ardentIsTeam2}
        />
      </div>

      {/* Result text */}
      {match.Result && (
        <div className="px-4 pb-4">
          <p className={`text-xs ${outcomeColor} bg-current/5 rounded-lg px-3 py-2 leading-snug`} style={{ background: 'rgba(255,255,255,0.03)' }}>
            {match.Result}
          </p>
        </div>
      )}
    </div>
  )
}

export default function NvPlayFixtures() {
  const [fixtures, setFixtures] = useState<NvMatch[]>([])
  const [results, setResults] = useState<NvMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'fixtures' | 'results'>('fixtures')

  useEffect(() => {
    fetch('/api/nvplay')
      .then(r => r.json())
      .then(data => {
        setFixtures(data.fixtures ?? [])
        setResults(data.results ?? [])
        // Default to results tab if no upcoming fixtures
        if ((data.fixtures ?? []).length === 0 && (data.results ?? []).length > 0) {
          setTab('results')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && fixtures.length === 0 && results.length === 0) return null

  return (
    <section className="py-20 bg-navy-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight">
              Fixtures &amp;<br /><span className="text-ardent">Results</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">Live data from NV Play · NCU competitions</p>
          </div>
          <Link
            href="/fixtures"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 px-5 py-2.5 rounded-full transition-all"
          >
            Full schedule
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-900 rounded-xl p-1 w-fit mb-6">
          <button
            onClick={() => setTab('fixtures')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'fixtures' ? 'bg-ardent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Upcoming {fixtures.length > 0 && <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{fixtures.length}</span>}
          </button>
          <button
            onClick={() => setTab('results')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'results' ? 'bg-ardent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Results {results.length > 0 && <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{results.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-ardent-card border border-ardent-border rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : tab === 'fixtures' ? (
          fixtures.length === 0 ? (
            <div className="bg-ardent-card border border-ardent-border rounded-2xl p-12 text-center">
              <p className="text-gray-400 font-semibold mb-1">No upcoming fixtures</p>
              <p className="text-gray-600 text-sm">Check back soon — schedule updates automatically from NV Play.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {fixtures.map(m => <FixtureCard key={m.MatchId} match={m} />)}
            </div>
          )
        ) : (
          results.length === 0 ? (
            <div className="bg-ardent-card border border-ardent-border rounded-2xl p-12 text-center">
              <p className="text-gray-400 font-semibold mb-1">No results yet this season</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(m => <ResultCard key={m.MatchId} match={m} />)}
            </div>
          )
        )}

        {/* Mobile CTA */}
        <div className="mt-6 sm:hidden text-center">
          <Link href="/fixtures" className="text-sm text-ardent-bright font-medium">
            View full schedule →
          </Link>
        </div>
      </div>
    </section>
  )
}
