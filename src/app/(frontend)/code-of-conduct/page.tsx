import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Code of Conduct | Ardent Blues CC',
  description: 'The Ardent Blues Cricket Club code of conduct for players, members, and volunteers.',
}

const sections = [
  {
    title: 'Respect & Fair Play',
    points: [
      'Treat teammates, opponents, umpires, coaches, and spectators with respect at all times.',
      'Accept umpiring decisions without dispute — play the game in the right spirit.',
      'No abusive language, sledging, or intimidation on or off the field.',
    ],
  },
  {
    title: 'Commitment & Discipline',
    points: [
      'Attend training and matches on time, or notify your captain/coach in advance if unavailable.',
      'Wear appropriate club kit for matches and training sessions.',
      'Look after club equipment and facilities.',
    ],
  },
  {
    title: 'Safeguarding & Welfare',
    points: [
      'The club has zero tolerance for bullying, harassment, or discrimination of any kind.',
      'Junior members are supervised by DBS-checked coaches at all times during club activities.',
      'Any welfare concerns should be raised with a club official immediately.',
    ],
  },
  {
    title: 'Off-Field Conduct',
    points: [
      'Represent the club responsibly at all club-affiliated events and on social media.',
      'Alcohol and other prohibited substances have no place around junior sessions.',
      'Membership fees and subscriptions should be paid promptly to support club operations.',
    ],
  },
]

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-5xl font-normal text-white mb-5 leading-tight">Code of Conduct</h1>
        <p className="text-gray-400 text-lg mb-14 leading-relaxed">
          All players, members, and volunteers of Ardent Blues Cricket Club are expected to uphold
          the following standards on and off the field.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white font-bold text-xl mb-4">{section.title}</h2>
              <ul className="space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-gray-400 text-sm leading-relaxed">
                    <span className="text-ardent-bright mt-1">&bull;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-ardent/10 border border-ardent/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Questions about this Code of Conduct?{' '}
            <Link href="/contact" className="text-ardent-bright hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
