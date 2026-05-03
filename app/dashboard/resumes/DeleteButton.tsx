'use client'

import { useTransition } from 'react'
import { deleteResume } from './actions'

export function DeleteButton({ resumeId }: { resumeId: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this resume and all its rewrites? This cannot be undone.')) return
    startTransition(() => deleteResume(resumeId))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
