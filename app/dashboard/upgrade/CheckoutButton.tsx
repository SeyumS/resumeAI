'use client'

import { useState } from 'react'

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to Stripe…' : 'Upgrade to Pro — $9/mo'}
      </button>
      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
