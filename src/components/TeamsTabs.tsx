'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const roleLabel: Record<string, string> = {
  batsman: 'Batter',
  bowler: 'Bowler',
  'all-rounder': 'All-Rounder',
  keeper: 'Wicket-Keeper',
}

const roleIcon: Record<string, React.ReactNode> = {
  batsman: <BatIcon />,
  bowler: <BallIcon />,
  'all-rounder': <BatBallIcon />,
  keeper: <GlovesIcon />,
}

function BatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="currentColor">
      <path d="M5.5 18.5 L16 8 C17 7 18.5 7 19.5 8 C20.5 9 20.5 10.5 19.5 11.5 L9 22 L5.5 18.5 Z M3 21 L5.5 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function BallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9"/>
      <path d="M5.5 6.5 C8 9 8 15 5.5 17.5M18.5 6.5 C16 9 16 15 18.5 17.5" strokeLinecap="round"/>
    </svg>
  )
}
function BatBallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20 L14 10 C15 9 16.5 9 17.5 10 C18.5 11 18.5 12.5 17.5 13.5 L7 24" strokeLinecap="round"/>
      <circle cx="19" cy="5" r="3"/>
    </svg>
  )
}
function GlovesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 9V5.5a1.5 1.5 0 0 1 3 0V9M5 9v6a3 3 0 0 0 6 0V9M5 9H4a2 2 0 0 0 0 4h1" strokeLinecap="round"/>
      <path d="M13 9V5.5a1.5 1.5 0 0 1 3 0V9m-3 0v6a3 3 0 0 0 6 0V9m-6 0h-1a2 2 0 0 0 0 4h1" strokeLinecap="round"/>
    </svg>
  )
}


interface Player {
  id: string | number
  name: string
  slug?: string | null
  role?: string
  battingStyle?: string
  age?: number | null
  jerseyNumber?: number | null
  isCaptain?: boolean
  group?: string | null
  photo?: { url?: string; alt?: string } | null
}

const GROUPS = ['group-1', 'group-2', 'group-3', 'group-4', 'group-5']
const GROUP_LABELS: Record<string, string> = {
  'group-1': 'Group 1',
  'group-2': 'Group 2',
  'group-3': 'Group 3',
  'group-4': 'Group 4',
  'group-5': 'Group 5',
}

export default function TeamsTabs({ players }: { players: Player[] }) {
  const activeGroups = GROUPS.filter(g => players.some(p => p.group === g))
  const hasUngrouped = players.some(p => !p.group)

  const tabs: { key: string; label: string }[] = [
    ...(hasUngrouped || activeGroups.length === 0
      ? [{ key: 'all', label: 'All Players' }]
      : []),
    ...activeGroups.map(g => ({ key: g, label: GROUP_LABELS[g] })),
  ]

  const [active, setActive] = useState(tabs[0]?.key ?? 'all')

  const visible =
    active === 'all' ? players : players.filter(p => p.group === active)

  return (
    <div>
      {tabs.length > 1 && (
        <div className="flex gap-1 mb-10 border-b border-ardent-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active === tab.key
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {active === tab.key && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-ardent-border bg-ardent-card">
          <p className="text-gray-500 text-sm">No players in this group yet.</p>
          <p className="text-gray-600 text-xs mt-1">Add players in the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  const initials = player.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`bg-ardent-card border border-ardent-border overflow-hidden transition-all hover:border-ardent/40 hover:shadow-lg hover:shadow-ardent/5 ${player.slug ? 'cursor-pointer' : ''}`}>
      {/* Photo section */}
      <div className="relative h-52 bg-gradient-to-b from-navy-800 to-navy-900 overflow-hidden">
        {player.isCaptain && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-black bg-yellow-400 px-2 py-0.5 uppercase tracking-wide">
            Captain
          </span>
        )}
        {player.jerseyNumber != null && (
          <span className="absolute top-3 right-3 z-10 text-[11px] font-bold text-white bg-ardent/80 border border-ardent px-2 py-0.5">
            #{player.jerseyNumber}
          </span>
        )}
        {player.photo?.url ? (
          <Image
            src={player.photo.url}
            alt={player.name}
            fill
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-ardent/30">{initials}</span>
          </div>
        )}
        {/* Fade at bottom to blend into card */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ardent-card to-transparent" />
      </div>

      {/* Name row */}
      <div className="px-4 py-3 border-b border-ardent-border">
        {player.slug ? (
          <Link href={`/players/${player.slug}`} className="text-white font-semibold text-sm leading-tight truncate hover:text-ardent-bright transition-colors block">
            {player.name}
          </Link>
        ) : (
          <p className="text-white font-semibold text-sm leading-tight truncate">{player.name}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-ardent-border">
        <div className="px-2 py-2.5 text-center">
          <p className="text-gray-500 mb-0.5 flex justify-center">
            {roleIcon[player.role ?? ''] ?? <BatIcon />}
          </p>
          <p className="text-white text-[10px] font-medium leading-tight">
            {roleLabel[player.role ?? ''] ?? '—'}
          </p>
        </div>
        <div className="px-2 py-2.5 text-center">
          <p className="text-[10px] text-gray-600 mb-0.5">Age</p>
          <p className="text-white text-[11px] font-medium">{player.age ?? '—'}</p>
        </div>
        <div className="px-2 py-2.5 text-center">
          <p className="text-[10px] text-gray-600 mb-0.5">Style</p>
          <p className="text-white text-[11px] font-medium uppercase">
            {player.battingStyle === 'rhb'
              ? 'RHB'
              : player.battingStyle === 'lhb'
                ? 'LHB'
                : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
