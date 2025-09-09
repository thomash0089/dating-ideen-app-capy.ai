CREATE TABLE IF NOT EXISTS public.date_ideen_admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.date_ideen_admin_broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.date_ideen_admin_broadcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (broadcast_id, user_id)
);

ALTER TABLE public.date_ideen_admin_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_admin_broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY date_ideen_admin_broadcasts_admin ON public.date_ideen_admin_broadcasts
  FOR ALL USING (public.datingideen_has_role(auth.uid(),'admin')) WITH CHECK (public.datingideen_has_role(auth.uid(),'admin'));

CREATE POLICY date_ideen_admin_broadcast_recipients_admin ON public.date_ideen_admin_broadcast_recipients
  FOR ALL USING (public.datingideen_has_role(auth.uid(),'admin')) WITH CHECK (public.datingideen_has_role(auth.uid(),'admin'));
