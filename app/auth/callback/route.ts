import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Upsert profile — the DB trigger handles new signups, but this covers
  // edge cases where the trigger didn't fire (e.g. local dev without trigger).
  await supabase.from('profiles').upsert(
    {
      user_id: data.user.id,
      full_name:
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        null,
    },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  return NextResponse.redirect(`${origin}${next}`)
}
