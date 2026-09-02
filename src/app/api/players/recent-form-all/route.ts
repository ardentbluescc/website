import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const maxDuration = 800

function buildMatchLogEntry(entryBatting: any | undefined, entryBowling: any | undefined, matchInfo: any) {
  const didBat  = !!entryBatting && !entryBatting.fieldingOnly
  const didBowl = !!entryBowling
  return {
    matchId: matchInfo.matchId,
    date: matchInfo.date ?? null,
    competition: matchInfo.competition ?? null,
    teamLabel: matchInfo.teamLabel ?? null,
    opponent: matchInfo.opponent ?? null,
    result: matchInfo.result ?? null,
    didBat,
    runs: didBat ? (entryBatting.runs ?? 0) : null,
    balls: didBat ? (entryBatting.balls ?? 0) : null,
    notOut: didBat ? !!entryBatting.notOut : false,
    didBowl,
    overs: didBowl ? (entryBowling.overs ?? 0) : null,
    maidens: didBowl ? (entryBowling.maidens ?? 0) : null,
    runsConceded: didBowl ? (entryBowling.runs ?? 0) : null,
    wickets: didBowl ? (entryBowling.wickets ?? 0) : null,
    catches: entryBatting?.catches ?? 0,
    stumpings: entryBatting?.stumpings ?? 0,
    runOuts: entryBatting?.runOuts ?? 0,
  }
}

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// Bulk version of /api/players/[id]/recent-form — fetches every NV Play match ONCE and
// applies it to every matched player, instead of re-fetching the same match once per player.
export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'You must be logged in to use this tool.' }, { status: 401 })

    const origin = new URL(req.url).origin
    const { docs: players } = await payload.find({ collection: 'players', limit: 500, depth: 0 })
    const playerById = new Map<string, any>((players as any[]).map((p) => [String(p.id), p]))
    const existingIdsByPlayer = new Map<string, Set<string>>(
      (players as any[]).map((p) => [String(p.id), new Set((p.matchLog ?? []).map((m: any) => m.matchId))])
    )
    const newRowsByPlayer = new Map<string, any[]>()

    const matchesRes = await fetchWithTimeout(`${origin}/api/nvplay/matches`, 30000)
    if (!matchesRes.ok) return NextResponse.json({ error: 'Could not reach NV Play.' }, { status: 502 })
    const matchesJson = await matchesRes.json()
    const allMatches: any[] = matchesJson.results ?? []

    const BATCH_SIZE = 40
    let checked = 0
    let errors = 0

    for (let i = 0; i < allMatches.length; i += BATCH_SIZE) {
      const batch = allMatches.slice(i, i + BATCH_SIZE)

      await mapWithConcurrency(batch, 10, async (m: any) => {
        checked++
        try {
          const scRes = await fetchWithTimeout(`${origin}/api/nvplay/scorecard?matchId=${encodeURIComponent(m.matchId)}`, 15000)
          if (!scRes.ok) return
          const sc = await scRes.json()

          const byPlayerId = new Map<string, { batting?: any; bowling?: any }>()
          for (const b of sc.batting ?? []) {
            if (!b.selectedPlayerId) continue
            byPlayerId.set(String(b.selectedPlayerId), { ...byPlayerId.get(String(b.selectedPlayerId)), batting: b })
          }
          for (const bw of sc.bowling ?? []) {
            if (!bw.selectedPlayerId) continue
            byPlayerId.set(String(bw.selectedPlayerId), { ...byPlayerId.get(String(bw.selectedPlayerId)), bowling: bw })
          }

          for (const [playerId, entry] of byPlayerId) {
            if (!playerById.has(playerId)) continue
            const existingIds = existingIdsByPlayer.get(playerId)!
            if (existingIds.has(m.matchId)) continue
            const row = buildMatchLogEntry(entry.batting, entry.bowling, sc.matchInfo)
            if (!newRowsByPlayer.has(playerId)) newRowsByPlayer.set(playerId, [])
            newRowsByPlayer.get(playerId)!.push(row)
            existingIds.add(m.matchId)
          }
        } catch {
          errors++
        }
      })
    }

    let playersUpdated = 0
    let totalRowsAdded = 0
    for (const [playerId, rows] of newRowsByPlayer) {
      const player = playerById.get(playerId)
      const nextLog = [...(player.matchLog ?? []), ...rows]
      await payload.update({ collection: 'players', id: playerId, data: { matchLog: nextLog } })
      playersUpdated++
      totalRowsAdded += rows.length
    }

    return NextResponse.json({ totalMatches: allMatches.length, checked, errors, playersUpdated, totalRowsAdded })
  } catch (err: any) {
    console.error('[players/recent-form-all]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
