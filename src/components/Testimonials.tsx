'use client'

import { useState } from 'react'

const testimonials = [
  {
    quote:
      'Joining Ardent Blues was the best decision I made. The coaches are incredibly supportive, the training is top-notch, and the community made me feel at home from the very first day.',
    name: 'Alex Turner',
    role: 'Elite Member',
    initials: 'AT',
  },
  {
    quote:
      "As a junior player, I've improved massively since joining. The coaching programme is structured brilliantly and the club really invests in developing young talent.",
    name: 'Sam Mitchell',
    role: 'Junior Member',
    initials: 'SM',
  },
  {
    quote:
      'The culture at Ardent Blues is something special. Everyone supports each other whether you\'re playing in the first team or just starting out. Brilliant club.',
    name: 'Ravi Kumar',
    role: 'Senior Player',
    initials: 'RK',
  },
]

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const t = testimonials[idx]

  return (
    <section className="py-20 bg-navy-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-normal text-white leading-none tracking-tight">What Our<br />Members Say</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-10 h-10 rounded-full border border-ardent-border text-gray-400 hover:text-white hover:border-ardent flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % testimonials.length)}
              className="w-10 h-10 rounded-full bg-ardent hover:bg-ardent-light text-white flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote card */}
          <div className="lg:col-span-2 bg-ardent-card rounded-2xl p-8 md:p-10 border border-ardent-border flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="text-7xl text-ardent font-serif leading-none mb-5 select-none">&ldquo;</div>
              <p className="text-white text-xl md:text-2xl leading-relaxed font-light">{t.quote}</p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-ardent flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-ardent/30">
                {t.initials}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-ardent-bright text-sm">[{t.role}]</p>
              </div>
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? 'w-6 bg-ardent' : 'w-1.5 bg-ardent-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Side card */}
          <div className="bg-ardent rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Member Stories</p>
              <p className="text-7xl font-normal text-white leading-none">
                {idx + 1}/{testimonials.length}
              </p>
              <p className="text-blue-100 text-sm mt-3">
                Hear from our members across all age groups and playing levels.
              </p>
            </div>
            <p className="text-blue-100/70 text-sm mt-8 leading-relaxed">
              Ardent Blues CC — building community through cricket in Belfast since 2023.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
