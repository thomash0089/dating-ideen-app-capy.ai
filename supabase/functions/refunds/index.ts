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
    const supabase = createClient(supabaseUrl, supabaseAnon)
    const feePercent = Number(Deno.env.get('PLATFORM_FEE_PERCENT') || '10')

    const now = new Date()
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: events } = await supabase
      .from('date_ideen_events')
      .select('id, end_at')
      .lte('end_at', now.toISOString())
      .gte('end_at', since.toISOString())

    for (const ev of events || []) {
      const { data: participants } = await supabase
        .from('date_ideen_event_participants')
        .select('user_id')
        .eq('event_id', ev.id)
        .in('status', ['confirmed','attended'])

      if (!participants || participants.length !== 2) continue

      const ids = participants.map(p => p.user_id)
      const { data: feedbacks } = await supabase
        .from('date_ideen_feedback')
        .select('reviewer_user_id, not_good')
        .eq('event_id', ev.id)
        .in('reviewer_user_id', ids)

      if (!feedbacks || feedbacks.length < 2) continue

      const bothNotGood = feedbacks.every(f => !!f.not_good)

      for (const uid of ids) {
        const { data: pay } = await supabase
          .from('date_ideen_payments')
          .select('*')
          .eq('event_id', ev.id)
          .eq('user_id', uid)
          .eq('status', 'succeeded')
          .single()
        if (!pay) continue
        if (!stripeKey) continue
        const refundBase = bothNotGood ? pay.amount_cents : Math.round(pay.amount_cents * 0.5)
        const fee = Math.round((refundBase * feePercent) / 100)
        const refundAmount = Math.max(refundBase - fee, 0)
        const form = new URLSearchParams()
        form.append('payment_intent', pay.stripe_payment_intent_id)
        form.append('amount', String(refundAmount))
        const stripeResp = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        })
        if (stripeResp.ok) {
          await supabase.from('date_ideen_payments').update({ status: bothNotGood ? 'refunded' : 'partial_refund', updated_at: new Date().toISOString(), fee_cents: fee }).eq('id', pay.id)
          await supabase.from('date_ideen_event_participants').update({ refund_status: bothNotGood ? 'full_refund' : 'partial_refund' }).eq('event_id', ev.id).eq('user_id', uid)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})