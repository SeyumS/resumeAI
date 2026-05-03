import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Service role client — bypasses RLS, safe for webhook context (no user session)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook verification failed: ${msg}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    if (!userId) {
      console.warn('[webhook] no supabase_user_id in metadata — skipping (synthetic trigger event?)')
      return NextResponse.json({ received: true })
    }
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: 'pro',
        rewrite_count: 0,
        stripe_customer_id: session.customer as string,
      })
      .eq('user_id', userId)
    if (error) {
      console.error('[webhook] failed to upgrade profile:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_customer_id', customerId)
    if (error) {
      console.error('[webhook] failed to downgrade profile:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
