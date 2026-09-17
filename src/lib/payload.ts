import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPayloadClient() {
  return getPayload({ config })
}

export async function getNews(limit = 6) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'news',
    limit,
    sort: '-publishedAt',
    where: { status: { equals: 'published' } },
  })
}

export async function getNewsArticle(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function getFixtures(limit = 20) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'fixtures',
    limit,
    sort: 'matchDate',
  })
}

export async function getUpcomingFixtures(limit = 5) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'fixtures',
    limit,
    sort: 'matchDate',
    where: { result: { equals: 'upcoming' } },
  })
}

export async function getTeams() {
  const payload = await getPayloadClient()
  return payload.find({ collection: 'teams', limit: 20 })
}

export async function getPlayer(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'players',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function getPlayers(teamId?: string) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'players',
    limit: 100,
    depth: 1,
    ...(teamId ? { where: { team: { equals: teamId } } } : {}),
  })
}

export async function getGallery(category?: string, limit = 200) {
  const payload = await getPayloadClient()
  const where: Record<string, any> = { showInGallery: { equals: true } }
  if (category) where.category = { equals: category }
  return payload.find({
    collection: 'gallery',
    limit,
    sort: '-year',
    where,
  })
}

export async function getSponsors() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'sponsors',
    limit: 20,
    sort: 'tier',
  })
}

export async function getCommittee() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'committee',
    limit: 50,
    sort: 'order',
  })
}
