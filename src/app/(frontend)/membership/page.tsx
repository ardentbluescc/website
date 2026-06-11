import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Membership | Ardent Blues CC',
  description: 'Join Ardent Blues Cricket Club. Flexible membership tiers from £40/year.',
}

const tiers = [
  {
    category: 'Male',
    plans: [
      { name: 'Adult (18+)', price: 130, per: 'year' },
      { name: 'Junior (Under 18)', price: 40, per: 'year' },
      { name: 'Senior Citizen (55+)', price: 40, per: 'year' },
      { name: 'Student (18–25)', price: 65, per: 'year' },
    ],
  },
  {
    category: 'Female',
    plans: [
      { name: 'Adult (18+)', price: 65, per: 'year' },
      { name: 'Junior (Under 18)', price: 40, per: 'year' },
      { name: 'Senior Citizen (55+)', price: 40, per: 'year' },
      { name: 'Student (18–25)', price: 40, per: 'year' },
    ],
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-ardent/10 border border-ardent/30 rounded-full px-4 py-1.5 text-ardent-bright text-xs font-semibold tracking-wide uppercase mb-6">
            Annual Membership 2025
          </span>
          <h1 className="text-5xl md:text-6xl font-normal text-white mb-5 leading-tight">
            Join Ardent Blues CC
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Choose the membership that fits your journey. All memberships include full club access,
            training, and NCU competition entry.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {tiers.map((tier) => (
            <div key={tier.category} className="bg-ardent-card rounded-2xl border border-ardent-border overflow-hidden">
              <div className="px-6 py-4 border-b border-ardent-border bg-ardent/5">
                <h2 className="text-white font-bold text-lg">{tier.category} Memberships</h2>
              </div>
              <div className="divide-y divide-ardent-border">
                {tier.plans.map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between px-6 py-4 hover:bg-ardent/5 transition-colors">
                    <span className="text-gray-300 text-sm">{plan.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">£{plan.price}</span>
                      <span className="text-gray-500 text-xs">/{plan.per}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Code of conduct notice */}
        <div className="bg-ardent/10 border border-ardent/30 rounded-2xl p-6 mb-10 text-center">
          <p className="text-ardent-bright text-sm font-medium mb-1">📋 Code of Conduct</p>
          <p className="text-gray-400 text-sm">
            All members must review and agree to the{' '}
            <Link href="/code-of-conduct" className="text-ardent-bright underline underline-offset-2">
              Ardent Blues Code of Conduct
            </Link>{' '}
            prior to joining, emphasising fair play and respect.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 bg-ardent hover:bg-ardent-light text-white font-bold px-10 py-4 rounded-full transition-all hover:scale-105 text-base shadow-xl shadow-ardent/25"
          >
            Register Your Interest
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Questions? <Link href="/contact" className="text-ardent-bright hover:underline">Contact us</Link> and we&apos;ll help you get started.
          </p>
        </div>
      </div>
    </div>
  )
}
