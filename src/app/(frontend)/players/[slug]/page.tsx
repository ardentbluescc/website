import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPlayer } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const roleLabel: Record<string, string> = {
  batsman: 'Batter',
  bowler: 'Bowler',
  'all-rounder': 'All-Rounder',
  keeper: 'Wicket-Keeper',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const player = await getPlayer(slug)
  if (!player) return {}
  return {
    title: `${player.name} | Ardent Blues CC`,
    description: player.bio ?? `${player.name} – ${roleLabel[player.role] ?? 'Player'} at Ardent Blues Cricket Club`,
  }
}

function Jersey({ number }: { number?: number | null }) {
  return (
    <svg viewBox="0 0 200 215" aria-hidden className="w-full h-full drop-shadow-2xl">
      <path
        d="M 70 12 L 5 52 L 22 85 L 46 90 L 46 205 L 154 205 L 154 90 L 178 85 L 195 52 L 130 12 L 100 50 Z"
        fill="#0B1220"
        stroke="#1D6EF5"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 72 16 L 100 48 L 128 16 C 112 6 88 6 72 16 Z"
        fill="#060D1A"
        stroke="#1D6EF5"
        strokeWidth="1.5"
      />
      <path d="M 69 16 L 8 54 L 21 78 L 44 72 L 66 22 Z" fill="#1D6EF5" opacity="0.15" />
      <path d="M 131 16 L 192 54 L 179 78 L 156 72 L 134 22 Z" fill="#1D6EF5" opacity="0.15" />
      <line x1="46" y1="93" x2="154" y2="93" stroke="#1D6EF5" strokeWidth="1" opacity="0.3" />
      {number != null ? (
        <text
          x="100"
          y="168"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="80"
          fontWeight="700"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-4"
        >
          {number}
        </text>
      ) : (
        <text
          x="100"
          y="158"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="44"
          fill="#1D6EF5"
          opacity="0.4"
          fontFamily="system-ui"
        >
          #
        </text>
      )}
    </svg>
  )
}

