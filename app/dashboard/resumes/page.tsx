import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { DeleteButton } from './DeleteButton'

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

export default async function ResumesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, file_url, created_at, rewrites!rewrites_resume_id_fkey(id)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const count = resumes?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">My Resumes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {count} {count === 1 ? 'resume' : 'resumes'} uploaded
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          <PlusIcon />
          Upload new
        </Link>
      </div>

      {count === 0 ? (
        /* Empty state */
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-8 py-20 text-center">
          {/* Subtle radial glow behind the illustration */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-72 w-72 rounded-full bg-violet-50 blur-3xl" />
          </div>

          {/* Illustration */}
          <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
            {/* Stacked pages effect */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-6 rounded-2xl border border-gray-200 bg-gray-50" />
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-3 rounded-2xl border border-gray-200 bg-gray-100" />
            {/* Front page */}
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white shadow-lg shadow-violet-100/60">
              <div className="h-1.5 w-12 rounded-full bg-violet-200" />
              <div className="h-1.5 w-10 rounded-full bg-gray-200" />
              <div className="h-1.5 w-11 rounded-full bg-gray-200" />
              <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="relative">
            <h2 className="text-xl font-bold tracking-tight text-gray-950">
              Upload your first resume to get started
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Drop in your PDF and let AI tailor it to any job description — matching keywords, boosting impact, and scoring your fit.
            </p>

            {/* Feature chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {['ATS keyword match', 'Match score', 'PDF download'].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  {f}
                </span>
              ))}
            </div>

            <Link
              href="/dashboard/upload"
              className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-gray-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 transition-colors hover:bg-gray-800"
            >
              <PlusIcon />
              Upload resume
            </Link>

            <p className="mt-4 text-xs text-gray-400">PDF only · max 5 MB · free to start</p>
          </div>
        </div>
      ) : (
        /* Resume grid */
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {resumes!.map((resume) => {
            const rewrites = resume.rewrites as { id: string }[]
            const rewriteCount = rewrites?.length ?? 0

            return (
              <li
                key={resume.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                {/* File info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                    <FileIcon className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold leading-snug text-gray-900"
                      title={getFileName(resume.file_url)}
                    >
                      {getFileName(resume.file_url)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Uploaded {formatDate(resume.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {rewriteCount} {rewriteCount === 1 ? 'rewrite' : 'rewrites'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/rewrite/${resume.id}`}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    New Rewrite
                  </Link>
                  <DeleteButton resumeId={resume.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
