import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Events() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const u = await supabase.auth.getUser()
      if (!u.data.user) return
      const { data: p } = await supabase.from('datingideen_profiles').select('latitude, longitude, distance_radius').eq('user_id', u.data.user.id).single()
      const center_lat = p?.latitude || 52.52
      const center_lng = p?.longitude || 13.405
      const radius_km = p?.distance_radius || 25
      const { data } = await supabase.rpc('date_ideen_search_events_by_radius', { center_lat, center_lng, radius_km })
      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-4">Laden...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Link to="/events/create"><Button>Event erstellen</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map(e => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle>{e.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">Start: {new Date(e.start_at).toLocaleString()}</div>
              <div className="text-sm">Entfernung: {e.distance_km?.toFixed(1)} km</div>
              <div className="mt-3"><Link to={`/events/${e.id}`}><Button>Details</Button></Link></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}