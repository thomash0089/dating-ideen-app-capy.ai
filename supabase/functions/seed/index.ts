import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!service) return new Response(JSON.stringify({ error: 'Missing service role key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const authed = createClient(supabaseUrl, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } })
    const { data: { user } } = await authed.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { data: role } = await authed.from('datingideen_user_roles').select('role').eq('user_id', user.id).single()
    if (role?.role !== 'admin') return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const admin = createClient(supabaseUrl, service)

    const emails = ['alice@example.com','bob@example.com','carla@example.com']
    const created: any[] = []
    for (const e of emails) {
      const { data } = await admin.auth.admin.createUser({ email: e, email_confirm: true }) as any
      created.push(data.user)
    }

    for (const u of created) {
      await admin.from('datingideen_profiles').upsert({ user_id: u.id, email: u.email!, name: u.email!.split('@')[0], city: 'Berlin', latitude: 52.52, longitude: 13.405, distance_radius: 25, gender: 'other', birth_date: '1995-01-01', interests: ['wandern','kaffee','kino'] })
    }

    const now = new Date()
    const start1 = new Date(now.getTime() + 24*60*60*1000)
    const end1 = new Date(now.getTime() + 26*60*60*1000)
    const start2 = new Date(now.getTime() + 48*60*60*1000)
    const end2 = new Date(now.getTime() + 50*60*60*1000)

    const { data: ev1 } = await admin.from('date_ideen_events').insert({ organizer_user_id: created[0].id, title: 'Spreeufer Spaziergang', description: 'Abendlicher Spaziergang an der Spree', address: 'Berlin', place_lat: 52.51, place_lng: 13.4, start_at: start1.toISOString(), end_at: end1.toISOString(), max_participants: 2, gender_policy: 'balanced', age_min: 21, age_max: 45, deposit_cents: 1000, currency: 'EUR' }).select().single()
    const { data: ev2 } = await admin.from('date_ideen_events').insert({ organizer_user_id: created[1].id, title: 'Kaffee & Kunst', description: 'Kleines Museum und Café', address: 'Berlin', place_lat: 52.52, place_lng: 13.41, start_at: start2.toISOString(), end_at: end2.toISOString(), max_participants: 4, gender_policy: 'mixed', age_min: 21, age_max: 45, deposit_cents: 1000, currency: 'EUR' }).select().single()

    await admin.from('date_ideen_event_participants').insert({ event_id: ev1.id, user_id: created[0].id, status: 'confirmed' })
    await admin.from('date_ideen_event_participants').insert({ event_id: ev1.id, user_id: created[1].id, status: 'confirmed' })

    const chatId = await admin.rpc('date_ideen_get_or_create_direct_chat', { u1: created[0].id, u2: created[1].id })
    await admin.from('date_ideen_chat_messages').insert({ chat_id: (chatId.data as any), sender_user_id: created[0].id, content: 'Hi, Lust auf einen Spaziergang?' })

    return new Response(JSON.stringify({ ok: true, users: created.map(u=>u.email), events: [ev1, ev2] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})