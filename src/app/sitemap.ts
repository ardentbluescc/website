import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://abcca-xpnt.vercel.app'

const staticRoutes = [
  '',
  '/news',
  '/teams',
  '/fixtures',
  '/gallery',
  '/contact',
  '/faq',
  '/committee',
  '/code-of-conduct',
  '/privacy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const [{ docs: news }, { docs: players }] = await Promise.all([
    payload.find({ collection: 'news', limit: 500, where: { status: { equals: 'published' } } }),
    payload.find({ collection: 'players', limit: 500 }),
  ])

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))

  const newsEntries: MetadataRoute.Sitemap = news
    .filter((doc: any) => doc.slug)
    .map((doc: any) => ({
      url: `${SITE_URL}/news/${doc.slug}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    }))

  const playerEntries: MetadataRoute.Sitemap = players
    .filter((doc: any) => doc.slug)
    .map((doc: any) => ({
      url: `${SITE_URL}/players/${doc.slug}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    }))

  return [...staticEntries, ...newsEntries, ...playerEntries]
}
