import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function AdminBroadcastPanel() {
  const [gender, setGender] = useState<string>('')
  const [ageMin, setAgeMin] = useState<string>('')
  const [ageMax, setAgeMax] = useState<string>('')
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState('')
  const [relationship, setRelationship] = useState<string>('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string>('')

  const send = async () => {
    setSending(true)
    setResult('')
    const filters: any = {}
    if (gender) filters.gender = gender
    if (relationship) filters.relationship_status = relationship
    if (city) filters.city = city
    if (ageMin) filters.age_min = parseInt(ageMin)
    if (ageMax) filters.age_max = parseInt(ageMax)
    if (interests.trim()) filters.interests = interests.split(',').map(s=>s.trim()).filter(Boolean)

    const { data, error } = await supabase.functions.invoke('admin_broadcast', { body: { filters, message } })
    if (error) setResult(error.message)
    else setResult(`Nachrichten gesendet: ${(data as any)?.sent ?? 0}`)
    setSending(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle>Admin Broadcast an Nutzer-Segmente</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Geschlecht</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue placeholder="Alle"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
                <SelectItem value="other">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">Beziehungsstatus</label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger><SelectValue placeholder="Alle"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="in_partnership">In Partnerschaft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">Stadt enthält</label>
            <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="z. B. Berlin" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mindestalter</label>
            <Input type="number" value={ageMin} onChange={e=>setAgeMin(e.target.value)} placeholder="z. B. 21" />
          </div>
          <div>
            <label className="block text-sm mb-1">Höchstalter</label>
            <Input type="number" value={ageMax} onChange={e=>setAgeMax(e.target.value)} placeholder="z. B. 45" />
          </div>
          <div>
            <label className="block text-sm mb-1">Interessen (Komma‑getrennt)</label>
            <Input value={interests} onChange={e=>setInterests(e.target.value)} placeholder="kino, kaffe, wandern" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Nachricht</label>
          <Textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Text für das Segment..." />
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={send} disabled={sending || !message.trim()}>An Segment senden</Button>
          {result && <div className="text-sm text-muted-foreground self-center">{result}</div>}
        </div>
      </CardContent>
    </Card>
  )
}