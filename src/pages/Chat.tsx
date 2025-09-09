import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChatItem { id: string; type: 'direct'|'event'|'admin'; event_id?: string; title: string }
interface Message { id: string; chat_id: string; sender_user_id: string; content: string; created_at: string }

export default function Chat() {
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const u = await supabase.auth.getUser()
      if (!u.data.user) return
      const { data: cps } = await supabase
        .from('date_ideen_chat_participants')
        .select('chat_id')
        .eq('user_id', u.data.user.id)
      const chatIds = (cps || []).map(c => c.chat_id)
      if (chatIds.length === 0) { setChats([]); return }
      const { data: cs } = await supabase
        .from('date_ideen_chats')
        .select('*')
        .in('id', chatIds)
        .order('created_at', { ascending: false })
      const enriched: ChatItem[] = []
      for (const c of cs || []) {
        if (c.type === 'event' && c.event_id) {
          const { data: ev } = await supabase.from('date_ideen_events').select('title').eq('id', c.event_id).single()
          enriched.push({ id: c.id, type: c.type, event_id: c.event_id, title: ev?.title || 'Event' })
        } else {
          enriched.push({ id: c.id, type: c.type, title: c.type === 'admin' ? 'Admin' : 'Direkt-Chat' })
        }
      }
      setChats(enriched)
      if (enriched.length > 0) setActiveChat(enriched[0])
    }
    load()
  }, [])

  useEffect(() => {
    const sub = supabase.channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'date_ideen_chat_messages' }, payload => {
        const m = payload.new as any
        if (m.chat_id === activeChat?.id) {
          setMessages(prev => [...prev, m])
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [activeChat?.id])

  useEffect(() => {
    const load = async () => {
      if (!activeChat) return
      const { data: ms } = await supabase
        .from('date_ideen_chat_messages')
        .select('*')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: true })
      setMessages(ms || [])
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    load()
  }, [activeChat?.id])

  const send = async () => {
    if (!activeChat || !text.trim()) return
    const u = await supabase.auth.getUser()
    if (!u.data.user) return
    await supabase.from('date_ideen_chat_messages').insert({ chat_id: activeChat.id, sender_user_id: u.data.user.id, content: text.trim() })
    setText('')
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
      <Card className="md:col-span-1">
        <CardHeader><CardTitle>Chats</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chats.map(c => (
              <div key={c.id} className={`p-2 rounded cursor-pointer ${activeChat?.id===c.id?'bg-rose-100':''}`} onClick={() => setActiveChat(c)}>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.type}</div>
              </div>
            ))}
            {chats.length===0 && <div className="text-sm text-muted-foreground">Keine Chats vorhanden</div>}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>{activeChat?.title || 'Chat'}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[50vh] overflow-y-auto border rounded p-2 space-y-2">
            {messages.map(m => (
              <div key={m.id} className="text-sm"><span className="text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}:</span> {m.content}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Nachricht schreiben..." />
            <Button onClick={send}>Senden</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}