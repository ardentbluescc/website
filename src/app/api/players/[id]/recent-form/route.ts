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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'You must be logged in to use this tool.' }, { status: 401 })

    const { id } = await params
    const player = (await payload.findByID({ collection: 'players', id, depth: 0 }).catch(() => null)) as any
    if (!player) return NextResponse.json({ error: 'Player not found.' }, { status: 404 })

    const origin = new URL(req.url).origin
    const matchesRes = await fetchWithTimeout(`${origin}/api/nvplay/matches`, 30000)
    if (!matchesRes.ok) return NextResponse.json({ error: 'Could not reach NV Play.' }, { status: 502 })
    const matchesJson = await matchesRes.json()
    // All seasons NV Play makes available (not just the current year) — powers the year tabs on the player page.
    const allMatches = matchesJson.results ?? []

    let currentLog: any[] = player.matchLog ?? []
    const existingIds = new Set(currentLog.map((r: any) => r.matchId))
    const battingByFormat = new Map<string, any>((player.battingStats ?? []).map((r: any) => [r.format, r]))
    const bowlingByFormat = new Map<string, any>((player.bowlingStats ?? []).map((r: any) => [r.format, r]))
    const toCheck = allMatches.filter((m: any) => !existingIds.has(m.matchId))

    const BATCH_SIZE = 40
    let totalAdded = 0
    let errors = 0

    // Batched + written incrementally: if this ever gets cut off mid-run (serverless
    // time limit), only the current batch's progress is lost, not the whole scan.
    for (let i = 0; i < toCheck.length; i += BATCH_SIZE) {
      const batch = toCheck.slice(i, i + BATCH_SIZE)
      let batchChanged = false

      await mapWithConcurrency(batch, 10, async (m: any) => {
        try {
          const scRes = await fetchWithTimeout(`${origin}/api/nvplay/scorecard?matchId=${encodeURIComponent(m.matchId)}`, 15000)
          if (!scRes.ok) return
          const sc = await scRes.json()
          const bat = (sc.batting ?? []).find((b: any) => String(b.selectedPlayerId) === String(id))
          const bowl = (sc.bowling ?? []).find((b: any) => String(b.selectedPlayerId) === String(id))
          if (!bat && !bowl) return

          currentLog = [...currentLog, buildMatchLogEntry(bat, bowl, sc.matchInfo)]
          totalAdded++
          batchChanged = true

          const format = deriveFormat(sc.matchInfo?.competition, sc.matchInfo?.date)
          if (format) {
            if (bat) {
              const merged = mergeBatting(battingByFormat.get(format) ?? null, bat, format, m.matchId)
              if (!merged.skipped) battingByFormat.set(format, merged)
            }
            if (bowl) {
              const merged = mergeBowling(bowlingByFormat.get(format) ?? null, bowl, format, m.matchId)
              if (!merged.skipped) bowlingByFormat.set(format, merged)
            }
          }
        } catch {
          errors++
        }
      })

      if (batchChanged) {
        await payload.update({
          collection: 'players',
          id,
          data: {
            matchLog: currentLog,
            battingStats: Array.from(battingByFormat.values()),
            bowlingStats: Array.from(bowlingByFormat.values()),
          },
        })
      }
    }

    return NextResponse.json({ checked: toCheck.length, added: totalAdded, errors })
  } catch (err: any) {
    console.error('[players/recent-form]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
