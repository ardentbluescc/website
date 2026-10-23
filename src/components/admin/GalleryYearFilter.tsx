'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const BASE = '/admin/collections/gallery'

// One-click year filters above the Gallery list. Drag-and-drop order is global across the whole
// collection, so editors filter to one year and drag within it — the site shows each year's photos
// in that relative order.
function hrefFor(year: number | 'none' | 'all') {
  const params = new URLSearchParams({ sort: '_order', limit: '100' })
  if (year === 'none') params.set('where[year][exists]', 'false')
  else if (year !== 'all') params.set('where[year][equals]', String(year))
  return `${BASE}?${params.toString()}`
}

export default function GalleryYearFilter() {
  const searchParams = useSearchParams()
  const [years, setYears] = useState<number[]>([])
  const [hasNoYear, setHasNoYear] = useState(false)

  useEffect(() => {
    fetch('/api/gallery?limit=1000&depth=0&select[year]=true', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const all: (number | null)[] = (data?.docs ?? []).map((d: any) => d.year ?? null)
        setYears(Array.from(new Set(all.filter((y): y is number => y != null))).sort((a, b) => b - a))
        setHasNoYear(all.some((y) => y == null))
      })
      .catch(() => {})
  }, [])

  const activeYear = searchParams.get('where[year][equals]')
  const activeNone = searchParams.get('where[year][exists]') === 'false'
  const activeAll = !activeYear && !activeNone

  const chip = (label: string, href: string, active: boolean) => (
    <a
      key={label}
      href={href}
      style={{
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 4,
        textDecoration: 'none',
        background: active ? '#1D6EF5' : 'transparent',
        color: active ? '#fff' : 'inherit',
        border: `1px solid ${active ? '#1D6EF5' : '#3a3a3a'}`,
      }}
    >
      {label}
    </a>
  )

  return (
    <div style={{ margin: '0 0 20px', padding: 16, border: '1px solid #2a2a2a', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, opacity: 0.7, marginRight: 6 }}>Arrange year:</span>
        {years.map((y) => chip(String(y), hrefFor(y), activeYear === String(y)))}
        {hasNoYear && chip('No year', hrefFor('none'), activeNone)}
        {chip('All', hrefFor('all'), activeAll)}
      </div>
      <p style={{ fontSize: 12, opacity: 0.6, margin: '10px 0 0' }}>
        Pick a year, then drag photos by the ⠿ handle. The top photo shows first in that year on the website.
      </p>
    </div>
  )
}
