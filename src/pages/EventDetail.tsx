import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DepositCheckout from '@/components/payments/DepositCheckout'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<any | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: e } = await supabase.from('date_ideen_events').select('*').eq('id', id).single()
      setEvent(e)
      const { data: ps } = await supabase.from('date_ideen_event_participants').select('user_id, status').eq('event_id', id)
      setParticipants(ps || [])
    }
    load()
  }, [id])

  const join = async () => {
    const { data, error } = await supabase.functions.invoke('payments', { body: { event_id: id } })
    if (!error) {
      setClientSecret((data as any).client_secret)
      setPaymentId((data as any).payment?.id)
    }
  }

  const onPaymentSuccess = () => {
    setClientSecret(null)
  }

  if (!event) return <div className="p-4">Laden...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div>{event.description}</div>
            <div>Ort: {event.address}</div>
            <div>Start: {new Date(event.start_at).toLocaleString()}</div>
            <div>Teilnehmer: {participants.length} / {event.max_participants}</div>
          </div>
          {!clientSecret && (
            <div className="mt-4"><Button onClick={join}>Teilnehmen (Pfand {((event.deposit_cents||0)/100).toFixed(2)} {event.currency})</Button></div>
          )}
          {clientSecret && paymentId && (
            <div className="mt-4">
              <DepositCheckout clientSecret={clientSecret} paymentId={paymentId} eventId={event.id} onSuccess={onPaymentSuccess} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}