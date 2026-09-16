'use client'

import { useState } from 'react'
import { triggerFileDownload } from '@/lib/admin-download'

export default function ExportPlayersButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/players/export')
      await triggerFileDownload(res, 'players-export.csv')
      setStatus('idle')
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
          {status === 'loading' ? 'Preparing export…' : 'Export All Players (CSV)'}
        </button>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          Downloads bio, batting stats, bowling stats, and match log for every player as one CSV file.
        </p>
      </div>
      {message && <p style={{ fontSize: 12, marginTop: 10, color: '#dc2626' }}>{message}</p>}
    </div>
  )
}
