'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

interface PlayerOption { id: string; name: string }

interface BattingRow {
  name: string; runs: number | null; balls: number | null; fours: number | null
  sixes: number | null; strikeRate: number | null; notOut: boolean; howOut?: string | null
  catches?: number; stumpings?: number; runOuts?: number; fieldingOnly?: boolean
  matchedPlayer: PlayerOption | null; selectedPlayerId: string | null; include: boolean
}

interface BowlingRow {
  name: string; overs: number | null; maidens: number | null; runs: number | null
  wickets: number | null; economy: number | null
  matchedPlayer: PlayerOption | null; selectedPlayerId: string | null; include: boolean
}

interface ExtractResult {
  matchInfo: { competition?: string | null; date?: string | null; dateFormatted?: string | null; teams?: string | null; result?: string | null }
  batting: BattingRow[]; bowling: BowlingRow[]; playerOptions: PlayerOption[]
}

interface NvMatch {
  matchId: string; type: 'live' | 'result'; title: string; competition: string
  team1: string; team2: string; team1Score?: string | null; team2Score?: string | null
  result?: string | null; situation?: string | null; date?: string | null
}

type Phase = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error'
type Source = 'image' | 'nvplay'

function PlayerSelect({ value, options, onChange }: { value: string | null; options: PlayerOption[]; onChange: (id: string | null) => void }) {
  return (
    <select
      value={value ?? '__skip__'}
      onChange={e => onChange(e.target.value === '__skip__' ? null : e.target.value)}
      style={{ width: '100%', fontSize: 12, background: '#0B1220', border: '1px solid #1E293B', borderRadius: 0, padding: '6px 10px', color: '#fff', cursor: 'pointer' }}
    >
      <option value="__skip__">— Skip this player —</option>
      {options.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )
}

function MatchBadge({ player }: { player: PlayerOption | null }) {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, border: '1px solid' }
  if (!player) return <span style={{ ...base, color: '#fb923c', background: 'rgba(251,146,60,0.1)', borderColor: 'rgba(251,146,60,0.2)' }}>⚠ No match</span>
  return <span style={{ ...base, color: '#4ade80', background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.2)' }}>✓ Matched</span>
}

function Stat({ label, value }: { label: string; value: number | string | null | undefined }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 36 }}>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</div>
      <div style={{ color: '#475569', fontSize: 10 }}>{label}</div>
    </div>
  )
}

// ── NV Play match picker ──────────────────────────────────────────────────────

const XI_ORDER = ['1st XI', '2nd XI', '3rd XI', '4th XI', '5th XI']

function ardentTeamLabel(fullName: string): string {
  return fullName.replace(/ardent blues\s*/i, '').trim() || fullName
}

function sortTeamLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => {
    const ai = XI_ORDER.indexOf(a), bi = XI_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })
}

const PAGE_SIZE = 30

