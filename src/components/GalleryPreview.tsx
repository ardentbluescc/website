import Image from 'next/image'
import Link from 'next/link'

export default function GalleryPreview({ photos }: { photos: any[] }) {
  const hasPhotos = photos.length > 0

  // Assign layout slots: first photo is large (2×2), rest fill a grid
  const featured = photos[0]
  const rest = photos.slice(1, 7)

  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight">
              Life at<br /><span className="text-ardent">Ardent Blues</span>
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 px-5 py-2.5 rounded-full transition-all"
          >
            View all photos
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {!hasPhotos ? (
          /* Empty state */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl bg-ardent-card border border-ardent-border flex items-center justify-center ${
                  i === 0 ? 'aspect-square sm:col-span-2 sm:row-span-2' : 'aspect-square'
                }`}
              >
                <div className="text-center px-4">
                  {i === 0 ? (
                    <>
                      <div className="text-5xl mb-3 opacity-20">🏏</div>
                      <p className="text-gray-500 text-xs">Upload photos in<br /><span className="text-ardent-bright">/admin → Gallery</span></p>
                    </>
                  ) : (
                    <div className="text-2xl opacity-10">🏏</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Photo grid — featured large + rest small */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">

            {/* Featured photo — spans 2 cols × 2 rows */}
            {featured && (
              <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group border border-ardent-border/50">
                {featured.url ? (
                  <Image
                    src={featured.url}
                    alt={featured.alt || 'Gallery photo'}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d2a5c] to-[#1a4080] flex items-center justify-center">
                    <span className="text-6xl select-none">🏏</span>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {featured.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium">{featured.caption}</p>
                  </div>
                )}
              </div>
            )}

            {/* Remaining photos — each span 1×1 */}
            {rest.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-2xl overflow-hidden group border border-ardent-border/50"
              >
                {photo.url ? (
                  <Image
                    src={photo.url}
                    alt={photo.alt || 'Gallery photo'}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d2a5c] to-[#1a4080] flex items-center justify-center">
                    <span className="text-3xl select-none">🏏</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-xs font-medium line-clamp-1">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}

            {/* "View all" card */}
            <Link
              href="/gallery"
              className="relative rounded-2xl overflow-hidden border border-ardent/30 bg-ardent/10 hover:bg-ardent/20 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-full border border-ardent/40 flex items-center justify-center group-hover:bg-ardent transition-colors">
                <svg className="w-5 h-5 text-ardent-bright group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <span className="text-ardent-bright text-xs font-semibold text-center leading-tight">
                View all<br />photos
              </span>
            </Link>

          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link href="/gallery" className="text-sm text-ardent-bright font-medium">
            View full gallery →
          </Link>
        </div>

      </div>
    </section>
  )
}
