import Image from 'next/image'
import Link from 'next/link'
import ScrambleHeading from './ScrambleHeading'

const pills = [
  'Player Development',
  'Skills Courses',
  'Match Day Experience',
  'Private Coaching',
  'Youth Academy',
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-navy-900">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/media/hero-bg.jpg"
          alt="Cricket batsman"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Heavy navy overlay on the left (text side), fades to lighter blue on the right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #060D1A 35%, rgba(6,13,26,0.82) 60%, rgba(6,13,26,0.45) 80%, rgba(6,13,26,0.3) 100%)',
          }}
        />
        {/* Blue tint over the whole image to match brand colour */}
        <div className="absolute inset-0 bg-ardent/20 mix-blend-multiply" />
        {/* Bottom fade so the section blends into the next */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-900 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 bg-ardent/10 border border-ardent/30 rounded-full px-4 py-1.5 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-ardent-bright animate-pulse" />
          <span className="text-ardent-bright text-xs font-semibold tracking-wide uppercase">
            Est. 2023 · Belfast, Northern Ireland
          </span>
        </div>

        {/* Main title */}
        <ScrambleHeading />

        <p className="text-lg md:text-xl text-gray-400 font-light max-w-md mb-10 leading-relaxed">
          A relentless spirit. Driven by passion, sharpens skills, and ignites the love of
          cricket in every player.
        </p>

        {/* CTA row */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <Link
            href="/membership"
            className="inline-flex items-center gap-2.5 bg-ardent hover:bg-ardent-light text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl shadow-ardent/25 text-sm"
          >
            Join Our Club Today
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#about"
            className="w-12 h-12 rounded-full border border-white/20 hover:border-ardent/60 text-white/60 hover:text-white flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {pills.map((label) => (
            <span
              key={label}
              className="text-xs text-gray-500 border border-white/10 hover:border-ardent/40 hover:text-gray-300 rounded-full px-4 py-1.5 cursor-pointer transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Floating card — bottom right */}
      <div className="absolute bottom-8 right-6 hidden lg:block">
        <div className="bg-navy-800/90 backdrop-blur-sm border border-ardent-border rounded-2xl p-5 w-72">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-ardent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-ardent-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Northern Cricket Union</p>
              <p className="text-gray-500 text-xs">Official Member Club</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['AK', 'RB', 'SM', 'JP', 'DL'].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-ardent flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-navy-800"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs">50+ active members</p>
          </div>
        </div>
      </div>
    </section>
  )
}
