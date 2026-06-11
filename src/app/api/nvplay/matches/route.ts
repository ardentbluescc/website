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

async function fetchPage(page: number): Promise<any[]> {
  const params = new URLSearchParams({
    customerid: NCU_CUSTOMER_ID,
    addFilters: 'false', advanced: 'false',
    currentSeason: 'false',
    days: '1500',
    showFixtures: 'false',
    showLive: 'false',
    showResults: 'true',
    completedResultsOnly: 'true',
    page: String(page),
    maxResults: '500',
  })
  const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.Results ?? []).filter(isArdentBlues)
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
    const PAGES = 10
    const [liveRaw, fixturesRaw, ...pageResults] = await Promise.all([
      fetchLive(),
      fetchFixtures(),
      ...Array.from({ length: PAGES }, (_, i) => fetchPage(i)),
    ])

    const live = liveRaw.map(m => shapeMatch(m, 'live'))

    const fixtures = fixturesRaw
      .map(m => shapeMatch(m, 'fixture'))
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))  // soonest first

    const results = pageResults
      .flat()
      .filter(m => (m.StartDateTime ?? '') >= '2023-01-01')
      .map(m => shapeMatch(m, 'result'))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))  // newest first

    return NextResponse.json({ live, fixtures, results })
  } catch (err: any) {
    console.error('[nvplay/matches]', err)
    return NextResponse.json({ error: err.message, live: [], fixtures: [], results: [] }, { status: 500 })
  }
}
