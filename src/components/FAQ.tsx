'use client'

import { useState } from 'react'
import Link from 'next/link'

const faqs = [
  {
    q: 'Who can become a member of Ardent Blues Cricket Club?',
    a: "ABCC welcomes people from different backgrounds and is committed to equality, diversity and inclusion. Membership is open regardless of factors such as age, disability, ethnicity, nationality, religion or belief, sex and sexual orientation, subject to the requirements of cricket and the Club's membership arrangements.",
    example: 'Someone who is new to cricket can enquire about joining. They should not be excluded simply because of their background or lack of previous playing experience.',
  },
  {
    q: 'What do I agree to when I join the Club?',
    a: 'By joining ABCC, members agree to follow the Constitution, Club regulations and adopted codes of practice, including the Code of Conduct. Members are expected to behave respectfully and uphold the Club’s values.',
    example: "A player must treat teammates and opponents respectfully during matches and also avoid bullying or abusive comments in the team's WhatsApp group.",
  },
  {
    q: 'How are membership fees decided, and can I receive a refund?',
    a: "Membership fees are set annually through the Club's governance arrangements. The Constitution provides for monthly, quarterly or yearly payment arrangements. Refund requests made before the season starts may be considered by the Management Committee. Once the season has started, refunds are generally unavailable except in exceptional circumstances.",
    example: 'If a member needs to leave before the season begins because they are relocating, they can submit a refund request for the Committee to consider. A refund is not automatic.',
  },
  {
    q: 'What behaviour is expected during matches and training?',
    a: 'Players must act fairly, respect teammates and opponents, follow reasonable instructions and treat umpires, coaches, captains and spectators appropriately. Abuse, intimidation, violence and discriminatory conduct are unacceptable.',
    example: "A batter may disagree with an umpire's decision but must not shout abuse at the umpire or behave aggressively.",
  },
  {
    q: 'What should I do if I experience bullying, racism or discrimination?',
    a: "ABCC's Constitution prohibits discrimination, harassment and victimisation. Concerns can be raised with the Safeguarding Officer or Management Committee. Complaints about a member's behaviour should follow the Constitution's written complaint process through the Secretary.",
    example: "If a player repeatedly makes offensive remarks about another member's nationality, the affected person or a witness can report the incidents, including relevant dates, details and messages.",
  },
  {
    q: 'How does the Club protect children and young people?',
    a: "ABCC is committed to safeguarding members' wellbeing, particularly the safety and welfare of children and young people. The Safeguarding Officer is the lead contact for safeguarding concerns, which must be taken seriously and addressed promptly.",
    example: "If a junior player tells a coach that an adult's behaviour makes them feel unsafe, the coach should listen, avoid investigating the allegation personally and promptly refer the concern to the Safeguarding Officer. Immediate danger should be referred to emergency services.",
  },
  {
    q: 'Can parents and supporters raise concerns about coaching or team decisions?',
    a: 'Yes. Parents and supporters should raise concerns respectfully through an appropriate Club channel. The Code of Conduct does not permit abusive confrontation, intimidation or public humiliation.',
    example: 'If a parent is unhappy that their child was not selected, they can request a suitable discussion with the coach rather than confronting the coach during a match.',
  },
  {
    q: 'Can members use Club facilities and equipment?',
    a: 'The Constitution provides for access to Club facilities and resources for members in good standing, subject to booking, scheduling and other arrangements established by the Management Committee. Members must use equipment responsibly and report safety concerns.',
    example: 'If a player notices that a helmet is damaged, they should report it rather than return it to storage for someone else to use.',
  },
  {
    q: 'What happens if someone breaches the Code of Conduct?',
    a: 'Behavioural complaints should be submitted in writing to the Secretary. Under the Constitution, the Management Committee meets to hear a complaint within 14 days of it being lodged and notifies the parties of the outcome in writing within seven days of the hearing. Appropriate disciplinary action can include termination of membership.',
    example: 'If a member directs serious racist abuse at an opponent, a written complaint can be submitted. The Committee will consider the matter under the Club’s disciplinary arrangements rather than assuming a particular sanction before reviewing the circumstances.',
  },
  {
    q: 'Can I appeal a disciplinary decision?',
    a: 'Yes. The Constitution provides a right of appeal. The Management Committee should consider an appeal within seven days of the Secretary receiving it.',
    example: 'If a member believes a disciplinary decision was based on incorrect information, they can submit an appeal explaining which facts or aspects of the decision they believe should be reconsidered.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left */}
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight mb-6">
              Got questions?
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Membership, conduct, and how the Club looks after its players — based on the ABCC
              Constitution and Code of Conduct.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-ardent-card border border-ardent-border text-white text-sm font-medium px-6 py-3 rounded-full hover:border-ardent transition-all"
            >
              Contact Support
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <div className="mt-8 bg-gradient-to-br from-[#0d2b5e] to-[#1a4080] rounded-2xl h-44 flex items-center justify-center">
              <span className="text-7xl select-none">🏏</span>
            </div>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border transition-all overflow-hidden ${
                  open === i
                    ? 'border-ardent/50 bg-ardent-card'
                    : 'border-ardent-border bg-ardent-card/40 hover:border-ardent-border/80'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span
                    className={`text-sm font-medium pr-4 ${
                      open === i ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                      open === i ? 'rotate-180 text-ardent' : 'text-gray-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {open === i && (
                  <div className="px-5 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    {faq.example && (
                      <div className="mt-3 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Example</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.example}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <p className="text-gray-500 text-xs leading-relaxed pt-2">
              This FAQ is a plain-language guide — the Club Constitution and formally adopted policies
              take precedence. For Secretary or Safeguarding Officer matters,{' '}
              <Link href="/contact" className="text-ardent-bright hover:underline">
                get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
