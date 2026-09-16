'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { JOIN_MAILTO } from '@/lib/contact'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Teams', href: '/teams' },
  { label: 'Fixtures', href: '/fixtures' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  { label: 'Sponsors', href: '/sponsors' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-lg border-b border-ardent-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Ardent Blues Cricket Club"
            width={44}
            height={44}
            className="rounded-full drop-shadow-lg"
            priority
          />
          <span className="text-white font-semibold text-base hidden sm:block">
            Ardent Blues <span className="text-ardent-light">CC</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={JOIN_MAILTO}
            className="hidden sm:inline-flex items-center gap-2 bg-ardent hover:bg-ardent-light text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-ardent/20"
          >
            Join Now
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ardent-border/30 bg-navy-900/95 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-300 hover:text-white text-sm font-medium py-1"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <a
              href={JOIN_MAILTO}
              className="text-gray-300 hover:text-white text-sm font-medium py-1"
              onClick={() => setOpen(false)}
            >
              Join Now
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
