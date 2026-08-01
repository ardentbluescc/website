import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getPayloadClient } from '@/lib/payload'

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ')
}

function matchPlayer(scorecardName: string, players: any[]): any | null {
  const sn = normalize(scorecardName)
  const snParts = sn.split(' ').filter(Boolean)

  // 1. Exact match
  for (const p of players) {
    if (normalize(p.name) === sn) return p
  }

  // 2. Last name match
  const lastName = snParts[snParts.length - 1]
  if (lastName && lastName.length > 2) {
    for (const p of players) {
      const pp = normalize(p.name).split(' ')
      if (pp[pp.length - 1] === lastName) return p
    }
  }

  // 3. First name match
  const firstName = snParts[0]
  if (firstName && firstName.length > 2) {
    for (const p of players) {
      const pp = normalize(p.name).split(' ')
      if (pp[0] === firstName) return p
    }
  }

  // 4. Substring containment
  for (const p of players) {
    const pn = normalize(p.name)
    if (pn.includes(sn) || sn.includes(pn)) return p
  }

  // 5. Initial + last name: "A. Smith" → "Adam Smith"
  if (snParts[0] && snParts[0].length === 1 && snParts.length > 1) {
    const initial = snParts[0]
    const rest = snParts.slice(1).join(' ')
    for (const p of players) {
      const pn = normalize(p.name).split(' ')
      if (pn[0]?.[0] === initial && pn.slice(1).join(' ').includes(rest)) return p
    }
  }

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
    const { docs: players } = await payload.find({ collection: 'players', limit: 500 })

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
