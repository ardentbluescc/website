import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Ardent Blues CC',
  description: 'The story of Ardent Blues Cricket Club — founded 2023, growing every year since.',
}

const milestones = [
  {
    year: '2023',
    title: 'Founded',
    stat: '50',
    statLabel: 'players',
    teams: '3 league teams · 1 midweek team',
    body: "Founded on 14 January 2023, Ardent Blues Cricket Club began its journey with just 50 passionate players and a vision to build a strong, competitive, and welcoming cricket community.",
  },
  {
    year: '2024',
    title: 'Expanding Horizons',
    stat: '70',
    statLabel: 'players',
    teams: '4 league teams · 2 midweek teams',
    body: 'Our membership grew to 70 players, alongside increased recognition and popularity. We expanded to 4 league teams and 2 midweek teams, creating more opportunities for players to compete and develop.',
  },
  {
    year: '2025',
    title: 'Steady Progress',
    stat: '85',
    statLabel: 'players',
    teams: '5 league teams · 2 midweek teams',
    body: 'Continuing our growth, we reached 85 players and established 5 league teams, while maintaining 2 midweek teams. This growth reflects the commitment of our players, volunteers, supporters, and the wider Ardent Blues family.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <span className="inline-flex items-center gap-2 bg-ardent/10 border border-ardent/30 rounded-full px-4 py-1.5 text-ardent-bright text-xs font-semibold tracking-wide uppercase mb-6">
          About Us
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-normal text-white leading-[1.05] tracking-tight mb-8">
          Ardent Blues Cricket Club — Scaling New Heights
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          Founded on 14 January 2023, Ardent Blues Cricket Club began its journey with just 50
          passionate players and a vision to build a strong, competitive, and welcoming cricket
          community.
        </p>
        <p className="text-gray-400 leading-relaxed mb-16">
          From our beginnings with 3 league teams and 1 midweek team, the club has grown steadily
          year after year.
        </p>

        {/* Growth timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {milestones.map((m) => (
            <div key={m.year} className="bg-ardent-card border border-ardent-border rounded-2xl p-6">
              <p className="text-ardent-bright text-xs font-semibold uppercase tracking-wide mb-2">
                {m.year} — {m.title}
              </p>
              <p className="font-display text-4xl font-normal text-white leading-none mb-1">
                {m.stat}
                <span className="text-lg text-gray-500 font-sans ml-1.5">{m.statLabel}</span>
              </p>
              <p className="text-gray-500 text-xs mb-4">{m.teams}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>

        {/* Vision */}
        <h2 className="font-display text-3xl md:text-4xl font-normal text-white leading-none tracking-tight mb-6">
          Our Vision
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          At Ardent Blues, we believe cricket is more than just a game. It is about teamwork,
          friendship, discipline, passion, and creating opportunities for everyone to be part of
          something special.
        </p>
        <p className="text-gray-400 leading-relaxed mb-8">
          As we look ahead, our ambition is to continue growing both on and off the field,
          developing players, strengthening our teams, and building an even stronger cricket
          community.
        </p>

        <div className="bg-ardent/10 border border-ardent/30 rounded-2xl px-6 py-5 mb-16">
          <p className="text-white text-lg font-medium leading-relaxed">
            From 50 players to 85+ and counting — our journey has only just begun.
          </p>
        </div>

        {/* Closing banner */}
        <div className="text-center border-t border-ardent-border pt-10">
          <p className="text-white font-semibold text-lg mb-2">Ardent Blues Cricket Club</p>
          <p className="text-gray-500 text-sm">
            Established 2023 &nbsp;|&nbsp; Growing Together &nbsp;|&nbsp; Playing with Passion &nbsp;|&nbsp; Scaling New Heights
          </p>
        </div>
      </div>
    </div>
  )
}
