import { NextResponse } from 'next/server'

const NCU_CUSTOMER_ID = '4c07e17d-8e58-426e-82cc-bd4b02b5183b'
const BASE = 'https://w-api.cdn.nvplay.net/api/matchlist/filter'

function isArdentBlues(m: any) {
  return `${m.Team1Name ?? ''} ${m.Team2Name ?? ''}`.toLowerCase().includes('ardent')
}

function shapeMatch(m: any, type: 'live' | 'fixture' | 'result') {
  return {
    matchId:       m.MatchId,
    type,
    competition:   m.CompetitionName ?? '',
    team1:         m.Team1Name ?? '',
    team2:         m.Team2Name ?? '',
    team1Score:    m.Team1Scores ?? null,
    team2Score:    m.Team2Scores ?? null,
    team1Image:    m.Team1Image ?? null,
    team2Image:    m.Team2Image ?? null,
    result:        m.Result ?? null,
    winner:        m.WinningTeamName ?? null,
    venue:         m.VenueName ?? null,
    date:          m.StartDateTime ?? null,
    dateFormatted: m.StartDateFormatted ?? null,
    situation:     m.MatchSituation ?? null,
  }
}

async function fetchPage(page: number, maxResults: number): Promise<any[]> {
  const params = new URLSearchParams({
    customerid: NCU_CUSTOMER_ID,
    addFilters: 'false', advanced: 'false',
    currentSeason: 'false',
    days: '3650',
    showFixtures: 'false',
    showLive: 'false',
    showResults: 'true',
    completedResultsOnly: 'true',
    page: String(page),
    maxResults: String(maxResults),
  })
  const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.Results ?? []
}

// Pages through every result NV Play has (not just a fixed number of pages) — stops once
// a page comes back short of a full page, which means it was the last one.
async function fetchAllResults(): Promise<any[]> {
  const MAX_RESULTS = 500
  const HARD_PAGE_CAP = 100 // safety net against an infinite loop, not a real intended limit
  const all: any[] = []
  for (let page = 0; page < HARD_PAGE_CAP; page++) {
    const results = await fetchPage(page, MAX_RESULTS)
    all.push(...results)
    if (results.length < MAX_RESULTS) break
  }
  return all.filter(isArdentBlues)
}

async function fetchFixtures(): Promise<any[]> {
  const params = new URLSearchParams({
    customerid: NCU_CUSTOMER_ID,
    addFilters: 'false', advanced: 'false',
    currentSeason: 'true',
    days: '180',
    showFixtures: 'true',
    showLive: 'false',
    showResults: 'false',
    page: '0',
    maxResults: '200',
  })
  const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.Fixtures ?? []).filter(isArdentBlues)
}

async function fetchLive(): Promise<any[]> {
  const params = new URLSearchParams({
    customerid: NCU_CUSTOMER_ID,
    addFilters: 'false', advanced: 'false',
    currentSeason: 'true',
    days: '1',
    showFixtures: 'false',
    showLive: 'true',
    showResults: 'false',
    completedResultsOnly: 'false',
    page: '0', maxResults: '50',
  })
  const res = await fetch(`${BASE}?${params}`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return (data.Live ?? []).filter(isArdentBlues)
}

export async function GET() {
  try {
    const [liveRaw, fixturesRaw, resultsRaw] = await Promise.all([
      fetchLive(),
      fetchFixtures(),
      fetchAllResults(),
    ])

    const live = liveRaw.map(m => shapeMatch(m, 'live'))

    const fixtures = fixturesRaw
      .map(m => shapeMatch(m, 'fixture'))
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))  // soonest first

    const results = resultsRaw
      .filter(m => (m.StartDateTime ?? '') >= '2023-01-01')
      .map(m => shapeMatch(m, 'result'))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))  // newest first

    return NextResponse.json({ live, fixtures, results })
  } catch (err: any) {
    console.error('[nvplay/matches]', err)
    return NextResponse.json({ error: err.message, live: [], fixtures: [], results: [] }, { status: 500 })
  }
}
