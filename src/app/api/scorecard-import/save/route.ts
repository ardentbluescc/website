import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseBalls(overs: number): number {
  const full = Math.floor(overs)
  const partial = Math.round((overs - full) * 10)
  return full * 6 + partial
}

/** Returns the better bowling figures string (more wickets; fewer runs on tie). */
function betterBB(a: string, b: string): string {
  if (!a || a === '-') return b || '-'
  if (!b || b === '-') return a
  const [aw, ar] = a.split('/').map(Number)
  const [bw, br] = b.split('/').map(Number)
  if (bw > aw) return b
  if (bw === aw && br < ar) return b
  return a
}

// ── Batting merge ─────────────────────────────────────────────────────────────
// existing = current row for this format (null → first time)
// newMatch = the single-match batting data sent from the UI

function mergeBatting(existing: any | null, nm: any, format: string, matchId: string | null) {
  // Player counts as having batted whenever they actually appear in the batting card
  // (even for a duck they faced balls). A pure fielder (catch/stumping/run-out only,
  // no batting/bowling card entry) is flagged fieldingOnly — they still count toward
  // matches played, but must not touch innings/runs/balls/average.
  const didBat   = !nm.fieldingOnly
  const newRuns  = didBat ? (nm.runs  ?? 0) : 0
  const newBalls = didBat ? (nm.balls ?? 0) : 0
  const newFours = didBat ? (nm.fours ?? 0) : 0
  const newSixes = didBat ? (nm.sixes ?? 0) : 0
  const newNO    = didBat && nm.notOut ? 1 : 0
  const newCatches   = nm.catches   ?? 0
  const newStumpings = nm.stumpings ?? 0
  const newRunOuts   = nm.runOuts   ?? 0

  const importedMatchIds: string[] = existing?.importedMatchIds ?? []
  if (matchId && importedMatchIds.includes(matchId)) return { ...existing, skipped: true }
  const nextImportedMatchIds = matchId ? [...importedMatchIds, matchId] : importedMatchIds

  if (!existing) {
    const dismissals = didBat ? (1 - newNO) : 0
    return {
      format,
      matches:    1,
      innings:    didBat ? 1 : 0,
      notOut:     newNO,
      runs:       newRuns,
      balls:      newBalls,
      highScore:  didBat ? (newNO ? `${newRuns}*` : `${newRuns}`) : '-',
      average:    dismissals > 0 ? newRuns : null,
      strikeRate: newBalls > 0 ? parseFloat(((newRuns / newBalls) * 100).toFixed(2)) : null,
      hundreds:   didBat && newRuns >= 100 ? 1 : 0,
      fifties:    didBat && newRuns >= 50 && newRuns < 100 ? 1 : 0,
      fours:      newFours,
      sixes:      newSixes,
      catches:    newCatches,
      stumpings:  newStumpings,
      runOuts:    newRunOuts,
      importedMatchIds: nextImportedMatchIds,
    }
  }

  // ── Accumulate ──
  const totMatches = (existing.matches ?? 0) + 1
  const totInnings = (existing.innings ?? 0) + (didBat ? 1 : 0)
  const totNO      = (existing.notOut  ?? 0) + newNO
  const totRuns    = (existing.runs    ?? 0) + newRuns
  const totBalls   = (existing.balls   ?? 0) + newBalls  // may be 0 if old rows pre-date this field
  const totFours   = (existing.fours   ?? 0) + newFours
  const totSixes   = (existing.sixes   ?? 0) + newSixes
  const totCatches   = (existing.catches   ?? 0) + newCatches
  const totStumpings = (existing.stumpings ?? 0) + newStumpings
  const totRunOuts   = (existing.runOuts   ?? 0) + newRunOuts

  // ── High score: keep running maximum, preserve * if HS was a not-out (batters only) ──
  const existNum  = parseInt(String(existing.highScore ?? '0').replace('*', '')) || 0
  const existNO   = String(existing.highScore ?? '').endsWith('*')
  let highScore: string
  if (!didBat) {
    highScore = existing.highScore ?? '-'
  } else if (newRuns > existNum) {
    highScore = newNO ? `${newRuns}*` : `${newRuns}`
  } else if (newRuns === existNum && newNO && !existNO) {
    highScore = `${newRuns}*`   // same score but this innings was not out — mark it
  } else {
    highScore = String(existing.highScore ?? newRuns)
  }

  const dismissals = totInnings - totNO
  const average    = dismissals > 0 ? parseFloat((totRuns / dismissals).toFixed(2)) : null
  // SR: use accumulated balls when available, otherwise keep existing SR as-is
  const strikeRate = totBalls > 0
    ? parseFloat(((totRuns / totBalls) * 100).toFixed(2))
    : (existing.strikeRate ?? null)

  return {
    format,
    matches:    totMatches,
    innings:    totInnings,
    notOut:     totNO,
    runs:       totRuns,
    balls:      totBalls,
    highScore,
    average,
    strikeRate,
    hundreds:   (existing.hundreds  ?? 0) + (didBat && newRuns >= 100 ? 1 : 0),
    fifties:    (existing.fifties   ?? 0) + (didBat && newRuns >= 50 && newRuns < 100 ? 1 : 0),
    fours:      totFours,
    sixes:      totSixes,
    catches:    totCatches,
    stumpings:  totStumpings,
    runOuts:    totRunOuts,
    importedMatchIds: nextImportedMatchIds,
  }
}

