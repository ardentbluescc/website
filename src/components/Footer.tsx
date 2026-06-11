import Link from 'next/link'

const links = {
  Club: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'News', href: '/news' },
    { label: 'Gallery', href: '/gallery' },
  ],
  Teams: [
    { label: 'Senior Men', href: '/teams' },
    { label: 'Junior Teams', href: '/teams' },
    { label: 'Fixtures', href: '/fixtures' },
    { label: 'Results', href: '/fixtures' },
  ],
  Members: [
    { label: 'Join Now', href: '/membership' },
    { label: 'Sponsors', href: '/sponsors' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Code of Conduct', href: '/code-of-conduct' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-ardent-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand col */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-ardent flex items-center justify-center shadow-lg shadow-ardent/30">
                <span className="text-white font-black text-sm">AB</span>
              </div>
              <span className="text-white font-semibold">
                Ardent Blues <span className="text-ardent-light">CC</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              A relentless spirit. Driven by passion, grows skills, and ignites love of cricket in
              every player. Est. 2023, Belfast.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'Facebook', short: 'f', href: 'https://facebook.com' },
                { label: 'Instagram', short: 'in', href: 'https://instagram.com' },
                { label: 'X', short: 'x', href: 'https://x.com' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-ardent-card border border-ardent-border flex items-center justify-center text-gray-400 hover:text-white hover:border-ardent transition-all text-xs font-bold uppercase"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-white font-semibold text-sm mb-4">{cat}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ardent-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">
            Copyright © {new Date().getFullYear()}{' '}
            <span className="text-gray-500">Ardent Blues CC</span>. All Rights Reserved.
          </p>
          <p className="text-gray-600 text-sm">Northern Cricket Union — Official Member Club</p>
        </div>
      </div>

      {/* Big watermark text */}
      <div className="overflow-hidden select-none pointer-events-none">
        <p className="text-[8rem] md:text-[14rem] font-black text-white/[0.025] leading-none text-center pb-2">
          ARDENT BLUES
        </p>
      </div>
    </footer>
  )
}
