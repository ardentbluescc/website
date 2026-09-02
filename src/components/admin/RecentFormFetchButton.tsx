'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function RecentFormFetchButton() {
  const { id } = useDocumentInfo()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    if (!id) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch(`/api/players/${id}/recent-form`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong.')
        return
      }
      setStatus('done')
      setMessage(
        json.added > 0
          ? `Checked ${json.checked} matches — added ${json.added} new ${json.added === 1 ? 'entry' : 'entries'}.`
          : `Checked ${json.checked} matches — no new appearances found.`
      )
    } catch (e: any) {
      setStatus('error')
      setMessage(e.message ?? 'Network error.')
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Recent Form</label>
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
        {status === 'loading' ? 'Scanning NV Play…' : 'Fetch Recent Form from NV Play'}
      </button>
      {!id && (
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Save the player first, then come back to fetch their match history.</p>
      )}
      {message && (
        <p style={{ fontSize: 12, marginTop: 8, color: status === 'error' ? '#dc2626' : '#16a34a' }}>{message}</p>
      )}
    </div>
  )
}
