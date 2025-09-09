import { useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'

function CheckoutForm({ clientSecret, paymentId, eventId, depositAmount, onSuccess }: { clientSecret: string; paymentId: string; eventId: string; depositAmount: number; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' })
    if (result.error) {
      setError(result.error.message || 'Error')
      setLoading(false)
      return
    }
    const u = await supabase.auth.getUser()
    if (!u.data.user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }
    await supabase.from('date_ideen_event_participants').insert({ event_id: eventId, user_id: u.data.user.id, deposit_amount_cents: depositAmount, payment_id: paymentId, deposit_status: 'succeeded', status: 'confirmed' })
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button onClick={handleSubmit} disabled={loading || !stripe}>
        {loading ? 'Zahlung...' : 'Pfand zahlen und teilnehmen'}
      </Button>
    </div>
  )
}

export default function DepositCheckout({ clientSecret, paymentId, eventId, depositAmount, onSuccess }: { clientSecret: string; paymentId: string; eventId: string; depositAmount: number; onSuccess: () => void }) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
  const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey])
  const options = { clientSecret }
  if (!clientSecret) return null
  return (
    <Elements stripe={stripePromise} options={options as any}>
      <CheckoutForm clientSecret={clientSecret} paymentId={paymentId} eventId={eventId} depositAmount={depositAmount} onSuccess={onSuccess} />
    </Elements>
  )
}