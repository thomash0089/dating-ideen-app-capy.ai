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
    const supabase = createClient(supabaseUrl, supabaseAnon)

    const payload = await req.json()
    const type: string = payload?.type

    if (!type) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (type === 'payment_intent.succeeded') {
      const pi = payload.data.object
      await supabase.from('date_ideen_payments').update({ status: 'succeeded', updated_at: new Date().toISOString() }).eq('stripe_payment_intent_id', pi.id)
    }
    if (type === 'payment_intent.payment_failed') {
      const pi = payload.data.object
      await supabase.from('date_ideen_payments').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('stripe_payment_intent_id', pi.id)
    }
    if (type === 'payment_intent.canceled') {
      const pi = payload.data.object
      await supabase.from('date_ideen_payments').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('stripe_payment_intent_id', pi.id)
    }
    if (type === 'charge.refunded' || type === 'refund.updated' || type === 'charge.refund.updated') {
      const charge = payload.data.object
      const piId = charge.payment_intent || charge.payment_intent_id || charge.id
      const status = charge.amount_refunded && charge.amount_refunded > 0 && charge.amount_refunded < charge.amount ? 'partial_refund' : 'refunded'
      await supabase.from('date_ideen_payments').update({ status, updated_at: new Date().toISOString() }).eq('stripe_payment_intent_id', piId)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})