// ── Bowling merge ─────────────────────────────────────────────────────────────

function mergeBowling(existing: any | null, nm: any, format: string, matchId: string | null) {
  const overs    = nm.overs ?? 0
  const newBalls = parseBalls(overs)
  const newWkts  = nm.wickets  ?? 0
  const newRuns  = nm.runs     ?? 0
  const didBowl  = newBalls > 0
  const newBB    = newWkts > 0 ? `${newWkts}/${newRuns}` : '-'

  const importedMatchIds: string[] = existing?.importedMatchIds ?? []
  if (matchId && importedMatchIds.includes(matchId)) return { ...existing, skipped: true }
  const nextImportedMatchIds = matchId ? [...importedMatchIds, matchId] : importedMatchIds

  if (!existing) {
    const totOvers = newBalls / 6
    return {
      format,
      matches:     1,
      innings:     didBowl ? 1 : 0,
      balls:       newBalls,
      runs:        newRuns,
      wickets:     newWkts,
      bestBowling: newBB,
      average:     newWkts > 0 ? parseFloat((newRuns / newWkts).toFixed(2)) : null,
      economy:     totOvers > 0 ? parseFloat((newRuns / totOvers).toFixed(2)) : null,
      strikeRate:  newWkts > 0 && newBalls > 0 ? parseFloat((newBalls / newWkts).toFixed(2)) : null,
      fourWickets: newWkts === 4 ? 1 : 0,
      fiveWickets: newWkts >= 5 ? 1 : 0,
      importedMatchIds: nextImportedMatchIds,
    }
  }

  const totMatches = (existing.matches  ?? 0) + 1
  const totInnings = (existing.innings  ?? 0) + (didBowl ? 1 : 0)
  const totBalls   = (existing.balls    ?? 0) + newBalls
  const totRuns    = (existing.runs     ?? 0) + newRuns
  const totWkts    = (existing.wickets  ?? 0) + newWkts
  const totOvers   = totBalls / 6

  return {
    format,
    matches:     totMatches,
    innings:     totInnings,
    balls:       totBalls,
    runs:        totRuns,
    wickets:     totWkts,
    bestBowling: betterBB(existing.bestBowling ?? '-', newBB),
    average:     totWkts > 0 ? parseFloat((totRuns / totWkts).toFixed(2)) : null,
    economy:     totOvers > 0 ? parseFloat((totRuns / totOvers).toFixed(2)) : null,
    strikeRate:  totWkts > 0 && totBalls > 0 ? parseFloat((totBalls / totWkts).toFixed(2)) : null,
    fourWickets: (existing.fourWickets ?? 0) + (newWkts === 4 ? 1 : 0),
    fiveWickets: (existing.fiveWickets ?? 0) + (newWkts >= 5 ? 1 : 0),
    importedMatchIds: nextImportedMatchIds,
  }
}

// ── Match log (Recent Form) ───────────────────────────────────────────────────
// One row per match, independent of the battingStats/bowlingStats aggregates above.

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
    runsConceded: didBowl ? (entryBowling.runs ?? 0) : null,
    wickets: didBowl ? (entryBowling.wickets ?? 0) : null,
    catches: entryBatting?.catches ?? 0,
    stumpings: entryBatting?.stumpings ?? 0,
    runOuts: entryBatting?.runOuts ?? 0,
  }
}

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
