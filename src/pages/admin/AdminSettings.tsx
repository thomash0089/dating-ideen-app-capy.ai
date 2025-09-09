import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const seed = async () => {
    setLoading(true)
    const { data, error } = await supabase.functions.invoke('seed')
    setLoading(false)
    if (error) {
      toast({ title: 'Seed fehlgeschlagen', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Seed erfolgreich', description: JSON.stringify(data) })
    }
  }
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">Demo-Daten und Beispiel-Events/Chats anlegen.</div>
      <Button onClick={seed} disabled={loading}>{loading? 'Erstelle...' : 'Demo-Daten erstellen'}</Button>
    </div>
  )
}