function NvPlayPicker({ onPick }: { onPick: (matchId: string, match: NvMatch) => void }) {
  const [live, setLive]       = useState<NvMatch[]>([])
  const [results, setResults] = useState<NvMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate]     = useState('')
  const [page, setPage]         = useState(1)

  useEffect(() => {
    fetch('/api/nvplay/matches')
      .then(r => r.json())
      .then(d => {
        setLive(d.live ?? [])
        setResults(d.results ?? [])
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  // Reset pagination whenever any filter changes
  useEffect(() => { setPage(1) }, [teamFilter, yearFilter, fromDate, toDate])

  const card: React.CSSProperties = { background: '#111827', border: '1px solid #1E293B', borderRadius: 0 }
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: `1px solid ${active ? '#1D6EF5' : '#1E293B'}`,
    background: active ? 'rgba(29,110,245,0.15)' : '#0B1220',
    color: active ? '#60A5FA' : '#64748b', transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  })

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...card, padding: '16px 18px', height: 120, opacity: 0.5 }} />
      {[1,2,3,4].map(i => <div key={i} style={{ ...card, height: 76, opacity: 0.4 - i * 0.07 }} />)}
    </div>
  )

  if (error) return <p style={{ color: '#f87171', fontSize: 13 }}>Failed to load matches: {error}</p>

  const allMatches = [...results]

  // Build filter option lists from actual data
  const teamLabels = sortTeamLabels(Array.from(new Set(
    allMatches.map(m => ardentTeamLabel(m.team1.toLowerCase().includes('ardent') ? m.team1 : m.team2))
  )))

  const years = Array.from(new Set(
    allMatches.map(m => m.date?.slice(0, 4) ?? '').filter(Boolean)
  )).sort((a, b) => b.localeCompare(a)) // newest first

  // Client-side filtering
  const filtered = allMatches.filter(m => {
    const ardentName = m.team1.toLowerCase().includes('ardent') ? m.team1 : m.team2
    if (teamFilter !== 'all' && ardentTeamLabel(ardentName) !== teamFilter) return false
    if (yearFilter !== 'all' && (m.date?.slice(0, 4) ?? '') !== yearFilter) return false
    if (fromDate && m.date && m.date < fromDate) return false
    if (toDate && m.date && m.date > toDate + 'T23:59:59') return false
    return true
  })

  const hasFilters = teamFilter !== 'all' || yearFilter !== 'all' || fromDate || toDate
  const visibleResults = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > visibleResults.length

  function MatchCard({ m, isLive }: { m: NvMatch; isLive?: boolean }) {
    const isArdentT1  = m.team1.toLowerCase().includes('ardent')
    const ardent      = isArdentT1 ? m.team1 : m.team2
    const opponent    = isArdentT1 ? m.team2 : m.team1
    const ardentScore = isArdentT1 ? m.team1Score : m.team2Score
    const oppScore    = isArdentT1 ? m.team2Score : m.team1Score
    const teamLabel   = ardentTeamLabel(ardent)
    const date        = m.date
      ? new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : ''

    return (
      <button
        onClick={() => onPick(m.matchId, m)}
        style={{ ...card, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', width: '100%',
          transition: 'border-color 0.15s',
          ...(isLive ? { borderColor: 'rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.03)' } : {}),
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = isLive ? '#4ade80' : '#1D6EF5')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = isLive ? 'rgba(74,222,128,0.35)' : '#1E293B')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
              {isLive && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', padding: '2px 8px', borderRadius: 999 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'livePulse 1.2s ease-in-out infinite' }} />
                  LIVE
                </span>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1D6EF5', background: 'rgba(29,110,245,0.15)', border: '1px solid rgba(29,110,245,0.3)', padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>
                {teamLabel}
              </span>
              <span style={{ fontSize: 10, color: '#60A5FA', background: 'rgba(29,110,245,0.07)', border: '1px solid rgba(29,110,245,0.15)', padding: '2px 8px', borderRadius: 999 }}>
                {m.competition}
              </span>
            </div>
            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{ardent}</span>
              <span style={{ color: '#475569', fontSize: 11 }}>vs</span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{opponent}</span>
            </div>
            {/* Date */}
            {date && (
              <span style={{ fontSize: 10, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {date}
              </span>
            )}
          </div>
          {/* Scores */}
          {(ardentScore || oppScore) && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {ardentScore && <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{ardentScore}</div>}
              {oppScore    && <div style={{ color: '#64748b', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{oppScore}</div>}
            </div>
          )}
        </div>
        {/* Result / situation */}
        {(m.result || (isLive && m.situation)) && (
          <div style={{ marginTop: 8, fontSize: 11, color: isLive ? '#86efac' : '#4ade80' }}>
            {isLive ? m.situation : m.result}
          </div>
        )}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filter bar ── */}
      <div style={{ ...card, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Team filter */}
        <div>
          <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Team</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button style={pill(teamFilter === 'all')} onClick={() => setTeamFilter('all')}>All teams</button>
            {teamLabels.map(label => (
              <button key={label} style={pill(teamFilter === label)} onClick={() => setTeamFilter(label)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Year filter */}
        <div>
          <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Year</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button style={pill(yearFilter === 'all')} onClick={() => setYearFilter('all')}>All years</button>
            {years.map(yr => (
              <button key={yr} style={pill(yearFilter === yr)} onClick={() => setYearFilter(yr)}>{yr}</button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div>
          <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Date range</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>From</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ background: '#0B1220', border: '1px solid #1E293B', borderRadius: 0, padding: '5px 10px', color: '#fff', fontSize: 12, outline: 'none', colorScheme: 'dark' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>To</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ background: '#0B1220', border: '1px solid #1E293B', borderRadius: 0, padding: '5px 10px', color: '#fff', fontSize: 12, outline: 'none', colorScheme: 'dark' }} />
            </div>
            {hasFilters && (
              <button onClick={() => { setTeamFilter('all'); setYearFilter('all'); setFromDate(''); setToDate('') }}
                style={{ fontSize: 11, color: '#fb923c', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 0, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Live section (always shown when live matches exist, unaffected by filters) ── */}
      {live.length > 0 && (
        <div>
          <p style={{ color: '#4ade80', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Live now — scorecard updates every 30s
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {live.map(m => <MatchCard key={m.matchId} m={m} isLive />)}
          </div>
        </div>
      )}

      {/* ── Results list ── */}
      <div>
        <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 10px' }}>
          {filtered.length === 0
            ? 'No matches match the current filters.'
            : <>Showing <strong style={{ color: '#fff' }}>{Math.min(visibleResults.length, filtered.length)}</strong> of <strong style={{ color: '#fff' }}>{filtered.length}</strong> matches — click to import scorecard</>}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleResults.map(m => <MatchCard key={m.matchId} m={m} />)}
          {filtered.length === 0 && (
            <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>No matches found for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            style={{ marginTop: 12, width: '100%', padding: '10px', background: 'none', border: '1px solid #1E293B', borderRadius: 0, color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D6EF5'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.color = '#64748b' }}
          >
            Load more ({filtered.length - visibleResults.length} remaining)
          </button>
        )}
      </div>

      <style>{`@keyframes livePulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ScorecardImportView() {
  const [source, setSource] = useState<Source>('image')
  const [phase, setPhase] = useState<Phase>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ExtractResult | null>(null)
  const [batting, setBatting] = useState<BattingRow[]>([])
  const [bowling, setBowling] = useState<BowlingRow[]>([])
  const [formatName, setFormatName] = useState('')
  const [doneCount, setDoneCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting')
  const [scanStep, setScanStep] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState<NvMatch | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Image upload flow ────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setErrorMsg('Please upload a PNG, JPG or JPEG.'); setPhase('error'); return }
    setPreview(URL.createObjectURL(file))
    setPhase('scanning'); setScanStep(1)
    const fd = new FormData(); fd.append('scorecard', file)
    setTimeout(() => setScanStep(2), 800)
    try {
      const res = await fetch('/api/scorecard-import', { method: 'POST', body: fd })
      setScanStep(3)
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? 'Something went wrong.'); setPhase('error'); return }
      hydrateResult(data)
    } catch (e: any) { setErrorMsg(e.message ?? 'Network error.'); setPhase('error') }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }, [processFile])
  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f) }, [processFile])

  // ── NV Play scorecard fetch ──────────────────────────────────────────────────

  const fetchNvScorecard = useCallback(async (matchId: string, match: NvMatch) => {
    setSelectedMatch(match)
    setPhase('scanning'); setScanStep(1)
    setTimeout(() => setScanStep(2), 400)
    try {
      const res = await fetch(`/api/nvplay/scorecard?matchId=${encodeURIComponent(matchId)}`)
      setScanStep(3)
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? 'Failed to fetch scorecard.'); setPhase('error'); return }
      hydrateResult(data)
    } catch (e: any) { setErrorMsg(e.message ?? 'Network error.'); setPhase('error') }
  }, [])

  // ── Shared: populate review state ────────────────────────────────────────────

  function hydrateResult(data: any) {
    const hb: BattingRow[] = (data.batting ?? []).map((b: any) => ({ ...b, selectedPlayerId: b.matchedPlayer?.id ?? null, include: true }))
    const hw: BowlingRow[] = (data.bowling ?? []).map((bw: any) => ({ ...bw, selectedPlayerId: bw.matchedPlayer?.id ?? null, include: true }))
    setResult(data); setBatting(hb); setBowling(hw)

    // Auto-build format key: "Competition · Year"
    // Same key = stats are merged into the existing row instead of creating a new one
    const competition = data.matchInfo?.competition ?? ''
    const year = data.matchInfo?.date ? new Date(data.matchInfo.date).getFullYear().toString() : new Date().getFullYear().toString()
    setFormatName(competition ? `${competition} · ${year}` : '')

    setActiveTab(hb.length > 0 ? 'batting' : 'bowling')
    setTimeout(() => setPhase('review'), 400)
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formatName.trim()) { alert('Enter a format name first.'); return }
    setPhase('saving')
    const byPlayer: Record<string, { batting?: BattingRow; bowling?: BowlingRow }> = {}
    batting.filter(r => r.include && r.selectedPlayerId).forEach(r => { byPlayer[r.selectedPlayerId!] = { ...byPlayer[r.selectedPlayerId!], batting: r } })
    bowling.filter(r => r.include && r.selectedPlayerId).forEach(r => { byPlayer[r.selectedPlayerId!] = { ...byPlayer[r.selectedPlayerId!], bowling: r } })
    const entries = Object.entries(byPlayer).map(([playerId, d]) => ({ playerId, batting: d.batting, bowling: d.bowling }))
    const matchId = source === 'nvplay' ? (selectedMatch?.matchId ?? null) : null
    try {
      const res = await fetch('/api/scorecard-import/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format: formatName.trim(), entries, matchId }) })
      const json = await res.json()
      if (!res.ok) { setErrorMsg(json.error ?? 'Save failed.'); setPhase('error'); return }
      setDoneCount(json.updated); setSkippedCount(json.skipped ?? 0); setPhase('done')
    } catch (e: any) { setErrorMsg(e.message); setPhase('error') }
  }

  const reset = () => { setPhase('idle'); setPreview(null); setResult(null); setSelectedMatch(null); setSkippedCount(0) }

  const includedCount = batting.filter(r => r.include && r.selectedPlayerId).length +
    bowling.filter(r => r.include && r.selectedPlayerId && !batting.find(b => b.selectedPlayerId === r.selectedPlayerId && b.include)).length
  const unmatched = batting.filter(r => r.include && !r.selectedPlayerId).length + bowling.filter(r => r.include && !r.selectedPlayerId).length

  const card: React.CSSProperties = { background: '#111827', border: '1px solid #1E293B', borderRadius: 0 }
  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: 'pointer' }

  const scanSteps = source === 'nvplay'
    ? [{ s: 1, label: 'Connecting to NV Play' }, { s: 2, label: 'Fetching scorecard data' }, { s: 3, label: 'Matching players in database' }]
    : [{ s: 1, label: 'Uploading image' }, { s: 2, label: 'Reading scorecard with AI' }, { s: 3, label: 'Matching players in database' }]

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 960, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Scorecard Import</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Import match stats directly from NV Play or by scanning a scorecard image</p>
      </div>

      {/* Source tabs — only show in idle phase */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', gap: 4, background: '#0B1220', border: '1px solid #1E293B', borderRadius: 0, padding: 4, width: 'fit-content', marginBottom: 24 }}>
          {([
            { key: 'nvplay' as Source, label: '⚡ NV Play', desc: 'Auto-fetch from NV Play' },
            { key: 'image' as Source, label: '📷 Image Upload', desc: 'AI scan scorecard photo' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSource(key)}
              style={{ padding: '8px 20px', borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none', background: source === key ? '#1D6EF5' : 'transparent', color: source === key ? '#fff' : '#64748b', transition: 'all 0.15s' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── IDLE: Image upload ── */}
      {phase === 'idle' && source === 'image' && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          style={{ ...card, border: `2px dashed ${dragOver ? '#1D6EF5' : '#1E293B'}`, background: dragOver ? 'rgba(29,110,245,0.05)' : '#111827', cursor: 'pointer', padding: '64px 32px', textAlign: 'center', transform: dragOver ? 'scale(1.01)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onInput} />
          <div style={{ width: 72, height: 72, borderRadius: 0, background: dragOver ? 'rgba(29,110,245,0.2)' : '#0B1220', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transition: 'all 0.2s' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={dragOver ? '#60A5FA' : '#475569'} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{dragOver ? 'Drop to scan' : 'Drop your scorecard here'}</p>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>or click to browse — PNG, JPG, JPEG</p>
          <p style={{ color: '#334155', fontSize: 12, maxWidth: 380, margin: '0 auto' }}>AI reads every player name and stat, matches them to your squad, and fills in batting &amp; bowling records automatically.</p>
        </div>
      )}

      {/* ── IDLE: NV Play picker ── */}
      {phase === 'idle' && source === 'nvplay' && (
        <NvPlayPicker onPick={fetchNvScorecard} />
      )}

      {/* ── SCANNING ── */}
      {phase === 'scanning' && (
        <div style={{ display: 'grid', gridTemplateColumns: source === 'image' && preview ? '1fr 1fr' : '1fr', gap: 24 }}>
          {source === 'image' && preview && (
            <div style={{ ...card, aspectRatio: '4/3', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={preview} alt="Scorecard" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            </div>
          )}
          {source === 'nvplay' && selectedMatch && (
            <div style={{ ...card, padding: '20px 24px' }}>
              <p style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fetching scorecard for</p>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>{selectedMatch.title}</p>
              <p style={{ color: '#60A5FA', fontSize: 12, marginTop: 4 }}>{selectedMatch.competition}</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: '0 16px' }}>
            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              {source === 'nvplay' ? 'Fetching from NV Play' : 'Scanning scorecard'}
            </p>
            {scanSteps.map(({ s, label }) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${scanStep > s ? 'rgba(74,222,128,0.4)' : scanStep === s ? 'rgba(29,110,245,0.5)' : '#1E293B'}`, background: scanStep > s ? 'rgba(74,222,128,0.1)' : scanStep === s ? 'rgba(29,110,245,0.15)' : '#0B1220' }}>
                  {scanStep > s
                    ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : scanStep === s
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#60A5FA" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z" opacity={0.8}/></svg>
                      : <span style={{ color: '#475569', fontSize: 11, fontWeight: 700 }}>{s}</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: scanStep > s ? '#4ade80' : scanStep === s ? '#fff' : '#475569' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEW ── (shared between image and NV Play) */}
      {phase === 'review' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Match info */}
          <div style={{ ...card, padding: '14px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              {result.matchInfo.teams && <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{result.matchInfo.teams}</span>}
              {result.matchInfo.competition && <span style={{ fontSize: 11, color: '#60A5FA', background: 'rgba(29,110,245,0.1)', border: '1px solid rgba(29,110,245,0.2)', padding: '3px 10px', borderRadius: 999 }}>{result.matchInfo.competition}</span>}
              {(result.matchInfo.dateFormatted ?? result.matchInfo.date) && (
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  {result.matchInfo.dateFormatted ?? (result.matchInfo.date ? new Date(result.matchInfo.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')}
                </span>
              )}
              {/* NV Play badge */}
              {source === 'nvplay' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '3px 10px', borderRadius: 999 }}>
                  ⚡ Via NV Play
                </span>
              )}
            </div>
            {result.matchInfo.result && (
              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{result.matchInfo.result}</p>
            )}
          </div>

          {/* Format + counters */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Season key <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text" value={formatName} onChange={e => setFormatName(e.target.value)}
                placeholder="e.g. NCU Junior League 5 · 2026"
                style={{ width: '100%', background: '#0B1220', border: '1px solid #1E293B', borderRadius: 0, padding: '9px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
              <p style={{ color: '#475569', fontSize: 11, marginTop: 5 }}>
                Matches with the same key are <strong style={{ color: '#60A5FA' }}>merged into one row</strong> — totals accumulate, HS tracks the highest score across all matches.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, paddingBottom: 2 }}>
              {[
                { n: batting.filter(r => r.include && !r.fieldingOnly).length, label: 'Batting' },
                { n: batting.filter(r => r.include && r.fieldingOnly).length, label: 'Fielding' },
                { n: bowling.filter(r => r.include).length, label: 'Bowling' },
                { n: unmatched, label: 'Unmatched', warn: unmatched > 0 },
              ].map(({ n, label, warn }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: (warn as boolean) ? '#fb923c' : '#fff', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Batting/Bowling tabs */}
          <div style={{ borderBottom: '1px solid #1E293B', display: 'flex', gap: 4 }}>
            {(['batting', 'bowling'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, color: activeTab === tab ? '#fff' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize', borderBottom: activeTab === tab ? '2px solid #1D6EF5' : '2px solid transparent', marginBottom: -1 }}>
                {tab} ({(tab === 'batting' ? batting : bowling).filter(r => r.include).length})
              </button>
            ))}
          </div>

          {/* Player rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(activeTab === 'batting' ? batting : bowling).map((row, i) => {
              const b = row as BattingRow; const bw = row as BowlingRow
              const isBat = activeTab === 'batting'
              return (
                <div key={i} style={{ ...card, opacity: row.include ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', flexWrap: 'wrap' }}>
                    <input type="checkbox" checked={row.include} onChange={e => {
                      if (isBat) { const n = [...batting]; n[i] = { ...n[i], include: e.target.checked }; setBatting(n) }
                      else { const n = [...bowling]; n[i] = { ...n[i], include: e.target.checked }; setBowling(n) }
                    }} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1D6EF5', flexShrink: 0 }} />

                    <div style={{ flexShrink: 0, width: 180 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{row.name}</div>
                      <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <MatchBadge player={row.matchedPlayer} />
                        {isBat && b.fieldingOnly && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', padding: '2px 8px', borderRadius: 999 }}>Fielding only</span>
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 200, maxWidth: 280 }}>
                      <PlayerSelect value={row.selectedPlayerId} options={result!.playerOptions} onChange={id => {
                        if (isBat) { const n = [...batting]; n[i] = { ...n[i], selectedPlayerId: id }; setBatting(n) }
                        else { const n = [...bowling]; n[i] = { ...n[i], selectedPlayerId: id }; setBowling(n) }
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', flexShrink: 0 }}>
                      {isBat ? (
                        <>
                          {!b.fieldingOnly && (
                            <>
                              <Stat label="Runs" value={b.runs} />
                              <Stat label="Balls" value={b.balls} />
                              <Stat label="4s" value={b.fours} />
                              <Stat label="6s" value={b.sixes} />
                              <Stat label="SR" value={b.strikeRate} />
                            </>
                          )}
                          {!!b.catches   && <Stat label="Ct" value={b.catches} />}
                          {!!b.stumpings && <Stat label="St" value={b.stumpings} />}
                          {!!b.runOuts   && <Stat label="RO" value={b.runOuts} />}
                          {b.fieldingOnly && !b.catches && !b.stumpings && !b.runOuts && (
                            <span style={{ fontSize: 10, color: '#475569', alignSelf: 'center' }}>Played — no recorded contribution</span>
                          )}
                          {b.notOut && <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 999, alignSelf: 'center' }}>NOT OUT</span>}
                          {b.howOut && !b.notOut && <span style={{ fontSize: 10, color: '#64748b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', alignSelf: 'center' }}>{b.howOut}</span>}
                        </>
                      ) : (
                        <>
                          <Stat label="Overs" value={bw.overs} />
                          <Stat label="Mdns" value={bw.maidens} />
                          <Stat label="Runs" value={bw.runs} />
                          <Stat label="Wkts" value={bw.wickets} />
                          <Stat label="Econ" value={bw.economy} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {(activeTab === 'batting' ? batting : bowling).length === 0 && (
              <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No {activeTab} data found.</p>
            )}
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1E293B', paddingTop: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>Ready to import {includedCount} player{includedCount !== 1 ? 's' : ''}</p>
              {unmatched > 0 && <p style={{ color: '#fb923c', fontSize: 11, marginTop: 3 }}>{unmatched} unmatched — assign players above or uncheck to skip</p>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={reset} style={{ ...btn, background: 'none', border: '1px solid #1E293B', color: '#94a3b8' }}>Start over</button>
              <button onClick={handleSave} disabled={includedCount === 0 || !formatName.trim()} style={{ ...btn, background: includedCount === 0 || !formatName.trim() ? '#1E293B' : '#1D6EF5', color: '#fff', border: 'none', opacity: includedCount === 0 || !formatName.trim() ? 0.5 : 1, cursor: includedCount === 0 || !formatName.trim() ? 'not-allowed' : 'pointer' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Import {includedCount} Player{includedCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVING ── */}
      {phase === 'saving' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#60A5FA" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z" opacity={0.85}/></svg>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Saving stats…</p>
          <p style={{ color: '#64748b', fontSize: 13 }}>Updating player records in the database</p>
        </div>
      )}

      {/* ── DONE ── */}
      {phase === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>Import complete</h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Stats added to <strong style={{ color: '#fff' }}>{doneCount} player{doneCount !== 1 ? 's' : ''}</strong> successfully.</p>
            {skippedCount > 0 && (
              <p style={{ color: '#fb923c', fontSize: 12, marginTop: 8 }}>{skippedCount} player{skippedCount !== 1 ? 's' : ''} skipped — this match was already imported.</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/admin/collections/players" style={{ ...btn, background: 'none', border: '1px solid #1E293B', color: '#94a3b8', textDecoration: 'none' }}>View Players</Link>
            <button onClick={reset} style={{ ...btn, background: '#1D6EF5', color: '#fff', border: 'none' }}>Import another</button>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: 13, maxWidth: 420, margin: 0 }}>{errorMsg}</p>
          </div>
          <button onClick={reset} style={{ ...btn, background: '#1D6EF5', color: '#fff', border: 'none' }}>Try again</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
