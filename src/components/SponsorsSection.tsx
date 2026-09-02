import Image from 'next/image'
import Link from 'next/link'

const tierLabel: Record<string, string> = {
  title: 'Title Sponsor',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
}

function SponsorLogo({ sponsor, large = false }: { sponsor: any; large?: boolean }) {
  const content = (
    <div
      className={`relative rounded-2xl border border-ardent-border bg-ardent-card flex items-center justify-center overflow-hidden group transition-all hover:border-ardent/40 ${
        large ? 'h-40 sm:h-48' : 'h-28'
      }`}
    >
      {sponsor.logo?.url ? (
        <Image
          src={sponsor.logo.url}
          alt={sponsor.name}
          fill
          unoptimized
          className="object-contain p-6 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <span className="text-gray-500 text-sm font-semibold px-4 text-center">{sponsor.name}</span>
      )}
    </div>
  )
  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" aria-label={sponsor.name}>
      {content}
    </a>
  ) : content
}

export default function SponsorsSection({ sponsors }: { sponsors: any[] }) {
  const titleSponsor = sponsors.find((s) => s.tier === 'title')
  const rest = sponsors.filter((s) => s.tier !== 'title')

  return (
    <section className="py-20 bg-navy-900 border-t border-ardent-border/40">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight">
              Backed by our<br /><span className="text-ardent">Sponsors</span>
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 px-5 py-2.5 rounded-full transition-all"
          >
            Become a sponsor
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {sponsors.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-ardent-border bg-ardent-card py-16 px-6 text-center">
            <p className="text-gray-500 text-sm">No sponsors added yet.</p>
            <p className="text-gray-600 text-xs mt-1">
              Add sponsors in <span className="text-ardent-bright">/admin → Sponsors</span>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {titleSponsor && (
              <SponsorLogo sponsor={titleSponsor} large />
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {rest.map((sponsor) => (
                <SponsorLogo key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
