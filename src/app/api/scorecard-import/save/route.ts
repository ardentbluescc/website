import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mergeBatting, mergeBowling, buildMatchLogEntry } from '@/lib/player-stats-merge'

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to use this tool.' }, { status: 401 })
    }

    const body = await req.json()
    const { format, entries, matchId, matchInfo } = body as {
      format: string
      entries: Array<{ playerId: string; batting?: any; bowling?: any }>
      matchId?: string | null
      matchInfo?: any | null
    }

    if (!format?.trim()) {
      return NextResponse.json({ error: 'Format/competition name is required.' }, { status: 400 })
    }
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const entry of entries) {
      try {
        const current = await payload.findByID({ collection: 'players', id: entry.playerId, depth: 0 }) as any
        const updates: Record<string, any> = {}
        let entrySkipped = false

        // ── Batting: find existing row for this format and merge, or create ──
        if (entry.batting) {
          const existingRows: any[] = current.battingStats ?? []
          const idx = existingRows.findIndex((r: any) => r.format === format)
          const merged = mergeBatting(idx >= 0 ? existingRows[idx] : null, entry.batting, format, matchId ?? null)
          if (merged.skipped) {
            entrySkipped = true
          } else {
            const nextRows = [...existingRows]
            if (idx >= 0) nextRows[idx] = merged
            else nextRows.push(merged)
            updates.battingStats = nextRows
          }
        }

        // ── Bowling: same pattern ──
        if (entry.bowling) {
          const existingRows: any[] = current.bowlingStats ?? []
          const idx = existingRows.findIndex((r: any) => r.format === format)
          const merged = mergeBowling(idx >= 0 ? existingRows[idx] : null, entry.bowling, format, matchId ?? null)
          if (merged.skipped) {
            entrySkipped = true
          } else {
            const nextRows = [...existingRows]
            if (idx >= 0) nextRows[idx] = merged
            else nextRows.push(merged)
            updates.bowlingStats = nextRows
          }
        }

        // ── Match log: one additional row per match, independent of the aggregates above ──
        if (matchId && matchInfo) {
          const existingLog: any[] = current.matchLog ?? []
          if (!existingLog.some((r: any) => r.matchId === matchId)) {
            updates.matchLog = [...existingLog, buildMatchLogEntry(entry.batting, entry.bowling, matchInfo)]
          }
        }

        if (Object.keys(updates).length > 0) {
          await payload.update({ collection: 'players', id: entry.playerId, data: updates })
          updated++
        } else if (entrySkipped) {
          skipped++
        }
      } catch (e: any) {
        errors.push(`Player ${entry.playerId}: ${e.message}`)
      }
    }

    return NextResponse.json({ success: true, updated, skipped, errors })
  } catch (err: any) {
    console.error('[scorecard-import/save]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
