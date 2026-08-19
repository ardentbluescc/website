import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

const NV_BASE = 'https://w-api.cdn.nvplay.net/api/scorecard'

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ')
}

function cleanName(name: string) {
  // Remove captain (*), keeper (†‡), and any trailing symbols
  return name.replace(/[†‡*†‡]+/g, '').trim()
}

function matchPlayer(scorecardName: string, players: any[]): any | null {
  const sn = normalize(scorecardName)
  const snParts = sn.split(' ').filter(Boolean)

  // 1. Exact full-name match.
  const exact = players.filter(p => normalize(p.name) === sn)
  if (exact.length === 1) return exact[0]

  // 2. Substring containment — one full name entirely contains the other
  //    (handles minor punctuation/suffix differences).
  const contained = players.filter(p => {
    const pn = normalize(p.name)
    return pn.includes(sn) || sn.includes(pn)
  })
  if (contained.length === 1) return contained[0]

  // 3. Initial + last name, e.g. "A. Smith" -> "Adam Smith" — specific enough to trust
  //    since both the initial and the rest of the name have to line up.
  if (snParts[0]?.length === 1 && snParts.length > 1) {
    const initial = snParts[0]
    const rest = snParts.slice(1).join(' ')
    const initialMatches = players.filter(p => {
      const pParts = normalize(p.name).split(' ')
      return pParts[0]?.[0] === initial && pParts.slice(1).join(' ').includes(rest)
    })
    if (initialMatches.length === 1) return initialMatches[0]
  }

  // Deliberately NOT matching on last-name-only or first-name-only: shared surnames
  // (e.g. "Nair", "Varghese") are common enough in this squad that those heuristics
  // silently attribute stats to the wrong real player. Leave unmatched and let the
  // reviewer pick manually instead.
  return null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const matchId = searchParams.get('matchId')
    if (!matchId) return NextResponse.json({ error: 'matchId is required' }, { status: 400 })

    // Fetch scorecard from NV Play
    const nvRes = await fetch(`${NV_BASE}/${matchId}`, { cache: 'no-store' })
    if (!nvRes.ok) throw new Error(`NV Play scorecard returned ${nvRes.status}`)
    const nvData = await nvRes.json()

    const match = nvData.Match ?? {}
    const innings: any[] = nvData.Innings ?? []

    // Identify which innings Ardent Blues batted and bowled in
    const ardentBatInnings = innings.filter(inn =>
      inn.BattingTeamName?.toLowerCase().includes('ardent')
    )
    const ardentBowlInnings = innings.filter(inn =>
      !inn.BattingTeamName?.toLowerCase().includes('ardent')
    )

    // Load all Payload players for fuzzy matching
    const payload = await getPayloadClient()
    const { docs: players } = await payload.find({ collection: 'players', limit: 500, depth: 0 })
    const playerOptions = players.map((p: any) => ({ id: p.id, name: p.name }))

    // --- Parse batting ---
    const batting: any[] = []
    // Players named in the batting order who never got to bat (HasBatted: false) — the
    // full XI is listed here regardless of whether they batted, so this is also our
    // source for "played but recorded nothing" players, resolved after fielding below.
    const dnbNames = new Set<string>()
    for (const inn of ardentBatInnings) {
      for (const b of inn.BattingCard ?? []) {
        if (b.IsSummary) continue
        const name = cleanName(b.PlayerName ?? '')
        if (!name) continue
        if (!b.HasBatted) { dnbNames.add(name); continue }
        const matched = matchPlayer(name, players)
        batting.push({
          name,
          runs: b.Runs ?? 0,
          balls: b.Balls ?? 0,
          fours: b.Fours ?? 0,
          sixes: b.Sixes ?? 0,
          strikeRate: b.StrikeRate ? parseFloat(b.StrikeRate) : null,
          notOut: b.IsDismissed === false,
          howOut: b.HowOut ?? null,
          catches: 0,
          stumpings: 0,
          runOuts: 0,
          fieldingOnly: false,
          matchedPlayer: matched ? { id: matched.id, name: matched.name } : null,
          selectedPlayerId: matched?.id ?? null,
          include: true,
        })
      }
    }

    // --- Parse fielding (catches/stumpings/run-outs) from the innings Ardent Blues bowled ---
    // Dismissals on the opponent's batting card name the Ardent Blues fielder responsible.
    // A player who only fielded (no batting/bowling card entry) still needs to show up here.
    const fieldingByName = new Map<string, { catches: number; stumpings: number; runOuts: number }>()
    for (const inn of ardentBowlInnings) {
      for (const b of inn.BattingCard ?? []) {
        const dismissal = b.Dismissal
        if (!dismissal || !dismissal.Fielders?.length) continue
        for (const f of dismissal.Fielders) {
          const fname = cleanName(f.DisplayName ?? '')
          if (!fname) continue
          const entry = fieldingByName.get(fname) ?? { catches: 0, stumpings: 0, runOuts: 0 }
          if (dismissal.Type === 'Caught') entry.catches++
          else if (dismissal.Type === 'Stumped') entry.stumpings++
          else if (dismissal.Type === 'Run Out') entry.runOuts++
          fieldingByName.set(fname, entry)
        }
      }
    }
    for (const [fname, stats] of fieldingByName) {
      const existingRow = batting.find(r => r.name === fname)
      if (existingRow) {
        existingRow.catches = stats.catches
        existingRow.stumpings = stats.stumpings
        existingRow.runOuts = stats.runOuts
      } else {
        const matched = matchPlayer(fname, players)
        batting.push({
          name: fname,
          runs: null,
          balls: null,
          fours: null,
          sixes: null,
          strikeRate: null,
          notOut: false,
          howOut: null,
          catches: stats.catches,
          stumpings: stats.stumpings,
          runOuts: stats.runOuts,
          fieldingOnly: true,
          matchedPlayer: matched ? { id: matched.id, name: matched.name } : null,
          selectedPlayerId: matched?.id ?? null,
          include: true,
        })
      }
    }

    // --- Remaining DNB players: no bat, no catch/stumping/run-out on record — but they
    // were still named in the XI for this match, so they still count as having played it.
    for (const name of dnbNames) {
      if (batting.find(r => r.name === name)) continue
      const matched = matchPlayer(name, players)
      batting.push({
        name,
        runs: null,
        balls: null,
        fours: null,
        sixes: null,
        strikeRate: null,
        notOut: false,
        howOut: null,
        catches: 0,
        stumpings: 0,
        runOuts: 0,
        fieldingOnly: true,
        matchedPlayer: matched ? { id: matched.id, name: matched.name } : null,
        selectedPlayerId: matched?.id ?? null,
        include: true,
      })
    }

    // --- Parse bowling ---
    const bowling: any[] = []
    const seenBowlers = new Set<string>()
    for (const inn of ardentBowlInnings) {
      for (const bw of inn.BowlingCard ?? []) {
        const name = cleanName(bw.PlayerName ?? '')
        if (!name || seenBowlers.has(name)) continue
        seenBowlers.add(name)
        const overs = bw.Overs ? parseFloat(bw.Overs) : null
        const matched = matchPlayer(name, players)
        bowling.push({
          name,
          overs,
          maidens: bw.Maidens ?? 0,
          runs: bw.Runs ?? 0,
          wickets: bw.Wickets ?? 0,
          economy: bw.EconomyRate ? parseFloat(bw.EconomyRate) : null,
          matchedPlayer: matched ? { id: matched.id, name: matched.name } : null,
          selectedPlayerId: matched?.id ?? null,
          include: true,
        })
      }
    }

    return NextResponse.json({
      matchInfo: {
        competition: match.CompetitionName ?? null,
        date: match.StartDateTime ?? match.StartDateTimeUTC ?? null,  // ISO — used to extract year for season key
        dateFormatted: match.StartDateFormatted ?? null,
        teams: match.MatchShortTitle ?? match.MatchTitle ?? null,
        matchType: match.MatchType ?? null,
        team1Score: match.Team1Scores ?? null,
        team2Score: match.Team2Scores ?? null,
        result: match.Team1Scores && match.Team2Scores
          ? `${match.Team1Name}: ${match.Team1Scores}  ·  ${match.Team2Name}: ${match.Team2Scores}`
          : null,
      },
      batting,
      bowling,
      playerOptions,
    })
  } catch (err: any) {
    console.error('[nvplay/scorecard]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
