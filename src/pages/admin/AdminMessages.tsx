import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminMessages() {
  const [users, setUsers] = useState<any[]>([])
  const [target, setTarget] = useState<string>('')
  const [text, setText] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('datingideen_profiles').select('user_id, name, email').order('created_at', { ascending: false })
      setUsers(data || [])
    }
    load()
  }, [])

  const send = async () => {
    if (!target || !text.trim()) return
    const u = await supabase.auth.getUser()
    if (!u.data.user) return
    const { data: chatId } = await supabase.rpc('date_ideen_get_or_create_direct_chat', { u1: u.data.user.id, u2: target })
    await supabase.from('date_ideen_chat_messages').insert({ chat_id: chatId as any, sender_user_id: u.data.user.id, content: text.trim() })
    setText('')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Empfänger</label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger><SelectValue placeholder="Nutzer auswählen" /></SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.user_id} value={u.user_id}>{u.name || u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm mb-1">Nachricht</label>
        <Textarea value={text} onChange={(e)=>setText(e.target.value)} rows={4} />
      </div>
      <Button onClick={send}>Senden</Button>
    </div>
  )
}