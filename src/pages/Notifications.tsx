import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function Notifications() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const u = await supabase.auth.getUser()
      if (!u.data.user) return
      const { data } = await supabase
        .from('date_ideen_notifications')
        .select('*')
        .eq('user_id', u.data.user.id)
        .order('created_at', { ascending: false })
      setItems(data || [])
    }
    load()
  }, [])

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Benachrichtigungen</h1>
      {items.map(n => (
        <Card key={n.id}>
          <CardHeader><CardTitle>{n.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm">{n.body}</div>
            {n.link && <div className="mt-2 text-sm text-blue-600"><Link to={n.link}>{n.link}</Link></div>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}