import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventSurvey() {
  const { id } = useParams()
  const nav = useNavigate()
  const [rating, setRating] = useState(5)
  const [wouldMeetAgain, setWouldMeetAgain] = useState(true)
  const [notGood, setNotGood] = useState(false)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    const u = await supabase.auth.getUser()
    if (!u.data.user) return
    await supabase.from('date_ideen_feedback').insert({ event_id: id as string, reviewer_user_id: u.data.user.id, rating, would_meet_again: wouldMeetAgain, not_good: notGood, comments: comments || null })
    setSubmitting(false)
    nav('/events')
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Wie war das Date?</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Bewertung 1–5</label>
              <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={notGood} onChange={(e) => setNotGood(e.target.checked)} />
              <span>Nicht gut</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={wouldMeetAgain} onChange={(e) => setWouldMeetAgain(e.target.checked)} />
              <span>Würdet ihr euch wieder treffen?</span>
            </div>
            <div>
              <label className="block text-sm">Kommentar</label>
              <Input value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
            <Button onClick={submit} disabled={submitting}>{submitting ? 'Senden...' : 'Senden'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}