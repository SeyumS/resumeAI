import { createClient } from './client'

export async function uploadResumePDF(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${userId}/${timestamp}-${safeName}`

  const { error } = await supabase.storage.from('resumes').upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  })

  if (error) throw error

  return path
}
