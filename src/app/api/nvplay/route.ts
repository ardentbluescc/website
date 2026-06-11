import { NextResponse } from 'next/server'

const NCU_CUSTOMER_ID = '4c07e17d-8e58-426e-82cc-bd4b02b5183b'
const BASE = 'https://w-api.cdn.nvplay.net/api/matchlist/filter'

function isArdentBlues(m: any) {
  const t = `${m.Team1Name ?? ''} ${m.Team2Name ?? ''}`.toLowerCase()
  return t.includes('ardent')
}

export async function GET(req: Request) {
  try {
    const params = new URLSearchParams({
      customerid: NCU_CUSTOMER_ID,
      addFilters: 'false',
      advanced: 'false',
      currentSeason: 'true',
      days: '60',
      showFixtures: 'true',
      showLive: 'true',
      showResults: 'true',
      completedResultsOnly: 'true',
      page: '0',
      maxResults: '200',
    })

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: 30 }, // cache 30s
    })

    if (!res.ok) throw new Error(`NV Play returned ${res.status}`)

    const data = await res.json()

    return NextResponse.json({
      live:     (data.Live     ?? []).filter(isArdentBlues),
      fixtures: (data.Fixtures ?? []).filter(isArdentBlues).slice(0, 15),
      results:  (data.Results  ?? []).filter(isArdentBlues).slice(0, 10),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, live: [], fixtures: [], results: [] }, { status: 500 })
  }
}
