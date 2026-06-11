import type { Metadata } from 'next'
import { getGallery } from '@/lib/payload'
import GalleryTabs from '@/components/GalleryTabs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gallery | Ardent Blues CC',
  description: 'Photos and media from Ardent Blues Cricket Club.',
}

export default async function GalleryPage() {
  const { docs: photos } = await getGallery()

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-none tracking-tight mb-4">
          Gallery &amp; Media
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Match day moments, training sessions, and club highlights.
        </p>
        <GalleryTabs photos={photos} />
      </div>
    </div>
  )
}
