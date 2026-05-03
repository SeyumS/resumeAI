'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#f8fafc,#eef2f7_42%,#e5e7eb)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/95 rounded-3xl shadow-xl shadow-gray-200/70 border border-white p-8 sm:p-10">
          <div className="text-center mb-8">
            <LogoMark />
            <h1 className="text-3xl font-bold text-gray-950 tracking-tight">ResumeAI</h1>
            <p className="text-sm text-gray-500 mt-2">Welcome back. Sign in to continue building better resumes.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-950 placeholder-gray-400 shadow-inner shadow-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-gray-900/10 focus:border-gray-400 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-950 placeholder-gray-400 shadow-inner shadow-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-gray-900/10 focus:border-gray-400 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-900/10 transition"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-7">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gray-950 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function LogoMark() {
  return (
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg shadow-gray-900/20">
      <span className="text-lg font-bold tracking-tight">RA</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
