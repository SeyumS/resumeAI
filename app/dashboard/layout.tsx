import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Sidebar from './Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('user_id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? ''
  const isPro = profile?.plan === 'pro'

  return (
    <Sidebar displayName={displayName} isPro={isPro}>
      {children}
    </Sidebar>
  )
}
