'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ScorecardNavLink() {
  const pathname = usePathname()
  const active = pathname === '/admin/scorecard-import'

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <Link
        href="/admin/scorecard-import"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: 0,
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          color: active ? '#60A5FA' : '#94a3b8',
          background: active ? 'rgba(29,110,245,0.12)' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Scorecard Import
      </Link>
    </div>
  )
}
