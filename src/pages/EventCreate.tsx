import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  address: z.string().min(3),
  start_at: z.string(),
  end_at: z.string(),
})

type FormData = z.infer<typeof schema>

export default function EventCreate() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [geoResults, setGeoResults] = useState<any[]>([])
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()

  const address = watch('address')

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!address || address.length < 3) { setGeoResults([]); return }
      const { data, error } = await supabase.functions.invoke('geocode', { body: { query: address } })
      setGeoResults((data as any)?.results || [])
    }, 300)
    return () => clearTimeout(t)
  }, [address])

  const onSelectAddress = (r: any) => {
    setValue('address', r.display_name)
    setCoords({ lat: r.lat, lon: r.lon })
    setGeoResults([])
  }

  const onSubmit = async (data: FormData) => {
    if (!coords) return
    setSubmitting(true)
    const u = await supabase.auth.getUser()
    if (!u.data.user) return
    await supabase.from('date_ideen_events').insert({
      organizer_user_id: u.data.user.id,
      title: data.title,
      description: data.description || null,
      address: data.address,
      place_lat: coords.lat,
      place_lng: coords.lon,
      radius_km: 25,
      start_at: new Date(data.start_at).toISOString(),
      end_at: new Date(data.end_at).toISOString(),
      max_participants: 2,
      gender_policy: 'balanced',
      age_min: 21,
      age_max: 45,
      deposit_cents: 1000,
      currency: 'EUR'
    })
    setSubmitting(false)
    nav('/events')
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Event erstellen</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Titel" {...register('title')} />
            <Input placeholder="Beschreibung" {...register('description')} />
            <div className="relative">
              <Input placeholder="Adresse" {...register('address')} />
              {geoResults.length > 0 && (
                <div className="absolute z-10 bg-white border w-full max-h-48 overflow-auto">
                  {geoResults.map((r, i) => (
                    <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelectAddress(r)}>{r.display_name}</div>
                  ))}
                </div>
              )}
            </div>
            <Input type="datetime-local" {...register('start_at')} />
            <Input type="datetime-local" {...register('end_at')} />
            <Button type="submit" disabled={submitting}>{submitting ? 'Erstellen...' : 'Erstellen'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}