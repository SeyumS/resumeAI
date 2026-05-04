import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { extractText } from 'unpdf'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File) || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 5 MB limit.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload to Supabase Storage
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${user.id}/${Date.now()}-${safeName}`

  const { error: storageError } = await supabase.storage
    .from('resumes')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false })

  if (storageError) {
    return NextResponse.json({ error: 'Storage upload failed.' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(storagePath)

  // Extract text from PDF
  let originalText = ''
  try {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true })
    originalText = text.join('\n').trim()
  } catch {
    // Non-fatal — proceed without extracted text
  }

  // Persist to database
  const { data: resume, error: dbError } = await supabase
    .from('resumes')
    .insert({ user_id: user.id, original_text: originalText, file_url: publicUrl })
    .select('id')
    .single()

  if (dbError || !resume) {
    return NextResponse.json({ error: 'Failed to save resume.' }, { status: 500 })
  }

  return NextResponse.json({ id: resume.id })
}
