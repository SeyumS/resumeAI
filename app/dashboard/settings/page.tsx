import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import PortalButton from './PortalButton'
import SignOutButton from './SignOutButton'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const isPro = profile?.plan === 'pro'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and billing.</p>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row label="Name" value={profile?.full_name ?? '—'} />
        <Row label="Email" value={user.email ?? '—'} />
      </Section>

      {/* Plan */}
      <Section title="Plan">
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Current plan</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
                  isPro
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : 'bg-gray-100 text-gray-600 ring-gray-200',
                ].join(' ')}
              >
                {isPro ? '✦ Pro' : 'Free'}
              </span>
              {!isPro && (
                <span className="text-xs text-gray-400">2 rewrites / month</span>
              )}
            </div>
          </div>

          {isPro ? (
            <PortalButton />
          ) : (
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </Section>

      {/* Danger */}
      <Section title="Session">
        <div className="flex items-center justify-between gap-4 py-3">
          <p className="text-sm text-gray-500">Sign out of your account on this device.</p>
          <SignOutButton />
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</h2>
      </div>
      <div className="divide-y divide-gray-100 px-6">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  )
}
