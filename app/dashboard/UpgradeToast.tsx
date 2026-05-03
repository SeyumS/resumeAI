'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function UpgradeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const upgraded = () => {
    if (searchParams.get('upgraded') === 'true') {
      setVisible(true)
      // Strip the query param from the URL without a navigation
      router.replace(pathname, { scroll: false })
      const t = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }
  upgraded()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-violet-200 bg-white px-5 py-4 shadow-lg shadow-violet-100"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-950">You&apos;re now on Pro!</p>
        <p className="mt-0.5 text-xs text-gray-500">Unlimited rewrites unlocked.</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="ml-2 shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
