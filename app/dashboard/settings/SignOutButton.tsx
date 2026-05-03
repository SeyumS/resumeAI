'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-red-500 transition-colors hover:text-red-700"
    >
      Sign out
    </button>
  )
}
