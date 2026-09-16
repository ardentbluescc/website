import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Code of Conduct | Ardent Blues CC',
  description: 'The Ardent Blues Cricket Club code of conduct for players, members, and volunteers.',
}

const sections = [
  {
    title: '1. Purpose and scope',
    body: [
      "This Code applies to members, players, coaches, volunteers, officials, parents/guardians, supporters and visitors participating in or representing Ardent Blues Cricket Club (ABCC), including at matches, training, club events, online channels and social media.",
      'ABCC exists to promote amateur cricket, community participation, equality, diversity, inclusion, wellbeing and a safe sporting environment.',
    ],
  },
  {
    title: '2. Expected standards',
    points: [
      'Treat everyone with dignity, fairness and respect, regardless of age, disability, sex, race, ethnicity, nationality, religion or belief, sexual orientation, socioeconomic status or cricketing ability.',
      'Play and support cricket in the spirit of the game. Respect teammates, opponents, coaches, officials, volunteers, spectators and the decisions of match officials.',
      'Use appropriate language and behaviour. Bullying, harassment, discrimination, racism, intimidation, threats, violence, abusive conduct and victimisation are not acceptable.',
      "Protect children, young people and vulnerable individuals. Follow the Club's safeguarding procedures and promptly report concerns to the Safeguarding Officer.",
      'Use Club facilities, equipment, funds and property responsibly. Follow reasonable safety, booking and operational instructions.',
      'Do not act in a way that is likely to bring ABCC or the sport of cricket into disrepute.',
      'Use social media and digital communications responsibly. Do not publish abusive, discriminatory, threatening, confidential or inappropriate content connected with the Club or its participants.',
      'Raise concerns honestly and respectfully and cooperate with reasonable Club enquiries or disciplinary processes.',
    ],
  },
  {
    title: '3. Reporting concerns',
    body: [
      'Concerns about behaviour should normally be submitted in writing to the Club Secretary. Safeguarding concerns should be reported promptly to the Safeguarding Officer. Where there is an immediate risk of harm or a suspected criminal matter, contact the appropriate emergency or statutory authority as well as the Club where appropriate.',
    ],
  },
  {
    title: '4. Breaches and disciplinary action',
    body: [
      'The Management Committee may investigate alleged breaches and take proportionate action in accordance with the Club Constitution and applicable Club policies. Action may include guidance, a warning, restrictions, suspension or termination of membership. Affected members will have the appeal rights provided by the Constitution.',
    ],
  },
  {
    title: '5. Acceptance',
    body: [
      'By joining, participating in, volunteering for, representing or attending activities organised by ABCC, individuals are expected to follow this Code together with the Club Constitution, safeguarding requirements and other policies adopted by the Management Committee.',
    ],
  },
]

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-gray-500 text-sm uppercase tracking-wide mb-3">Effective 2 September 2026</p>
        <h1 className="text-5xl font-normal text-white mb-5 leading-tight">Code of Conduct</h1>
        <p className="text-gray-400 text-lg mb-14 leading-relaxed">
          Condensed from the standards and governance principles in the ABCC Constitution.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white font-bold text-xl mb-4">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="text-gray-400 text-sm leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
              {section.points && (
                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 text-gray-400 text-sm leading-relaxed">
                      <span className="text-ardent-bright mt-1">&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
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
