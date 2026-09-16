'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { triggerFileDownload } from '@/lib/admin-download'

export default function ExportPlayerButton() {
  const { id } = useDocumentInfo()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    if (!id) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch(`/api/players/export?id=${id}`)
      await triggerFileDownload(res, `player-${id}-export.csv`)
      setStatus('idle')
    } catch (e: any) {
      setStatus('error')
      setMessage(e.message ?? 'Network error.')
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Export Data</label>
      <button
        type="button"
        onClick={handleClick}
        disabled={!id || status === 'loading'}
        style={{
          width: '100%',
          padding: '9px 14px',
          fontSize: 13,
          fontWeight: 600,
          background: !id ? '#e2e8f0' : status === 'loading' ? '#93b4f5' : '#1D6EF5',
          color: !id ? '#94a3b8' : '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: !id || status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Preparing…' : 'Export as CSV'}
      </button>
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
        {!id ? 'Save the player first, then come back to export.' : "Downloads this player's bio, stats, and match log."}
      </p>
      {message && <p style={{ fontSize: 12, marginTop: 8, color: '#dc2626' }}>{message}</p>}
    </div>
  )
}