function FormatBadge({ name }: { name: string }) {
  const n = name.toLowerCase()
  let cls = 'bg-ardent/20 text-ardent-bright border-ardent/30'
  if (n.includes('t20') || n.includes('twenty')) cls = 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  else if (n.includes('senior') || n.includes('premier') || n.includes('league 1') || n.includes('league 2')) cls = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
  else if (n.includes('cup') || n.includes('trophy')) cls = 'bg-green-500/15 text-green-400 border-green-500/30'
  else if (n.includes('minor') || n.includes('junior')) cls = 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  else if (n.includes('midweek') || n.includes('mid week')) cls = 'bg-orange-500/15 text-orange-400 border-orange-500/30'

  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap ${cls}`}>
      {name}
    </span>
  )
}

const BATTING_COLS = [
  { key: 'matches', label: 'M' },
  { key: 'innings', label: 'Inn' },
  { key: 'notOut', label: 'NO' },
  { key: 'runs', label: 'Runs' },
  { key: 'highScore', label: 'HS' },
  { key: 'average', label: 'Avg' },
  { key: 'strikeRate', label: 'SR' },
  { key: 'hundreds', label: "100's" },
  { key: 'fifties', label: "50's" },
  { key: 'fours', label: '4s' },
  { key: 'sixes', label: '6s' },
  { key: 'catches', label: 'CT' },
  { key: 'stumpings', label: 'ST' },
]

const BOWLING_COLS = [
  { key: 'matches', label: 'M' },
  { key: 'innings', label: 'Inn' },
  { key: 'balls', label: 'Balls' },
  { key: 'runs', label: 'Runs' },
  { key: 'wickets', label: 'WKTs' },
  { key: 'bestBowling', label: 'BBM' },
  { key: 'average', label: 'Avg' },
  { key: 'economy', label: 'Econ' },
  { key: 'strikeRate', label: 'SR' },
  { key: 'fourWickets', label: '4W' },
  { key: 'fiveWickets', label: '5W' },
]

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const player = await getPlayer(slug)
  if (!player) notFound()

  const hasBatting = (player.battingStats?.length ?? 0) > 0
  const hasBowling = (player.bowlingStats?.length ?? 0) > 0
  const initials = player.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Back breadcrumb */}
      <div className="pt-24 pb-0 max-w-6xl mx-auto px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/teams" className="hover:text-gray-400 transition-colors">Squad</Link>
          <span>›</span>
          <span className="text-gray-400">{player.name}</span>
        </nav>
      </div>

      {/* ── Hero card ── */}
      <div className="max-w-6xl mx-auto px-6 mt-5">
        <div className="relative rounded-2xl overflow-hidden border border-ardent-border bg-navy-800">
          {/* Subtle dot-grid background */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #1D6EF5 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative flex flex-col sm:flex-row">
            {/* Player photo — left panel */}
            <div className="relative w-full sm:w-[42%] min-h-[260px] sm:min-h-[380px]">
              {player.photo?.url ? (
                <>
                  <Image
                    src={player.photo.url}
                    alt={player.name}
                    fill
                    className="object-cover object-top"
                    unoptimized
                    priority
                  />
                  {/* Gradient fades: right edge blends into right panel */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy-800 hidden sm:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-800 via-transparent to-transparent sm:hidden" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900">
                  <span className="text-white/10 font-display font-normal text-[10rem] leading-none select-none">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Info panel — right */}
            <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:py-14 z-10 relative">
              {/* Jersey */}
              <div className="flex items-start gap-5 mb-7">
                <div className="w-20 h-[92px] flex-shrink-0">
                  <Jersey number={player.jerseyNumber} />
                </div>
                {player.isCaptain && (
                  <span className="mt-2 inline-block text-[11px] font-bold text-black bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide">
                    Captain
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-none tracking-tight uppercase mb-3">
                {player.name}
              </h1>

              {/* Subtitle tags */}
              <div className="flex flex-wrap gap-2 mt-1">
                {player.role && (
                  <span className="text-xs font-semibold text-ardent-bright bg-ardent/10 border border-ardent/20 px-3 py-1 rounded-full">
                    {roleLabel[player.role] ?? player.role}
                  </span>
                )}
                {player.group && (
                  <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {player.group.replace('group-', 'Group ')}
                  </span>
                )}
                {player.jerseyNumber != null && (
                  <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="max-w-6xl mx-auto px-6 mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-ardent-border rounded-xl overflow-hidden bg-ardent-card divide-x divide-y sm:divide-y-0 divide-ardent-border">
          {[
            { label: 'Role', value: roleLabel[player.role ?? ''] ?? '—' },
            {
              label: 'Batting Style',
              value:
                player.battingStyle === 'rhb'
                  ? 'Right-hand Bat'
                  : player.battingStyle === 'lhb'
                    ? 'Left-hand Bat'
                    : '—',
            },
            { label: 'Bowling Style', value: player.bowlingStyle ?? '—' },
            {
              label: 'Date of Birth',
              value: player.dob
                ? new Date(player.dob).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—',
            },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">{label}</p>
              <p className="text-white text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 mt-10 pb-24 space-y-12">
        {/* Bio */}
        {player.bio && (
          <section>
            <h2 className="text-base font-semibold text-gray-400 uppercase tracking-widest mb-4">
              About {player.name.split(' ')[0]}
            </h2>
            <p className="text-gray-300 leading-relaxed max-w-3xl text-[15px]">{player.bio}</p>
          </section>
        )}

        {/* Batting & Fielding */}
        {hasBatting && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-5">Batting &amp; Fielding</h2>
            <div className="overflow-x-auto rounded-xl border border-ardent-border">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-navy-800 border-b border-ardent-border">
                    <th className="text-left px-4 py-3 w-40" />
                    {BATTING_COLS.map(({ label }) => (
                      <th
                        key={label}
                        className="px-3 py-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ardent-border/40">
                  {player.battingStats.map((row: any, i: number) => (
                    <tr key={i} className="bg-ardent-card hover:bg-navy-800/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <FormatBadge name={row.format} />
                      </td>
                      {BATTING_COLS.map(({ key }) => (
                        <td key={key} className="px-3 py-3.5 text-center text-gray-300 tabular-nums">
                          {row[key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Bowling */}
        {hasBowling && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-5">Bowling</h2>
            <div className="overflow-x-auto rounded-xl border border-ardent-border">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="bg-navy-800 border-b border-ardent-border">
                    <th className="text-left px-4 py-3 w-40" />
                    {BOWLING_COLS.map(({ label }) => (
                      <th
                        key={label}
                        className="px-3 py-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider text-center"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ardent-border/40">
                  {player.bowlingStats.map((row: any, i: number) => (
                    <tr key={i} className="bg-ardent-card hover:bg-navy-800/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <FormatBadge name={row.format} />
                      </td>
                      {BOWLING_COLS.map(({ key }) => (
                        <td key={key} className="px-3 py-3.5 text-center text-gray-300 tabular-nums">
                          {row[key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasBatting && !hasBowling && !player.bio && (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-ardent-border bg-ardent-card">
            <p className="text-gray-500 text-sm">No stats added yet.</p>
            <p className="text-gray-600 text-xs mt-1">Add batting/bowling stats in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  )
}
