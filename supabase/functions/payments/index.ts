import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader || '' } } })
    const body = await req.json()
    const event_id: string = body?.event_id

    if (!event_id) {
      return new Response(JSON.stringify({ error: 'event_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: event, error: evErr } = await supabase
      .from('date_ideen_events')
      .select('id, deposit_cents, currency')
      .eq('id', event_id)
      .single()
    if (evErr || !event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const amount = event.deposit_cents || 1000
    const currency = (event.currency || 'EUR').toLowerCase()

    const form = new URLSearchParams()
    form.append('amount', String(amount))
    form.append('currency', currency)
    form.append('payment_method_types[]', 'card')
    form.append('metadata[event_id]', event_id)
    form.append('metadata[user_id]', user.id)

    const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const stripeJson = await stripeResp.json()
    if (!stripeResp.ok) {
      return new Response(JSON.stringify({ error: 'Stripe error', details: stripeJson }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: inserted } = await supabase
      .from('date_ideen_payments')
      .insert({ event_id, user_id: user.id, stripe_payment_intent_id: stripeJson.id, amount_cents: amount, currency: currency.toUpperCase(), status: 'requires_action' })
      .select()
      .single()

    return new Response(JSON.stringify({ client_secret: stripeJson.client_secret, payment: inserted }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})