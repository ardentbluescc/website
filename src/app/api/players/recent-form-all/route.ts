import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildMatchLogEntry, deriveFormat, mergeBatting, mergeBowling } from '@/lib/player-stats-merge'

export const maxDuration = 300

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
// Updates matchLog (Recent Form / By Competition), and also merges into battingStats /
// bowlingStats per competition+year, using the same merge logic as the scorecard-image
// import so both entry points keep the aggregated career tables consistent.
export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'You must be logged in to use this tool.' }, { status: 401 })

    const origin = new URL(req.url).origin
    const { docs: players } = await payload.find({ collection: 'players', limit: 500, depth: 0 })
    const playerById = new Map<string, any>((players as any[]).map((p) => [String(p.id), p]))

    const matchLogByPlayer = new Map<string, any[]>()
    const existingMatchIdsByPlayer = new Map<string, Set<string>>()
    const battingByPlayer = new Map<string, Map<string, any>>()
    const bowlingByPlayer = new Map<string, Map<string, any>>()
    const changedPlayers = new Set<string>()

    for (const p of players as any[]) {
      const pid = String(p.id)
      matchLogByPlayer.set(pid, [...(p.matchLog ?? [])])
      existingMatchIdsByPlayer.set(pid, new Set((p.matchLog ?? []).map((m: any) => m.matchId)))
      battingByPlayer.set(pid, new Map((p.battingStats ?? []).map((r: any) => [r.format, r])))
      bowlingByPlayer.set(pid, new Map((p.bowlingStats ?? []).map((r: any) => [r.format, r])))
    }

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

          const format = deriveFormat(sc.matchInfo?.competition, sc.matchInfo?.date)

          for (const [playerId, entry] of byPlayerId) {
            if (!playerById.has(playerId)) continue

            // Match log — one row per match, independent of the aggregates below.
            const logIds = existingMatchIdsByPlayer.get(playerId)!
            if (!logIds.has(m.matchId)) {
              const row = buildMatchLogEntry(entry.batting, entry.bowling, sc.matchInfo)
              matchLogByPlayer.get(playerId)!.push(row)
              logIds.add(m.matchId)
              changedPlayers.add(playerId)
            }

            // Aggregated battingStats / bowlingStats, grouped by competition + year.
            if (format) {
              if (entry.batting) {
                const bMap = battingByPlayer.get(playerId)!
                const merged = mergeBatting(bMap.get(format) ?? null, entry.batting, format, m.matchId)
                if (!merged.skipped) {
                  bMap.set(format, merged)
                  changedPlayers.add(playerId)
                }
              }
              if (entry.bowling) {
                const wMap = bowlingByPlayer.get(playerId)!
                const merged = mergeBowling(wMap.get(format) ?? null, entry.bowling, format, m.matchId)
                if (!merged.skipped) {
                  wMap.set(format, merged)
                  changedPlayers.add(playerId)
                }
              }
            }
          }
        } catch {
          errors++
        }
      })
    }

    let playersUpdated = 0
    for (const playerId of changedPlayers) {
      await payload.update({
        collection: 'players',
        id: playerId,
        data: {
          matchLog: matchLogByPlayer.get(playerId),
          battingStats: Array.from(battingByPlayer.get(playerId)!.values()),
          bowlingStats: Array.from(bowlingByPlayer.get(playerId)!.values()),
        },
      })
      playersUpdated++
    }

    return NextResponse.json({ totalMatches: allMatches.length, checked, errors, playersUpdated })
  } catch (err: any) {
    console.error('[players/recent-form-all]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
