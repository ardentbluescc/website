import Link from 'next/link'

const plans = [
  {
    id: 'junior',
    badge: 'Junior & Students',
    title: 'Rising Star Membership',
    description:
      'Perfect for juniors under 18, students (18–25), and senior citizens (55+). Get full access to training, matches, and club facilities.',
    price: '£40',
    period: '/year',
    features: [
      'Full match participation',
      'Club training sessions',
      'Junior coaching programme',
      'NCU competition entry',
      'Access to club facilities',
    ],
    href: '/membership?plan=junior',
    featured: false,
  },
  {
    id: 'adult',
    badge: 'Most Popular',
    title: 'Full Club Membership',
    description:
      'Our flagship adult membership gives you complete access to the club — all training, senior matches, social events, and more.',
    price: '£130',
    period: '/year',
    features: [
      'All Rising Star benefits',
      'Senior league cricket',
      'Priority team selection',
      'Social events access',
      'Voting rights at AGM',
    ],
    href: '/membership?plan=adult',
    featured: true,
  },
]

export default function MembershipPlans() {
  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Choose the Ideal Membership for Your{' '}
            <span className="text-3xl align-middle">🏏</span> Cricket Journey
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every player&apos;s journey is unique. Choose the membership that suits your goals and
            let us help you grow, improve, and compete along the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 flex flex-col border-2 transition-all ${
                plan.featured
                  ? 'bg-ardent border-ardent-light shadow-2xl shadow-ardent/20'
                  : 'bg-ardent-card border-ardent-border hover:border-ardent/40'
              }`}
            >
              {/* Badge */}
              <div className="mb-5">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                    plan.featured ? 'bg-white/20 text-white' : 'bg-ardent/15 text-ardent-bright'
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              {/* Avatar stack */}
              <div className="flex -space-x-2 mb-5">
                {['A', 'B', 'C', 'D'].map((l) => (
                  <div
                    key={l}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${
                      plan.featured
                        ? 'bg-white/20 text-white ring-ardent'
                        : 'bg-ardent/25 text-ardent-bright ring-ardent-card'
                    }`}
                  >
                    {l}
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">{plan.title}</h3>
              <p
                className={`text-sm leading-relaxed mb-6 ${
                  plan.featured ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {plan.description}
              </p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.featured ? 'text-white' : 'text-ardent-light'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={`text-sm ${plan.featured ? 'text-blue-100' : 'text-gray-400'}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span
                    className={`text-sm ml-1 ${plan.featured ? 'text-blue-100' : 'text-gray-500'}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <Link
                  href={plan.href}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                    plan.featured
                      ? 'bg-white text-ardent shadow-lg hover:bg-blue-50'
                      : 'bg-ardent text-white hover:bg-ardent-light shadow-lg shadow-ardent/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Female membership note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Female adult membership available at{' '}
          <span className="text-ardent-bright font-semibold">£65/year</span>. Contact us for student pricing.
        </p>
      </div>
    </section>
  )
}
