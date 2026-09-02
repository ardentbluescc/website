'use client'

import { useState } from 'react'

export default function RecentFormFetchAllButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/players/recent-form-all', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong.')
        return
      }
      setStatus('done')
      setMessage(
        `Checked ${json.checked} matches — updated ${json.playersUpdated} player${json.playersUpdated === 1 ? '' : 's'} with ${json.totalRowsAdded} new ${json.totalRowsAdded === 1 ? 'entry' : 'entries'}.`
      )
    } catch (e: any) {
      setStatus('error')
      setMessage(e.message ?? 'Network error.')
    }
  }

  return (
    <div style={{ margin: '0 0 20px', padding: 16, border: '1px solid #2a2a2a', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={status === 'loading'}
          style={{
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            background: status === 'loading' ? '#93b4f5' : '#1D6EF5',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          {status === 'loading' ? 'Scanning NV Play…' : 'Update Match History for All Players'}
        </button>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          Scans every NV Play match once and refreshes Recent Form + By Competition for every player. Takes ~30-60 seconds.
        </p>
      </div>
      {message && (
        <p style={{ fontSize: 12, marginTop: 10, color: status === 'error' ? '#dc2626' : '#16a34a' }}>{message}</p>
      )}
    </div>
  )
}
