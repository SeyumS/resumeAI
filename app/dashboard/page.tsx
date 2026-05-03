import { Suspense } from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import UpgradeToast from './UpgradeToast'

const FREE_LIMIT = 2

function getFileName(fileUrl: string | null): string {
  if (!fileUrl) return 'Resume'
  const raw = fileUrl.split('/').pop() ?? ''
  return raw.replace(/^\d+-/, '').replace(/_/g, ' ') || 'Resume'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: recentRewrites }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, plan, rewrite_count')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('rewrites')
      .select('id, created_at, match_score, resume:resumes(file_url)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const isPro = profile?.plan === 'pro'
  const rewritesUsed = profile?.rewrite_count ?? 0
  const rewritesRemaining = Math.max(0, FREE_LIMIT - rewritesUsed)

  return (
    <div className="space-y-8">
      <Suspense>
        <UpgradeToast />
      </Suspense>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of your resume activity.
          </p>
        </div>
        <PlanBadge isPro={isPro} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Plan</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">{isPro ? 'Pro' : 'Free'}</p>
          {!isPro && (
            <p className="mt-2 text-xs text-gray-400">
              <span className="font-medium text-gray-700">Upgrade to Pro</span>
              {' '}for unlimited rewrites
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Rewrites remaining
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {isPro ? '∞' : rewritesRemaining}
          </p>
          {!isPro && (
            <p className="mt-2 text-xs text-gray-400">
              {rewritesUsed} of {FREE_LIMIT} used
              {rewritesRemaining === 0 && (
                <span className="ml-2 font-medium text-amber-600">Limit reached</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Upload CTA */}
      <Link
        href="/dashboard/upload"
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-950 px-6 py-5 text-base font-semibold text-white shadow-lg shadow-gray-900/15 transition-colors hover:bg-gray-800"
      >
        <UploadIcon />
        Upload Resume
      </Link>

      {/* Recent activity */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Recent activity
          </h2>
          {recentRewrites && recentRewrites.length > 0 && (
            <Link
              href="/dashboard/resumes"
              className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all →
            </Link>
          )}
        </div>

        {!recentRewrites || recentRewrites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <DocIcon className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No rewrites yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Upload a resume and run your first AI rewrite.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recentRewrites.map((rw) => {
              const resumeRow = Array.isArray(rw.resume) ? rw.resume[0] : rw.resume
              return (
                <li
                  key={rw.id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <DocIcon className="text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {getFileName((resumeRow as { file_url: string | null } | null)?.file_url ?? null)}
                    </p>
                    <p className="text-xs text-gray-400">Rewritten · {timeAgo(rw.created_at)}</p>
                  </div>
                  {rw.match_score != null && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 tabular-nums">
                      {Math.round(Number(rw.match_score))}% match
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function PlanBadge({ isPro }: { isPro: boolean }) {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
        isPro
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-gray-100 text-gray-600 ring-gray-200',
      ].join(' ')}
    >
      {isPro ? '✦ Pro' : 'Free'}
    </span>
  )
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
