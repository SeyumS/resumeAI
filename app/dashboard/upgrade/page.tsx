import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import CheckoutButton from './CheckoutButton'

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

export default async function UpgradePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const isPro = profile?.plan === 'pro'

  if (isPro) redirect('/dashboard')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Upgrade to Pro</h1>
        <p className="mt-1 text-sm text-gray-500">
          Unlock unlimited rewrites and premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Free</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-950">$0</span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="mt-1.5 text-sm text-gray-500">Get started at no cost.</p>
          </div>

          <ul className="flex-1 space-y-3 text-sm text-gray-600">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckIcon className="shrink-0 text-gray-400" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <div className="w-full rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-400">
              Current plan
            </div>
          </div>
        </div>

        {/* Pro plan */}
        <div className="relative flex flex-col rounded-2xl border-2 border-violet-400 bg-white p-6 shadow-sm shadow-violet-100">
          {/* Most popular badge */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            Most popular
          </span>

          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-500">Pro</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-950">$9</span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="mt-1.5 text-sm text-gray-500">Everything you need to land the job.</p>
          </div>

          <ul className="flex-1 space-y-3 text-sm text-gray-600">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckIcon className="shrink-0 text-violet-500" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <CheckoutButton />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Cancel anytime. Secure checkout via Stripe.
      </p>
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
