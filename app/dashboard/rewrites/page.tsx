import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

function getFileName(fileUrl: string | null): string {
  if (!fileUrl) return 'Untitled Resume'
  const raw = fileUrl.split('/').pop() ?? ''
  return raw.replace(/^\d+-/, '').replace(/_/g, ' ') || 'Untitled Resume'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-700 bg-green-50 ring-green-200'
  if (score >= 60) return 'text-amber-700 bg-amber-50 ring-amber-200'
  return 'text-red-700 bg-red-50 ring-red-200'
}

export default async function RewritesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rewrites } = await supabase
    .from('rewrites')
    .select('id, match_score, job_description, created_at, resumes(id, file_url)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const count = rewrites?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Rewrites</h1>
        <p className="mt-1 text-sm text-gray-500">
          {count} {count === 1 ? 'rewrite' : 'rewrites'} generated
        </p>
      </div>

      {count === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white px-8 py-20 text-center">
          <p className="text-sm text-gray-500">No rewrites yet.</p>
          <Link
            href="/dashboard/resumes"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            Go to My Resumes
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rewrites!.map((rw) => {
            const resume = rw.resumes as { id: string; file_url: string | null } | null
            const fileName = getFileName(resume?.file_url ?? null)
            const snippet = rw.job_description.slice(0, 120).trimEnd()
            const truncated = rw.job_description.length > 120

            return (
              <li
                key={rw.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-400">
                    {snippet}{truncated ? '…' : ''}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(rw.created_at)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={[
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
                      scoreColor(rw.match_score),
                    ].join(' ')}
                  >
                    {rw.match_score}% match
                  </span>
                  {resume && (
                    <Link
                      href={`/dashboard/rewrite/${resume.id}`}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      New Rewrite
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
