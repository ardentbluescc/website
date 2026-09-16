import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

const LEGACY_GROUPS = [
  { value: 'group-1', name: 'Group 1', order: 1 },
  { value: 'group-2', name: 'Group 2', order: 2 },
  { value: 'group-3', name: 'Group 3', order: 3 },
  { value: 'group-4', name: 'Group 4', order: 4 },
  { value: 'group-5', name: 'Group 5', order: 5 },
]

// One-time migration: ensures Group 1-5 exist as real `groups` documents, then links
// each player's new `groupTier` relationship from their old `group` select value.
export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'You must be logged in to run this.' }, { status: 401 })

    const idByLegacyValue = new Map<string, string>()
    for (const g of LEGACY_GROUPS) {
      const { docs } = await payload.find({ collection: 'groups', where: { name: { equals: g.name } }, limit: 1 })
      if (docs[0]) {
        idByLegacyValue.set(g.value, String(docs[0].id))
      } else {
        const created = await payload.create({ collection: 'groups', data: { name: g.name, order: g.order } })
        idByLegacyValue.set(g.value, String(created.id))
      }
    }

    const { docs: players } = await payload.find({ collection: 'players', limit: 1000, depth: 0 })
    let migrated = 0
    for (const p of players as any[]) {
      if (p.group && !p.groupTier && idByLegacyValue.has(p.group)) {
        await payload.update({ collection: 'players', id: p.id, data: { groupTier: idByLegacyValue.get(p.group) } })
        migrated++
      }
    }

    return NextResponse.json({ groupsEnsured: LEGACY_GROUPS.length, playersChecked: players.length, migrated })
  } catch (err: any) {
    console.error('[players/migrate-groups]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
