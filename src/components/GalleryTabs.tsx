'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const categoryLabel: Record<string, string> = {
  'match-day': 'Match Day',
  training: 'Training',
  'team-photo': 'Team Photo',
  event: 'Event',
}

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: any[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}) {
  const photo = photos[index]

  const goPrev = () => onNavigate((index - 1 + photos.length) % photos.length)
  const goNext = () => onNavigate((index + 1) % photos.length)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative w-full max-w-5xl h-[75vh] sm:h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.url ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? ''}
            fill
            unoptimized
            className="object-contain"
            sizes="90vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl select-none">🏏</span>
          </div>
        )}
      </div>

      {(photo.caption || photo.category) && (
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.category && (
            <span className="text-xs text-ardent-bright font-medium block mb-0.5">
              {categoryLabel[photo.category] ?? photo.category}
            </span>
          )}
          {photo.caption && <p className="text-gray-300 text-sm">{photo.caption}</p>}
        </div>
      )}

      {photos.length > 1 && (
        <span className="absolute top-4 sm:top-6 left-4 sm:left-6 text-gray-400 text-xs font-medium">
          {index + 1} / {photos.length}
        </span>
      )}
    </div>
  )
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
            onClick={() => {
              setActiveYear('all')
              setLightboxIndex(null)
            }}
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
              onClick={() => {
                setActiveYear(year)
                setLightboxIndex(null)
              }}
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
        {visible.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="break-inside-avoid bg-ardent-card border border-ardent-border overflow-hidden hover:border-ardent/40 transition-all group block w-full text-left cursor-pointer"
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
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={visible}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
