import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getPayloadClient } from '@/lib/payload'

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ')
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

const PROMPT = `Extract all cricket statistics from this scorecard image.

Return ONLY a valid JSON object — no markdown, no code fences, no commentary:
{
  "matchInfo": {
    "competition": "league or cup name if visible, otherwise null",
    "date": "date string if visible, otherwise null",
    "teams": "both team names joined with ' vs ' if visible, otherwise null"
  },
  "batting": [
    {
      "name": "player full name exactly as printed",
      "runs": 45,
      "balls": 38,
      "fours": 4,
      "sixes": 2,
      "strikeRate": 118.42,
      "notOut": false,
      "howOut": "c Smith b Jones"
    }
  ],
  "bowling": [
    {
      "name": "player full name exactly as printed",
      "overs": 4.0,
      "maidens": 0,
      "runs": 32,
      "wickets": 2,
      "economy": 8.0
    }
  ]
}

Rules:
- Include ALL batsmen and bowlers visible on the scorecard
- notOut = true when an asterisk (*) appears after the runs
- For overs written as "4.3" that means 4 overs + 3 balls — represent as 4.3 in JSON
- Use null for any value you cannot clearly read
- If there is no bowling section set "bowling" to []
- Return pure JSON only`

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to use this tool.' }, { status: 401 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not set. Add it to your .env.local file. Get a free key at console.groq.com' },
        { status: 500 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('scorecard') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image.' }, { status: 400 })
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Groq — free tier, Llama 4 Scout with vision
    const client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    })

    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    })

    const raw = response.choices[0]?.message?.content ?? ''

    // Parse — strip any accidental markdown fences
    let extracted: any
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
      extracted = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'AI could not parse the scorecard. Try a clearer image.', raw },
        { status: 422 },
      )
    }

    // Fetch all players for name matching
    const { docs: players } = await payload.find({ collection: 'players', limit: 1000 })

    const playerOptions = players.map((p: any) => ({ id: String(p.id), name: p.name }))

    const batting = (extracted.batting ?? []).map((b: any) => {
      const matched = matchPlayer(b.name, players)
      return { ...b, matchedPlayer: matched ? { id: String(matched.id), name: matched.name } : null }
    })

    const bowling = (extracted.bowling ?? []).map((bw: any) => {
      const matched = matchPlayer(bw.name, players)
      return { ...bw, matchedPlayer: matched ? { id: String(matched.id), name: matched.name } : null }
    })

    return NextResponse.json({ matchInfo: extracted.matchInfo ?? {}, batting, bowling, playerOptions })
  } catch (err: any) {
    console.error('[scorecard-import]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
