'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  href: string
  label: string
  icon: React.FC<{ className?: string }>
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard',  icon: HomeIcon,     exact: true },
  { href: '/dashboard/resumes',  label: 'My Resumes', icon: FileTextIcon              },
  { href: '/dashboard/rewrites', label: 'Rewrites',   icon: SparklesIcon              },
  { href: '/dashboard/settings', label: 'Settings',   icon: SettingsIcon              },
]

function active(href: string, pathname: string, exact = false) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Sidebar({
  displayName,
  isPro,
  children,
}: {
  displayName: string
  isPro: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router  = useRouter()
  const supabase = createClient()

  // Close drawer on every navigation
  useEffect(() => { const closeSidebar = async () => {setOpen(false)}; closeSidebar()}, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Mobile backdrop ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col',
          'border-r border-gray-200 bg-white',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-white">
            <span className="text-[11px] font-bold tracking-tight">RA</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-950">ResumeAI</span>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const on = active(href, pathname, exact)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      on
                        ? 'bg-gray-100 text-gray-950'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <Icon
                      className={[
                        'shrink-0 transition-colors',
                        on ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600',
                      ].join(' ')}
                    />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* Upgrade / Pro status */}
          {isPro ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <span className="text-sm text-amber-400">✦</span>
              <span className="text-sm font-medium text-gray-400">Pro Plan</span>
            </div>
          ) : (
            <Link
              href="/dashboard/upgrade"
              className={[
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                active('/dashboard/upgrade', pathname)
                  ? 'bg-violet-100 text-violet-900'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-900',
              ].join(' ')}
            >
              <ZapIcon
                className={[
                  'shrink-0 transition-colors',
                  active('/dashboard/upgrade', pathname)
                    ? 'text-violet-700'
                    : 'text-violet-400 group-hover:text-violet-600',
                ].join(' ')}
              />
              Upgrade to Pro
            </Link>
          )}
        </nav>

        {/* User row */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
              {initials}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
              {displayName || 'Account'}
            </p>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Mobile topbar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-950 text-white">
              <span className="text-[10px] font-bold tracking-tight">RA</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-950">ResumeAI</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
