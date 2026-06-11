'use client'

import { useState } from 'react'
import Link from 'next/link'

const faqs = [
  {
    q: 'What is Ardent Blues Cricket Club?',
    a: 'Ardent Blues CC is a cricket club based in Belfast, Northern Ireland, founded in 2023. We compete in Northern Cricket Union (NCU) competitions including the Mercury Senior League, Junior League, T20 Bowl, and various cup competitions.',
  },
  {
    q: 'How do I join the club?',
    a: "Click 'Join Our Club' and complete the online registration form. You'll review and sign our Code of Conduct, choose your membership tier, and complete payment. Membership renews annually.",
  },
  {
    q: 'What types of memberships do you offer?',
    a: 'We offer tiered memberships: Junior/Senior Citizen/Student at £40/year, Female Adult at £65/year, and Male Adult at £130/year. Our inclusive pricing encourages participation from all backgrounds.',
  },
  {
    q: 'What are your training hours?',
    a: 'Training sessions are held weekly during the cricket season (April–September). Times and venues are communicated to members via our newsletter and member portal.',
  },
  {
    q: 'What competitions do you participate in?',
    a: 'We compete in the NCU Mercury Senior League (Section 2), Junior League (multiple sections), Lagan Valley Steels T20 Bowl, and the GMCG Junior Cup.',
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
              Everything you need to know about joining, training, and competing with Ardent Blues CC.
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
