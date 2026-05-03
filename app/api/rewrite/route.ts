import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'

const FREE_LIMIT = 2

const SYSTEM_PROMPT = `You are an expert resume coach and ATS optimization specialist. Your task is to rewrite resume bullet points to be highly tailored to a specific job description while preserving the candidate's authentic experience. 

When given a resume and a job description, you must:
1. Rewrite every bullet point using strong action verbs.
2. Quantify achievements where actual measurable results are present, but never exaggerate or fabricate accomplishments or responsibilities.
3. Always accurately reflect the candidate's real experience; do not add or embellish details that are not evident from the resume.
4. Mirror the exact language, terminology, and phrasing used in the job description wherever appropriate and natural.
5. Add only those keywords from the job description that genuinely fit the candidate's background.
6. Ensure the rewritten resume maintains the integrity and authenticity of the original experience.

Calculate a match score (0–100) reflecting:
- Alignment of keywords and terminology with the job description,
- Relevance of the candidate's experience to the new role,
- Professional formatting and clarity.

Identify the top improvements you made and the keywords you added in the process.

Respond with ONLY valid JSON in this exact shape — no markdown, no code fences, no extra text:
{
  "rewritten_text": "<full rewritten resume text>",
  "match_score": <integer 0-100>,
  "key_improvements": ["<improvement 1>", "<improvement 2>", ...],
  "keywords_added": ["<keyword 1>", "<keyword 2>", ...]
}`

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let resume_id: string
  let job_description: string
  try {
    const body = await req.json()
    resume_id = body.resume_id
    job_description = body.job_description
    if (!resume_id || !job_description) throw new Error('missing fields')
  } catch {
    return NextResponse.json({ error: 'resume_id and job_description are required' }, { status: 400 })
  }

  // Enforce free plan limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, rewrite_count')
    .eq('user_id', user.id)
    .single()

  if (profile?.plan !== 'pro' && (profile?.rewrite_count ?? 0) >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'Free plan limit reached. Upgrade to Pro for unlimited rewrites.' },
      { status: 403 }
    )
  }

  // Fetch resume text (scoped to this user)
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('original_text')
    .eq('id', resume_id)
    .eq('user_id', user.id)
    .single()

  if (resumeError || !resume) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
  }

  // Call Claude with streaming
  const client = new Anthropic()
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `RESUME:\n${resume.original_text}\n\nJOB DESCRIPTION:\n${job_description}`,
      },
    ],
  })

  const message = await stream.finalMessage()
  const rawText = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('')

  // Strip code fences if Claude wraps in them despite instructions
  const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed: {
    rewritten_text: string
    match_score: number
    key_improvements: string[]
    keywords_added: string[]
  }
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return NextResponse.json({ error: 'Failed to parse Claude response' }, { status: 500 })
  }

  // Save rewrite
  const { data: rewrite, error: insertError } = await supabase
    .from('rewrites')
    .insert({
      resume_id,
      user_id: user.id,
      job_description,
      rewritten_text: parsed.rewritten_text,
      match_score: parsed.match_score,
    })
    .select('id')
    .single()

  if (insertError || !rewrite) {
    return NextResponse.json({ error: 'Failed to save rewrite' }, { status: 500 })
  }

  // Increment rewrite_count for free users
  if (profile?.plan !== 'pro') {
    await supabase
      .from('profiles')
      .update({ rewrite_count: (profile?.rewrite_count ?? 0) + 1 })
      .eq('user_id', user.id)
  }

  return NextResponse.json({
    id: rewrite.id,
    rewritten_text: parsed.rewritten_text,
    match_score: parsed.match_score,
    key_improvements: parsed.key_improvements,
    keywords_added: parsed.keywords_added,
  })
}
