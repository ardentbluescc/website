'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-5xl font-normal text-white mb-4">Get in Touch</h1>
        <p className="text-gray-400 text-lg mb-12">
          Questions about membership, training, or anything else? We&apos;d love to hear from you.
        </p>

        {status === 'success' ? (
          <div className="bg-ardent/10 border border-ardent/30 rounded-2xl p-8 text-center">
            <p className="text-ardent-bright font-bold text-lg mb-2">Message sent</p>
            <p className="text-gray-400 text-sm">
              Thanks for reaching out — we&apos;ll get back to you as soon as we can.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
              <select
                name="subject"
                required
                defaultValue=""
                className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-ardent transition-colors"
              >
                <option value="" disabled>Select a topic</option>
                <option value="membership">Membership Enquiry</option>
                <option value="training">Training &amp; Coaching</option>
                <option value="sponsorship">Sponsorship</option>
                <option value="general">General Enquiry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-ardent hover:bg-ardent-light text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-ardent/20 text-sm disabled:opacity-60 disabled:hover:scale-100"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
