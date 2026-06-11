import Link from 'next/link'

export default function StatsSection() {
  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight mb-8">
              Your club.<br />
              <span className="text-ardent">Belfast.</span>
            </h2>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2.5 bg-ardent hover:bg-ardent-light text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 text-sm shadow-lg shadow-ardent/20"
            >
              Join Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Wide card */}
            <div className="col-span-2 bg-ardent-card rounded-2xl p-6 flex items-center gap-5 border border-ardent-border">
              <div className="w-14 h-14 rounded-full bg-ardent/15 flex items-center justify-center flex-shrink-0 text-3xl">
                🏆
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-snug">
                  Preferred by Leading Cricket Professionals
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Competing in multiple NCU divisions and cup competitions across Northern Ireland
                </p>
              </div>
            </div>

            {/* 100% — blue */}
            <div className="bg-ardent rounded-2xl p-6 flex flex-col">
              <p className="text-6xl font-normal text-white mb-2 leading-none">100%</p>
              <p className="text-blue-100 text-xs leading-relaxed">
                Member satisfaction across all squads and age groups
              </p>
            </div>

            {/* 50+ — dark */}
            <div className="bg-ardent-card rounded-2xl p-6 flex flex-col border border-ardent-border">
              <p className="text-6xl font-normal text-white mb-2 leading-none">50+</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Active members helping players excel on grounds everywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
