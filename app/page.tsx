import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

const FREE_FEATURES = [
  '2 AI rewrites per month',
  'ATS keyword matching',
  'Match score analysis',
  'PDF upload & parsing',
]

const PRO_FEATURES = [
  'Unlimited AI rewrites',
  'ATS keyword matching',
  'Match score analysis',
  'PDF upload & parsing',
  'PDF download',
  'Priority support',
]

const TESTIMONIALS = [
  {
    quote: "I applied to 12 jobs and got 8 interviews. ResumeAI rewrites are the reason my resume actually gets read.",
    name: 'Ashley M.',
    role: 'Product Manager, hired at Notion',
    initials: 'AM',
  },
  {
    quote: "I was sending the same resume everywhere and getting nothing back. After using ResumeAI I landed a role in 3 weeks.",
    name: 'Daniel K.',
    role: 'Software Engineer, hired at Stripe',
    initials: 'DK',
  },
  {
    quote: "The AI catches keywords I would never think to include. My ATS pass-through rate went from 20% to over 70%.",
    name: 'Priya S.',
    role: 'Data Analyst, hired at Shopify',
    initials: 'PS',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload your resume',
    description: 'Drop in your existing PDF resume. We parse it instantly — no reformatting required.',
  },
  {
    number: '02',
    title: 'Paste the job description',
    description: 'Copy the job listing and paste it in. Our AI identifies every keyword and requirement.',
  },
  {
    number: '03',
    title: 'Download your rewrite',
    description: 'Get a tailored, ATS-optimised resume in seconds. Ready to send.',
  },
]

export default async function Home() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-full bg-white font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-gray-950">
            Resume<span className="text-violet-600">AI</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-6 py-28 text-center">
        {/* subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-center"
        >
          <div className="mt-[-120px] h-[500px] w-[900px] rounded-full bg-violet-100 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-semibold text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            AI-powered resume optimisation
          </span>

          <h1 className="mt-4 text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-950 sm:text-6xl">
            Get hired faster —<br />
            <span className="text-violet-600">AI rewrites your resume</span>
            <br />for each job
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
            Stop sending the same resume everywhere. ResumeAI tailors your resume to every job description in seconds, beating ATS filters and getting you more interviews.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="w-full rounded-2xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:shadow-violet-300 sm:w-auto"
            >
              Start free
            </Link>
            <Link
              href="#how-it-works"
              className="w-full rounded-2xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              See example
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-400">No credit card required · Free plan available</p>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-gray-100 bg-gray-50 py-5 text-center">
        <p className="text-sm font-medium text-gray-500">
          Trusted by <span className="font-bold text-gray-800">2,400+</span> job seekers · Average{' '}
          <span className="font-bold text-gray-800">3× more</span> interview callbacks
        </p>
      </div>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Real people, real results
          </h2>
          <p className="mt-3 text-gray-500">
            Job seekers who tailored their resume with ResumeAI.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              Three steps to more interviews
            </h2>
            <p className="mt-3 text-gray-500">
              From upload to tailored resume in under a minute.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative flex flex-col">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-violet-100 sm:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-xl font-extrabold text-white shadow-md shadow-violet-200">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-gray-500">Start free. Upgrade when you need unlimited power.</p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Free</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-gray-950">$0</span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Get started at no cost.</p>

            <ul className="mt-8 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckIcon className="shrink-0 text-gray-400" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="mt-8 block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border-2 border-violet-500 bg-white p-8 shadow-lg shadow-violet-100">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3.5 py-1 text-[11px] font-semibold text-white shadow">
              Most popular
            </span>

            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-500">Pro</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-gray-950">$9</span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Everything you need to land the job.</p>

            <ul className="mt-8 flex-1 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckIcon className="shrink-0 text-violet-500" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="mt-8 block w-full rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-200 transition-colors hover:bg-violet-700"
            >
              Start with Pro
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Cancel anytime · Secure checkout via Stripe · No hidden fees
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <span className="text-sm font-bold tracking-tight text-gray-950">
            Resume<span className="text-violet-600">AI</span>
          </span>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <Link href="/auth/login" className="hover:text-gray-600 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
