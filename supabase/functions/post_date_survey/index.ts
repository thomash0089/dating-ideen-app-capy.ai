import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'no-reply@capy.ai', to, subject, html })
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnon)

    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    const { data: events } = await supabase
      .from('date_ideen_events')
      .select('id, title, end_at, survey_sent_at')
      .lte('end_at', now.toISOString())
      .gte('end_at', twoHoursAgo.toISOString())
      .is('survey_sent_at', null)

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ ok: true, events: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    for (const ev of events) {
      const { data: participants } = await supabase
        .from('date_ideen_event_participants')
        .select('user_id')
        .eq('event_id', ev.id)
        .in('status', ['confirmed','attended'])

      if (participants && participants.length > 0) {
        const ids = participants.map(p => p.user_id)
        const { data: profiles } = await supabase
          .from('datingideen_profiles')
          .select('user_id, email')
          .in('user_id', ids)

        for (const p of profiles || []) {
          await supabase.from('date_ideen_notifications').insert({ user_id: p.user_id, title: 'Wie war euer Date?', body: 'Bewerte dein Date und gib Feedback.', link: `/events/${ev.id}/survey` })
          if (p.email) {
            await sendEmail(p.email, 'Wie war euer Date?', `Bitte gib dein Feedback: <a href="${Deno.env.get('APP_BASE_URL') || ''}/events/${ev.id}/survey">Link</a>`)
          }
        }
      }

      await supabase.from('date_ideen_events').update({ survey_sent_at: new Date().toISOString() }).eq('id', ev.id)
    }

    return new Response(JSON.stringify({ ok: true, events: events.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})