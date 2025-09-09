import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useState } from 'react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const seed = async () => {
    setLoading(true)
    await supabase.functions.invoke('seed')
    setLoading(false)
  }
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">Demo-Daten und Beispiel-Events/Chats anlegen.</div>
      <Button onClick={seed} disabled={loading}>{loading? 'Erstelle...' : 'Demo-Daten erstellen'}</Button>
    </div>
  )
}