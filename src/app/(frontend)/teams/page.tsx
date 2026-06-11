import type { Metadata } from 'next'
import { getPlayers } from '@/lib/payload'
import TeamsTabs from '@/components/TeamsTabs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Squad | Ardent Blues CC',
  description: 'Meet the players of Ardent Blues Cricket Club.',
}

export default async function TeamsPage() {
  const { docs: players } = await getPlayers()

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-none tracking-tight mb-3">
          Our Squad
        </h1>
        <p className="text-gray-400 text-lg mb-12">
          Meet the players representing Ardent Blues CC.
        </p>

        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-ardent-card rounded-2xl border border-ardent-border">
            <p className="text-gray-500 text-sm">No players added yet.</p>
            <p className="text-gray-600 text-xs mt-2">
              Add players in the admin panel to see them here.
            </p>
          </div>
        ) : (
          <TeamsTabs players={players as any} />
        )}
      </div>
    </div>
  )
}
