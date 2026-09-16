import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getSponsors } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sponsors | Ardent Blues CC',
  description: 'The businesses and organisations backing Ardent Blues Cricket Club.',
}

const TIERS = [
  { value: 'title', label: 'Title Sponsor' },
  { value: 'gold', label: 'Gold Sponsors' },
  { value: 'silver', label: 'Silver Sponsors' },
  { value: 'bronze', label: 'Bronze Sponsors' },
]

function SponsorCard({ sponsor, large = false }: { sponsor: any; large?: boolean }) {
  return (
    <div className={`rounded-2xl bg-ardent-card p-6 flex flex-col sm:flex-row sm:items-center ${large ? 'gap-8' : 'gap-6'}`}>
      <div className={`relative flex-shrink-0 mx-auto sm:mx-0 ${large ? 'w-full sm:w-64 h-40' : 'w-32 h-32'}`}>
        {sponsor.logo?.url ? (
          <Image src={sponsor.logo.url} alt={sponsor.name} fill unoptimized className="object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-navy-800/60 text-gray-500 text-sm font-semibold px-4 text-center">
            {sponsor.name}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg mb-1">{sponsor.name}</h3>
        {sponsor.description && <p className="text-gray-400 text-sm leading-relaxed mb-3">{sponsor.description}</p>}
        {sponsor.website && (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ardent-bright text-sm font-medium hover:text-white transition-colors"
          >
            Visit website
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

export default async function SponsorsPage() {
  const { docs: sponsors } = await getSponsors()

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-ardent/10 border border-ardent/30 rounded-full px-4 py-1.5 text-ardent-bright text-xs font-semibold tracking-wide uppercase mb-6">
            Club Partners
          </span>
          <h1 className="text-5xl md:text-6xl font-normal text-white mb-5 leading-tight">Our Sponsors</h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Ardent Blues Cricket Club is proud to be backed by the businesses and organisations below.
            Their support helps us grow the game across Belfast.
          </p>
        </div>

        {sponsors.length === 0 ? (
          <div className="rounded-2xl border border-ardent-border bg-ardent-card py-16 px-6 text-center">
            <p className="text-gray-500 text-sm">No sponsors added yet.</p>
            <p className="text-gray-600 text-xs mt-1">Add sponsors in <span className="text-ardent-bright">/admin → Sponsors</span></p>
          </div>
        ) : (
          <div className="space-y-14">
            {TIERS.map(({ value, label }) => {
              const tierSponsors = sponsors.filter((s: any) => s.tier === value)
              if (tierSponsors.length === 0) return null
              const large = value === 'title'
              return (
                <div key={value}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">{label}</h2>
                  <div className={large ? 'space-y-4' : 'grid sm:grid-cols-2 gap-4'}>
                    {tierSponsors.map((sponsor: any) => (
                      <SponsorCard key={sponsor.id} sponsor={sponsor} large={large} />
                    ))}
                  </div>
                </div>
              )
            })}
            {(() => {
              const untiered = sponsors.filter((s: any) => !TIERS.some(t => t.value === s.tier))
              if (untiered.length === 0) return null
              return (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">Sponsors</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {untiered.map((sponsor: any) => (
                      <SponsorCard key={sponsor.id} sponsor={sponsor} />
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center rounded-2xl border border-ardent/30 bg-ardent/5 py-10 px-6">
          <h3 className="text-white text-xl font-semibold mb-2">Interested in sponsoring us?</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Get your brand in front of the club and its supporters — reach out and we&apos;ll talk through the options.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-ardent hover:bg-ardent-light text-white text-sm font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  )
}
