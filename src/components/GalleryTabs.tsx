'use client'

import { useState } from 'react'
import Image from 'next/image'

const categoryLabel: Record<string, string> = {
  'match-day': 'Match Day',
  training: 'Training',
  'team-photo': 'Team Photo',
  event: 'Event',
}

export default function GalleryTabs({ photos }: { photos: any[] }) {
  // Build sorted unique years (newest first), null-year photos go under "Other"
  const years = Array.from(
    new Set(photos.map(p => p.year ?? null))
  ).sort((a, b) => {
    if (a === null) return 1
    if (b === null) return -1
    return b - a
  })

  const [activeYear, setActiveYear] = useState<number | null | 'all'>('all')

  const visible = activeYear === 'all'
    ? photos
    : photos.filter(p => (p.year ?? null) === activeYear)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-ardent-card border border-ardent-border gap-2">
        <p className="text-gray-500 text-sm font-semibold">No gallery photos yet</p>
        <p className="text-gray-600 text-xs">
          Go to <span className="text-ardent-bright">/admin → Gallery</span>, upload an image and tick &quot;Show in Gallery&quot;.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Year tabs */}
      {years.length > 0 && (
        <div className="flex gap-1 mb-8 border-b border-ardent-border overflow-x-auto">
          <button
            onClick={() => setActiveYear('all')}
            className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeYear === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All
            {activeYear === 'all' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent" />
            )}
          </button>
          {years.map(year => (
            <button
              key={year ?? 'other'}
              onClick={() => setActiveYear(year)}
              className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeYear === year ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {year ?? 'Other'}
              {activeYear === year && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {visible.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid bg-ardent-card border border-ardent-border overflow-hidden hover:border-ardent/40 transition-all group"
          >
            {photo.url ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-[#0d2b5e] to-[#1a4080] flex items-center justify-center">
                <span className="text-4xl select-none">🏏</span>
              </div>
            )}
            {(photo.caption || photo.category) && (
              <div className="px-3 py-2">
                {photo.category && (
                  <span className="text-[10px] text-ardent-bright font-medium">
                    {categoryLabel[photo.category] ?? photo.category}
                  </span>
                )}
                {photo.caption && (
                  <p className="text-gray-400 text-xs mt-0.5 leading-tight">{photo.caption}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
