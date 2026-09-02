import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const NV_BASE = 'https://w-api.cdn.nvplay.net/api/scorecard'

async function getMatch(matchId: string) {
  try {
    const res = await fetch(`${NV_BASE}/${matchId}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ matchId: string }> }): Promise<Metadata> {
  const { matchId } = await params
  const data = await getMatch(matchId)
  const match = data?.Match
  if (!match) return {}
  return {
    title: `${match.Team1Name} vs ${match.Team2Name} | Ardent Blues CC`,
    description: match.MatchSituation ?? undefined,
  }
}

function TeamLogo({ url, name }: { url: string | null; name: string }) {
  const initials = name.replace(/\d+(st|nd|rd|th)\s?XI$/i, '').trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="w-11 h-11 rounded-full object-contain bg-navy-800 border border-ardent-border p-0.5 flex-shrink-0" />
  }
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-navy-700 text-gray-400 border border-ardent-border">
      {initials}
    </div>
  )
}

function InningsCard({ innings }: { innings: any }) {
  const batters = (innings.BattingCard ?? []).filter((b: any) => !b.IsSummary)
  const extras = (innings.BattingCard ?? []).find((b: any) => b.IsSummary)
  const bowlers = innings.BowlingCard ?? []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        {innings.BattingTeamName} <span className="text-gray-500 font-normal text-base">· {innings.ScoreSimple} ({innings.TotalOvers} ov)</span>
      </h3>

      {/* Batting */}
      <div className="overflow-x-auto rounded-xl border border-ardent-border">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-navy-800 border-b border-ardent-border">
              <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Batter</th>
              <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider">How out</th>
              <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">R</th>
              <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">B</th>
              <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">4s</th>
              <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">6s</th>
              <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardent-border/40">
            {batters.map((b: any, i: number) => (
              <tr key={i} className={`bg-ardent-card ${b.HasBatted ? '' : 'opacity-40'}`}>
                <td className="px-4 py-2.5 text-white font-medium">{b.PlayerName}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{b.HasBatted ? (b.HowOut || 'not out') : 'did not bat'}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums font-semibold">{b.HasBatted ? b.Runs : '—'}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{b.HasBatted ? b.Balls : '—'}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{b.HasBatted ? b.Fours : '—'}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{b.HasBatted ? b.Sixes : '—'}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{b.HasBatted ? b.StrikeRate : '—'}</td>
              </tr>
            ))}
            {extras && (
              <tr className="bg-navy-800/60">
                <td className="px-4 py-2.5 text-gray-400 font-medium" colSpan={2}>Extras {extras.HowOut}</td>
                <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums font-semibold" colSpan={5}>{extras.Runs}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bowling */}
      {bowlers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ardent-border">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-navy-800 border-b border-ardent-border">
                <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Bowler</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">O</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">M</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">R</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">W</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardent-border/40">
              {bowlers.map((bw: any, i: number) => (
                <tr key={i} className="bg-ardent-card">
                  <td className="px-4 py-2.5 text-white font-medium">{bw.PlayerName}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{bw.Overs}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{bw.Maidens}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums font-semibold">{bw.Runs}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums font-semibold">{bw.Wickets}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300 tabular-nums">{bw.EconomyRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const data = await getMatch(matchId)
  if (!data?.Match) notFound()

  const match = data.Match
  const innings: any[] = data.Innings ?? []

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="pt-24 pb-0 max-w-5xl mx-auto px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/fixtures" className="hover:text-gray-400 transition-colors">Fixtures</Link>
          <span>›</span>
          <span className="text-gray-400">{match.MatchShortTitle ?? `${match.Team1Name} vs ${match.Team2Name}`}</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-5 pb-24 space-y-10">
        {/* Header */}
        <div className="rounded-2xl border border-ardent-border bg-ardent-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {match.CompetitionName && (
              <span className="text-xs font-semibold text-ardent-bright bg-ardent/10 border border-ardent/20 px-3 py-1 rounded-full">
                {match.CompetitionName}
              </span>
            )}
            {match.StartDateFormatted && (
              <span className="text-xs text-gray-500">{match.StartDateFormatted}</span>
            )}
            {match.VenueName && (
              <span className="text-xs text-gray-500">· {match.VenueName}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-3 flex-1">
              <TeamLogo url={match.Team1Image} name={match.Team1Name} />
              <div>
                <p className="text-white font-semibold">{match.Team1Name}</p>
                {match.Team1Scores && <p className="text-gray-400 text-sm tabular-nums">{match.Team1Scores}</p>}
              </div>
            </div>
            <span className="text-gray-600 text-sm font-medium">vs</span>
            <div className="flex items-center gap-3 flex-1 sm:flex-row-reverse sm:text-right">
              <TeamLogo url={match.Team2Image} name={match.Team2Name} />
              <div>
                <p className="text-white font-semibold">{match.Team2Name}</p>
                {match.Team2Scores && <p className="text-gray-400 text-sm tabular-nums">{match.Team2Scores}</p>}
              </div>
            </div>
          </div>

          {match.Result && (
            <p className="mt-5 text-sm font-semibold text-ardent-bright">{match.Result}</p>
          )}
          {match.TossWinnerDescription && (
            <p className="mt-1 text-xs text-gray-500">{match.TossWinnerDescription}</p>
          )}
        </div>

        {/* Innings */}
        {innings.map((inn, i) => (
          <InningsCard key={i} innings={inn} />
        ))}

        {innings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-ardent-border bg-ardent-card">
            <p className="text-gray-500 text-sm">Scorecard not available for this match.</p>
          </div>
        )}
      </div>
    </div>
  )
}
