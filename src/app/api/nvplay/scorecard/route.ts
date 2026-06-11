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

  for (const p of players) if (normalize(p.name) === sn) return p

  const lastName = snParts[snParts.length - 1]
  if (lastName && lastName.length > 2) {
    for (const p of players) {
      if (normalize(p.name).split(' ').pop() === lastName) return p
    }
  }

  const firstName = snParts[0]
  if (firstName && firstName.length > 2) {
    for (const p of players) {
      if (normalize(p.name).split(' ')[0] === firstName) return p
    }
  }

  for (const p of players) {
    const pn = normalize(p.name)
    if (pn.includes(sn) || sn.includes(pn)) return p
  }

  if (snParts[0]?.length === 1 && snParts.length > 1) {
    const initial = snParts[0]
    const rest = snParts.slice(1).join(' ')
    for (const p of players) {
      const pParts = normalize(p.name).split(' ')
      if (pParts[0]?.[0] === initial && pParts.slice(1).join(' ').includes(rest)) return p
    }
  }

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
    for (const inn of ardentBatInnings) {
      for (const b of inn.BattingCard ?? []) {
        if (b.IsSummary) continue
        if (!b.HasBatted) continue // Did Not Bat
        const name = cleanName(b.PlayerName ?? '')
        if (!name) continue
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
          matchedPlayer: matched ? { id: matched.id, name: matched.name } : null,
          selectedPlayerId: matched?.id ?? null,
          include: true,
        })
      }
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
