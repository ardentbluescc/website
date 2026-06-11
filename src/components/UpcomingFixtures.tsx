'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const COMPETITIONS = [
  { key: 'all', label: 'All Matches' },
  { key: 'senior-league', label: 'Senior League' },
  { key: 't20-bowl', label: 'T20 Bowl' },
  { key: 'junior-league', label: 'Junior League' },
  { key: 'junior-cup', label: 'Junior Cup' },
  { key: 'friendly', label: 'Friendly' },
]

const FORMAT_LABEL: Record<string, string> = {
  'senior-league': 'League',
  'junior-league': 'League',
  't20-bowl': 'T20',
  'junior-cup': 'Cup',
  friendly: 'Friendly',
}

function getCountdown(dateStr: string) {
  const now = new Date()
  const match = new Date(dateStr)
  const diff = match.getTime() - now.getTime()
  if (diff <= 0) return 'Starting soon'
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hrs} hrs ${mins} mins`
  if (hrs > 0) return `${hrs} hrs ${mins} mins`
  return `${mins} mins`
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function TeamBadge({ name, accent }: { name: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
        accent ? 'bg-ardent text-white' : 'bg-navy-700 text-gray-300'
      }`}>
        {initials(name)}
      </div>
      <span className="text-white font-semibold text-sm leading-tight">{name}</span>
    </div>
  )
}

export default function UpcomingFixtures({ fixtures }: { fixtures: any[] }) {
  const [active, setActive] = useState('all')
  const [now, setNow] = useState(new Date())

  // Update countdown every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const filtered = active === 'all'
    ? fixtures
    : fixtures.filter(f => f.competition === active)

  // Competitions that actually have fixtures
  const availableComps = new Set(fixtures.map(f => f.competition).filter(Boolean))
  const tabs = COMPETITIONS.filter(c => c.key === 'all' || availableComps.has(c.key))

  const activeLabel = COMPETITIONS.find(c => c.key === active)?.label ?? 'All Matches'

  return (
    <section className="py-20 bg-navy-800">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight">
              Live &amp; Upcoming<br /><span className="text-ardent">Matches</span>
            </h2>
          </div>
          <Link
            href="/fixtures"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 px-5 py-2.5 rounded-full transition-all"
          >
            All fixtures
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {fixtures.length === 0 ? (
          <div className="bg-ardent-card border border-ardent-border rounded-2xl p-12 text-center">
            <p className="text-gray-400 font-semibold mb-1">No fixtures scheduled yet</p>
            <p className="text-gray-600 text-sm">Go to <span className="text-ardent-bright">/admin → Fixtures</span> to add upcoming matches.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-ardent-border">

            {/* Competition tabs */}
            <div className="flex overflow-x-auto bg-navy-900 scrollbar-none">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    active === tab.key
                      ? 'border-ardent text-white bg-ardent/10'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active competition label bar */}
            <div className="bg-ardent px-5 py-2.5">
              <span className="text-white text-sm font-bold tracking-wide">{activeLabel}</span>
            </div>

            {/* Match cards grid */}
            {filtered.length === 0 ? (
              <div className="bg-ardent-card p-10 text-center">
                <p className="text-gray-500 text-sm">No matches in this competition yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-ardent-border bg-ardent-card">
                {filtered.map(fixture => {
                  const home = fixture.homeTeam || 'Ardent Blues CC'
                  const away = fixture.awayTeam || 'TBD'
                  const format = FORMAT_LABEL[fixture.competition] ?? 'Match'
                  const d = fixture.matchDate ? new Date(fixture.matchDate) : null
                  const dateStr = d
                    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                    : null
                  const timeStr = d
                    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : null
                  const countdown = fixture.matchDate ? getCountdown(fixture.matchDate) : null

                  return (
                    <div key={fixture.id} className="p-5 flex flex-col gap-4">
                      {/* Date + format */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs font-medium">
                          {dateStr ? (
                            <><span className="text-white font-semibold">{dateStr}</span>{timeStr && ` ${timeStr}`}</>
                          ) : (
                            'Date TBD'
                          )}
                        </span>
                        <span className="text-ardent-bright text-xs font-bold bg-ardent/10 px-2 py-0.5 rounded">
                          {format}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex flex-col gap-3">
                        <TeamBadge name={home} accent />
                        <TeamBadge name={away} />
                      </div>

                      {/* Countdown */}
                      {countdown && (
                        <p className="text-xs text-gray-400">
                          Match starts in: <span className="text-white font-semibold">{countdown}</span>
                        </p>
                      )}

                      {/* Venue */}
                      {fixture.venue && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{fixture.venue}</span>
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href="/fixtures"
                        className="mt-auto block w-full text-center bg-navy-900 hover:bg-ardent text-white text-xs font-bold py-2.5 rounded-lg transition-all border border-ardent-border hover:border-ardent"
                      >
                        Match Info
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-6 sm:hidden text-center">
          <Link href="/fixtures" className="text-sm text-ardent-bright font-medium">
            View all fixtures →
          </Link>
        </div>

      </div>
    </section>
  )
}
