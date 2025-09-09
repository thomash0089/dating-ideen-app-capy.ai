DO $$ BEGIN
  CREATE TYPE public.date_ideen_chat_type AS ENUM ('direct','event','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.date_ideen_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.date_ideen_chat_type NOT NULL,
  unique_key TEXT UNIQUE,
  event_id UUID REFERENCES public.date_ideen_events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.date_ideen_chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.date_ideen_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.date_ideen_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.date_ideen_chats(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS date_ideen_chat_messages_chat_idx ON public.date_ideen_chat_messages (chat_id, created_at);
CREATE INDEX IF NOT EXISTS date_ideen_chat_participants_user_idx ON public.date_ideen_chat_participants (user_id);

CREATE OR REPLACE FUNCTION public.date_ideen_get_or_create_direct_chat(u1 UUID, u2 UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a UUID;
  b UUID;
  key TEXT;
  chat_id UUID;
BEGIN
  IF u1 = u2 THEN
    RAISE EXCEPTION 'Direct chat requires two distinct users';
  END IF;
  IF u1 < u2 THEN a := u1; b := u2; ELSE a := u2; b := u1; END IF;
  key := 'direct:' || a::text || ':' || b::text;
  SELECT id INTO chat_id FROM public.date_ideen_chats WHERE unique_key = key;
  IF chat_id IS NULL THEN
    INSERT INTO public.date_ideen_chats(type, unique_key) VALUES ('direct', key) RETURNING id INTO chat_id;
    INSERT INTO public.date_ideen_chat_participants(chat_id, user_id) VALUES (chat_id, a) ON CONFLICT DO NOTHING;
    INSERT INTO public.date_ideen_chat_participants(chat_id, user_id) VALUES (chat_id, b) ON CONFLICT DO NOTHING;
  END IF;
  RETURN chat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.date_ideen_get_or_create_event_chat(ev_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chat_id UUID;
  key TEXT;
BEGIN
  key := 'event:' || ev_id::text;
  SELECT id INTO chat_id FROM public.date_ideen_chats WHERE unique_key = key;
  IF chat_id IS NULL THEN
    INSERT INTO public.date_ideen_chats(type, unique_key, event_id) VALUES ('event', key, ev_id) RETURNING id INTO chat_id;
    INSERT INTO public.date_ideen_chat_participants(chat_id, user_id)
    SELECT chat_id, organizer_user_id FROM public.date_ideen_events WHERE id = ev_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN chat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.date_ideen_on_event_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.date_ideen_get_or_create_event_chat(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS date_ideen_events_after_insert ON public.date_ideen_events;
CREATE TRIGGER date_ideen_events_after_insert
  AFTER INSERT ON public.date_ideen_events
  FOR EACH ROW EXECUTE FUNCTION public.date_ideen_on_event_created();

CREATE OR REPLACE FUNCTION public.date_ideen_on_participant_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  chat_id UUID;
BEGIN
  IF NEW.status IN ('confirmed','attended') THEN
    chat_id := public.date_ideen_get_or_create_event_chat(NEW.event_id);
    INSERT INTO public.date_ideen_chat_participants(chat_id, user_id) VALUES (chat_id, NEW.user_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS date_ideen_event_participants_after_insert ON public.date_ideen_event_participants;
CREATE TRIGGER date_ideen_event_participants_after_insert
  AFTER INSERT ON public.date_ideen_event_participants
  FOR EACH ROW EXECUTE FUNCTION public.date_ideen_on_participant_confirmed();

ALTER TABLE public.date_ideen_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY date_ideen_chats_select ON public.date_ideen_chats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.date_ideen_chat_participants p
    WHERE p.chat_id = id AND p.user_id = auth.uid()
  ) OR public.datingideen_has_role(auth.uid(),'admin')
);

CREATE POLICY date_ideen_chat_participants_user ON public.date_ideen_chat_participants FOR SELECT USING (user_id = auth.uid() OR public.datingideen_has_role(auth.uid(),'admin'));

CREATE POLICY date_ideen_chat_messages_select ON public.date_ideen_chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.date_ideen_chat_participants p WHERE p.chat_id = chat_id AND p.user_id = auth.uid()) OR public.datingideen_has_role(auth.uid(),'admin')
);

CREATE POLICY date_ideen_chat_messages_insert ON public.date_ideen_chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.date_ideen_chat_participants p WHERE p.chat_id = chat_id AND p.user_id = auth.uid()) OR public.datingideen_has_role(auth.uid(),'admin')
);
