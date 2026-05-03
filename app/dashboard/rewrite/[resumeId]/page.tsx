import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import RewriteEditor from './RewriteEditor'

const FREE_LIMIT = 2

function getFileName(fileUrl: string | null): string {
  if (!fileUrl) return 'Untitled Resume'
  const raw = fileUrl.split('/').pop() ?? ''
  return raw.replace(/^\d+-/, '').replace(/_/g, ' ') || 'Untitled Resume'
}

export default async function RewritePage({
  params,
}: {
  params: Promise<{ resumeId: string }>
}) {
  const { resumeId } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: resume }, { data: profile }] = await Promise.all([
    supabase
      .from('resumes')
      .select('id, file_url, original_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('plan, rewrite_count')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!resume) redirect('/dashboard/resumes')

  const isPro = profile?.plan === 'pro'
  const rewriteCount = profile?.rewrite_count ?? 0
  const limitReached = !isPro && rewriteCount >= FREE_LIMIT

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/resumes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <BackIcon />
          My Resumes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400 truncate max-w-[200px]">
          {getFileName(resume.file_url)}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Rewrite Resume</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste a job description to get an AI-tailored rewrite with a match score.
        </p>
      </div>

      <UsageBar isPro={isPro} rewriteCount={rewriteCount} limit={FREE_LIMIT} />

      {limitReached ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
            🔒
          </div>
          <h2 className="text-base font-semibold text-gray-950">
            You&apos;ve used your {FREE_LIMIT} free rewrites this month
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Upgrade to Pro for unlimited AI rewrites, PDF downloads, and priority support.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            <ZapIcon />
            Upgrade to Pro
          </Link>
        </div>
      ) : (
        <RewriteEditor
          resumeId={resume.id}
          originalText={resume.original_text ?? ''}
          fileName={getFileName(resume.file_url)}
          isPro={isPro}
        />
      )}
    </div>
  )
}

function UsageBar({
  isPro,
  rewriteCount,
  limit,
}: {
  isPro: boolean
  rewriteCount: number
  limit: number
}) {
  if (isPro) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
          ✓ Unlimited rewrites
        </span>
      </div>
    )
  }

  const used = Math.min(rewriteCount, limit)
  const pct = (used / limit) * 100
  const atLimit = used >= limit
  const fillColor = atLimit ? 'bg-red-500' : used > 0 ? 'bg-amber-400' : 'bg-gray-300'
  const textColor = atLimit ? 'text-red-600' : 'text-gray-500'

  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500">Rewrites this month</span>
          <span className={['text-xs font-semibold tabular-nums', textColor].join(' ')}>
            {used}/{limit}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={['h-full rounded-full transition-all', fillColor].join(' ')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <Link
        href="/dashboard/upgrade"
        className="shrink-0 text-xs font-semibold text-violet-600 transition-colors hover:text-violet-800"
      >
        Upgrade ↗
      </Link>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
