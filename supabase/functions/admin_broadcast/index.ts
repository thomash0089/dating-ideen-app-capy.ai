import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Filters = {
  gender?: 'male'|'female'|'other'
  age_min?: number
  age_max?: number
  city?: string
  interests?: string[]
  relationship_status?: 'single'|'in_partnership'
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const { filters, message } = await req.json()
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'message required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') || ''
    const supabase = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    // Admin check
    const { data: role } = await supabase.from('datingideen_user_roles').select('role').eq('user_id', user.id).single()
    if (role?.role !== 'admin') return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const f: Filters = filters || {}

    // Build profile query
    let query = supabase.from('datingideen_profiles').select('user_id, birth_date, gender, city, interests, relationship_status')
    if (f.gender) query = query.eq('gender', f.gender)
    if (f.relationship_status) query = query.eq('relationship_status', f.relationship_status)
    if (f.city) query = query.ilike('city', `%${f.city}%`)

    const { data: profiles, error: qErr } = await query
    if (qErr) return new Response(JSON.stringify({ error: qErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const targets = (profiles || []).filter(p => {
      let ageOk = true
      if (p.birth_date && (f.age_min || f.age_max)) {
        const age = Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25*24*3600*1000))
        if (f.age_min && age < f.age_min) ageOk = false
        if (f.age_max && age > f.age_max) ageOk = false
      }
      let interestsOk = true
      if (f.interests && f.interests.length > 0) {
        const ints = (p.interests || []).map((s: string) => s.toLowerCase())
        interestsOk = f.interests.some(i => ints.includes(i.toLowerCase()))
      }
      return ageOk && interestsOk
    })

    if (targets.length === 0) return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    // Log broadcast
    const { data: broadcast } = await supabase.from('date_ideen_admin_broadcasts').insert({ admin_user_id: user.id, message, filters: f }).select().single()

    // Send messages: ensure direct chat admin↔user then insert message
    for (const p of targets) {
      const { data: chatId } = await supabase.rpc('date_ideen_get_or_create_direct_chat', { u1: user.id, u2: p.user_id })
      await supabase.from('date_ideen_chat_messages').insert({ chat_id: chatId as any, sender_user_id: user.id, content: message })
      await supabase.from('date_ideen_admin_broadcast_recipients').insert({ broadcast_id: (broadcast as any).id, user_id: p.user_id })
    }

    return new Response(JSON.stringify({ ok: true, sent: targets.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})