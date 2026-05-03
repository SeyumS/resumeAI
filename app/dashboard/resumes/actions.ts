'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function deleteResume(resumeId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch file_url before deleting (needed for storage cleanup)
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('file_url')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !resume) throw new Error('Resume not found')

  // Delete DB record — rewrites cascade automatically
  const { error: deleteError } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', user.id)

  if (deleteError) throw new Error(deleteError.message)

  // Best-effort storage cleanup — extract path after the bucket name
  if (resume.file_url) {
    const match = resume.file_url.match(/\/public\/resumes\/(.+)$/)
    if (match?.[1]) {
      await supabase.storage.from('resumes').remove([match[1]])
    }
  }

  revalidatePath('/dashboard/resumes')
  revalidatePath('/dashboard')
}
