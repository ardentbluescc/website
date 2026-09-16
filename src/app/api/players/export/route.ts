import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildPlayersCSV } from '@/lib/csv-export'

// Admin-only CSV export. `?id=<playerId>` exports a single player, otherwise all players.
export async function GET(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'You must be logged in to export player data.' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    let players: any[]
    let filename: string
    if (id) {
      const player = await payload.findByID({ collection: 'players', id, depth: 1 })
      players = [player]
      filename = `${player.slug || player.id}-export.csv`
    } else {
      const { docs } = await payload.find({ collection: 'players', limit: 1000, depth: 1 })
      players = docs
      filename = `players-export-${new Date().toISOString().slice(0, 10)}.csv`
    }

    const csv = buildPlayersCSV(players)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('[players/export]', err)
    return NextResponse.json({ error: err.message ?? 'Unexpected error.' }, { status: 500 })
  }
}
