'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerOption { id: string; name: string }

interface BattingRow {
  name: string
  runs: number | null
  balls: number | null
  fours: number | null
  sixes: number | null
  strikeRate: number | null
  notOut: boolean
  howOut?: string | null
  matchedPlayer: PlayerOption | null
  selectedPlayerId: string | null   // null = skip
  include: boolean
}

interface BowlingRow {
  name: string
  overs: number | null
  maidens: number | null
  runs: number | null
  wickets: number | null
  economy: number | null
  matchedPlayer: PlayerOption | null
  selectedPlayerId: string | null
  include: boolean
}

interface ExtractResult {
  matchInfo: { competition?: string | null; date?: string | null; teams?: string | null }
  batting: BattingRow[]
  bowling: BowlingRow[]
  playerOptions: PlayerOption[]
}

type Phase = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, decimals = 2) {
  if (val == null) return '—'
  return typeof val === 'number' ? val.toFixed(decimals).replace(/\.?0+$/, '') : val
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerSelect({
  value,
  options,
  onChange,
}: {
  value: string | null
  options: PlayerOption[]
  onChange: (id: string | null) => void
}) {
  return (
    <select
      value={value ?? '__skip__'}
      onChange={e => onChange(e.target.value === '__skip__' ? null : e.target.value)}
      className="w-full text-xs bg-navy-800 border border-ardent-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ardent/60 cursor-pointer"
    >
      <option value="__skip__">— Skip this player —</option>
      {options.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )
}

function MatchBadge({ player }: { player: PlayerOption | null }) {
  if (!player) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        No match
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Matched
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScorecardImportPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ExtractResult | null>(null)
  const [batting, setBatting] = useState<BattingRow[]>([])
  const [bowling, setBowling] = useState<BowlingRow[]>([])
  const [formatName, setFormatName] = useState('')
  const [doneCount, setDoneCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting')
  const [scanStep, setScanStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Upload & scan ──────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, JPEG).')
      setPhase('error')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setPhase('scanning')
    setScanStep(1)

    const fd = new FormData()
    fd.append('scorecard', file)

    setTimeout(() => setScanStep(2), 800)

    try {
      const res = await fetch('/api/scorecard-import', { method: 'POST', body: fd })
      setScanStep(3)
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setPhase('error')
        return
      }

      // Hydrate rows with selection state
      const hydratedBatting: BattingRow[] = (data.batting ?? []).map((b: any) => ({
        ...b,
        selectedPlayerId: b.matchedPlayer?.id ?? null,
        include: true,
      }))
      const hydratedBowling: BowlingRow[] = (data.bowling ?? []).map((bw: any) => ({
        ...bw,
        selectedPlayerId: bw.matchedPlayer?.id ?? null,
        include: true,
      }))

      setResult(data)
      setBatting(hydratedBatting)
      setBowling(hydratedBowling)
      setFormatName(data.matchInfo?.competition ?? '')
      setActiveTab(hydratedBatting.length > 0 ? 'batting' : 'bowling')
      setTimeout(() => setPhase('review'), 400)
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Network error.')
      setPhase('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formatName.trim()) {
      alert('Please enter a format / competition name before importing.')
      return
    }

    setPhase('saving')

    // Merge batting and bowling per player
    const byPlayer: Record<string, { batting?: BattingRow; bowling?: BowlingRow }> = {}

    batting.filter(r => r.include && r.selectedPlayerId).forEach(r => {
      const pid = r.selectedPlayerId!
      byPlayer[pid] = { ...byPlayer[pid], batting: r }
    })
    bowling.filter(r => r.include && r.selectedPlayerId).forEach(r => {
      const pid = r.selectedPlayerId!
      byPlayer[pid] = { ...byPlayer[pid], bowling: r }
    })

    const entries = Object.entries(byPlayer).map(([playerId, data]) => ({
      playerId,
      batting: data.batting,
      bowling: data.bowling,
    }))

    try {
      const res = await fetch('/api/scorecard-import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: formatName.trim(), entries }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Save failed.')
        setPhase('error')
        return
      }
      setDoneCount(json.updated)
      setPhase('done')
    } catch (e: any) {
      setErrorMsg(e.message)
      setPhase('error')
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const includedCount =
    batting.filter(r => r.include && r.selectedPlayerId).length +
    bowling.filter(r => r.include && r.selectedPlayerId && !batting.find(b => b.selectedPlayerId === r.selectedPlayerId && b.include)).length

  const unmatchedBatting = batting.filter(r => r.include && !r.selectedPlayerId).length
  const unmatchedBowling = bowling.filter(r => r.include && !r.selectedPlayerId).length

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <Link href="/teams" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm mb-6 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Squad
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-ardent/10 border border-ardent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-ardent-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl font-normal text-white leading-none tracking-tight">Scorecard Import</h1>
              <p className="text-gray-500 text-sm mt-0.5">Upload a match scorecard and we'll auto-fill player stats</p>
            </div>
          </div>
        </div>

        {/* ── IDLE: Upload zone ── */}
        {phase === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all py-24 px-8 text-center ${
              dragOver
                ? 'border-ardent bg-ardent/5 scale-[1.01]'
                : 'border-ardent-border hover:border-ardent/40 hover:bg-ardent/[0.03] bg-ardent-card'
            }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${dragOver ? 'bg-ardent/20 scale-110' : 'bg-navy-800'}`}>
              <svg className={`w-9 h-9 transition-colors ${dragOver ? 'text-ardent-bright' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              {dragOver ? 'Drop to scan' : 'Drop your scorecard here'}
            </p>
            <p className="text-gray-500 text-sm mb-6">or click to browse</p>
            <div className="flex items-center gap-2">
              {['PNG', 'JPG', 'JPEG'].map(ext => (
                <span key={ext} className="text-[11px] font-semibold text-gray-600 bg-navy-800 border border-ardent-border px-2.5 py-1 rounded-full">
                  {ext}
                </span>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-6 max-w-sm">
              We'll use AI to read the scorecard, match players by name, and prefill their batting & bowling stats.
            </p>
          </div>
        )}

        {/* ── SCANNING ── */}
        {phase === 'scanning' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image preview */}
            <div className="rounded-2xl overflow-hidden border border-ardent-border bg-ardent-card aspect-[4/3] relative">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Scorecard" className="w-full h-full object-contain p-2" />
              )}
              {/* Scanning overlay */}
              <div className="absolute inset-0 bg-ardent/5 flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-ardent to-transparent animate-scan-line" />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col justify-center gap-5 px-4">
              <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-2">Scanning scorecard</p>
              {[
                { step: 1, label: 'Uploading image' },
                { step: 2, label: 'Reading scorecard with AI' },
                { step: 3, label: 'Matching players in database' },
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    scanStep > step
                      ? 'bg-green-500/20 border border-green-500/40'
                      : scanStep === step
                        ? 'bg-ardent/20 border border-ardent/40'
                        : 'bg-navy-800 border border-ardent-border'
                  }`}>
                    {scanStep > step ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : scanStep === step ? (
                      <svg className="w-4 h-4 text-ardent-bright animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <span className="text-gray-600 text-xs font-bold">{step}</span>
                    )}
                  </div>
                  <p className={`text-sm font-medium transition-colors ${
                    scanStep > step ? 'text-green-400' : scanStep === step ? 'text-white' : 'text-gray-600'
                  }`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {phase === 'review' && result && (
          <div className="space-y-6">
            {/* Match info bar */}
            {(result.matchInfo.teams || result.matchInfo.date || result.matchInfo.competition) && (
              <div className="flex flex-wrap items-center gap-4 bg-ardent-card border border-ardent-border rounded-xl px-5 py-3">
                {result.matchInfo.teams && (
                  <span className="text-white font-semibold text-sm">{result.matchInfo.teams}</span>
                )}
                {result.matchInfo.competition && (
                  <span className="text-ardent-bright text-xs bg-ardent/10 border border-ardent/20 px-3 py-1 rounded-full">
                    {result.matchInfo.competition}
                  </span>
                )}
                {result.matchInfo.date && (
                  <span className="text-gray-500 text-xs">{result.matchInfo.date}</span>
                )}
              </div>
            )}

            {/* Format name input + stats bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-[11px] text-gray-600 uppercase tracking-widest block mb-1.5">
                  Format / Competition Name
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formatName}
                  onChange={e => setFormatName(e.target.value)}
                  placeholder="e.g. Senior League 2, T20 Bowl, NCU Cup..."
                  className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-ardent/60"
                />
              </div>
              <div className="flex gap-3 sm:pt-6">
                <div className="text-center">
                  <p className="text-white font-bold text-xl leading-none">{batting.filter(r => r.include).length}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Batting</p>
                </div>
                <div className="w-px bg-ardent-border" />
                <div className="text-center">
                  <p className="text-white font-bold text-xl leading-none">{bowling.filter(r => r.include).length}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Bowling</p>
                </div>
                <div className="w-px bg-ardent-border" />
                <div className="text-center">
                  <p className={`font-bold text-xl leading-none ${unmatchedBatting + unmatchedBowling > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {unmatchedBatting + unmatchedBowling}
                  </p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Unmatched</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-ardent-border flex gap-1">
              {(['batting', 'bowling'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-ardent rounded-t-full" />}
                </button>
              ))}
            </div>

            {/* Batting rows */}
            {activeTab === 'batting' && (
              <div className="space-y-2">
                {batting.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No batting data found in scorecard.</p>
                )}
                {batting.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border transition-all ${
                      row.include
                        ? 'border-ardent-border bg-ardent-card'
                        : 'border-ardent-border/30 bg-navy-900 opacity-40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5">
                      {/* Include toggle */}
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={e => {
                          const next = [...batting]
                          next[i] = { ...next[i], include: e.target.checked }
                          setBatting(next)
                        }}
                        className="w-4 h-4 rounded accent-ardent cursor-pointer flex-shrink-0"
                      />

                      {/* Scorecard name + match badge */}
                      <div className="flex-shrink-0 w-48">
                        <p className="text-white text-sm font-semibold">{row.name}</p>
                        <div className="mt-1">
                          <MatchBadge player={row.matchedPlayer} />
                        </div>
                      </div>

                      {/* Player assignment */}
                      <div className="flex-1 min-w-0 max-w-xs">
                        <PlayerSelect
                          value={row.selectedPlayerId}
                          options={result.playerOptions}
                          onChange={id => {
                            const next = [...batting]
                            next[i] = { ...next[i], selectedPlayerId: id }
                            setBatting(next)
                          }}
                        />
                      </div>

                      {/* Stats preview */}
                      <div className="flex items-center gap-4 ml-auto flex-shrink-0">
                        <Stat label="Runs" value={row.runs} />
                        <Stat label="Balls" value={row.balls} />
                        <Stat label="4s" value={row.fours} />
                        <Stat label="6s" value={row.sixes} />
                        <Stat label="SR" value={row.strikeRate} />
                        {row.notOut && (
                          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                            NOT OUT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bowling rows */}
            {activeTab === 'bowling' && (
              <div className="space-y-2">
                {bowling.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No bowling data found in scorecard.</p>
                )}
                {bowling.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border transition-all ${
                      row.include
                        ? 'border-ardent-border bg-ardent-card'
                        : 'border-ardent-border/30 bg-navy-900 opacity-40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={e => {
                          const next = [...bowling]
                          next[i] = { ...next[i], include: e.target.checked }
                          setBowling(next)
                        }}
                        className="w-4 h-4 rounded accent-ardent cursor-pointer flex-shrink-0"
                      />

                      <div className="flex-shrink-0 w-48">
                        <p className="text-white text-sm font-semibold">{row.name}</p>
                        <div className="mt-1">
                          <MatchBadge player={row.matchedPlayer} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 max-w-xs">
                        <PlayerSelect
                          value={row.selectedPlayerId}
                          options={result.playerOptions}
                          onChange={id => {
                            const next = [...bowling]
                            next[i] = { ...next[i], selectedPlayerId: id }
                            setBowling(next)
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-4 ml-auto flex-shrink-0">
                        <Stat label="Overs" value={row.overs} />
                        <Stat label="Mdns" value={row.maidens} />
                        <Stat label="Runs" value={row.runs} />
                        <Stat label="Wkts" value={row.wickets} />
                        <Stat label="Econ" value={row.economy} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-ardent-border">
              <div>
                <p className="text-white text-sm font-semibold">
                  Ready to import {includedCount} player{includedCount !== 1 ? 's' : ''}
                </p>
                {unmatchedBatting + unmatchedBowling > 0 && (
                  <p className="text-orange-400 text-xs mt-0.5">
                    {unmatchedBatting + unmatchedBowling} unmatched row{unmatchedBatting + unmatchedBowling !== 1 ? 's' : ''} will be skipped — assign players above to include them
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('idle'); setPreview(null); setResult(null) }}
                  className="px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 rounded-xl transition-all"
                >
                  Start over
                </button>
                <button
                  onClick={handleSave}
                  disabled={includedCount === 0 || !formatName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-ardent hover:bg-ardent-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-ardent/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Import {includedCount} Player{includedCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SAVING ── */}
        {phase === 'saving' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg className="w-10 h-10 text-ardent-bright animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-white font-semibold">Saving stats to players…</p>
            <p className="text-gray-500 text-sm">Updating the database</p>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="w-9 h-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-2xl font-semibold mb-2">Import complete</h2>
              <p className="text-gray-400 text-sm">
                Stats added to <span className="text-white font-semibold">{doneCount} player{doneCount !== 1 ? 's' : ''}</span> successfully.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/teams" className="px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 rounded-xl transition-all">
                View Squad
              </Link>
              <button
                onClick={() => { setPhase('idle'); setPreview(null); setResult(null) }}
                className="px-6 py-2.5 bg-ardent hover:bg-ardent-light text-white font-semibold text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-ardent/20"
              >
                Import another scorecard
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-400 text-sm max-w-md">{errorMsg}</p>
            </div>
            <button
              onClick={() => setPhase('idle')}
              className="px-6 py-2.5 bg-ardent hover:bg-ardent-light text-white font-semibold text-sm rounded-xl transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="text-center hidden md:block">
      <p className="text-white text-sm font-semibold tabular-nums">{value ?? '—'}</p>
      <p className="text-gray-600 text-[10px]">{label}</p>
    </div>
  )
}
