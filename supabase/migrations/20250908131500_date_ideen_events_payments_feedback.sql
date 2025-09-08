CREATE EXTENSION IF NOT EXISTS postgis;

DO $$ BEGIN
  CREATE TYPE public.date_ideen_gender_policy AS ENUM ('mixed','female_only','male_only','balanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.date_ideen_participant_status AS ENUM ('invited','requested','confirmed','attended','no_show','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.date_ideen_payment_status AS ENUM ('authorized','requires_action','succeeded','failed','canceled','refunded','partial_refund');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.date_ideen_refund_status AS ENUM ('pending','full_refund','partial_refund','no_refund');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.date_ideen_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  place_lat NUMERIC,
  place_lng NUMERIC,
  place geography(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(place_lng, place_lat),4326)::geography) STORED,
  radius_km NUMERIC NOT NULL DEFAULT 25,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 2,
  gender_policy public.date_ideen_gender_policy NOT NULL DEFAULT 'mixed',
  age_min INTEGER NOT NULL DEFAULT 21,
  age_max INTEGER NOT NULL DEFAULT 45,
  interests_filter TEXT[] DEFAULT ARRAY[]::TEXT[],
  deposit_cents INTEGER NOT NULL DEFAULT 1000,
  currency TEXT NOT NULL DEFAULT 'EUR',
  survey_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS date_ideen_events_place_gix ON public.date_ideen_events USING gist (place);
CREATE INDEX IF NOT EXISTS date_ideen_events_time_idx ON public.date_ideen_events (start_at, end_at);
CREATE INDEX IF NOT EXISTS date_ideen_events_org_idx ON public.date_ideen_events (organizer_user_id);

CREATE TABLE IF NOT EXISTS public.date_ideen_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.date_ideen_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.date_ideen_participant_status NOT NULL DEFAULT 'confirmed',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deposit_amount_cents INTEGER,
  payment_id UUID,
  deposit_status public.date_ideen_payment_status,
  refund_status public.date_ideen_refund_status NOT NULL DEFAULT 'pending',
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS date_ideen_event_participants_event_idx ON public.date_ideen_event_participants (event_id);
CREATE INDEX IF NOT EXISTS date_ideen_event_participants_user_idx ON public.date_ideen_event_participants (user_id);

CREATE TABLE IF NOT EXISTS public.date_ideen_event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.date_ideen_events(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.date_ideen_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.date_ideen_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  fee_cents INTEGER DEFAULT 0,
  status public.date_ideen_payment_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS date_ideen_payments_event_idx ON public.date_ideen_payments (event_id);
CREATE INDEX IF NOT EXISTS date_ideen_payments_user_idx ON public.date_ideen_payments (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS date_ideen_payments_intent_uidx ON public.date_ideen_payments (stripe_payment_intent_id);

CREATE TABLE IF NOT EXISTS public.date_ideen_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.date_ideen_events(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  would_meet_again BOOLEAN,
  not_good BOOLEAN,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, reviewer_user_id)
);

CREATE TABLE IF NOT EXISTS public.date_ideen_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.date_ideen_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS date_ideen_events_updated_at ON public.date_ideen_events;
CREATE TRIGGER date_ideen_events_updated_at
  BEFORE UPDATE ON public.date_ideen_events
  FOR EACH ROW
  EXECUTE FUNCTION public.date_ideen_update_updated_at_column();

CREATE OR REPLACE FUNCTION public.date_ideen_is_user_verified(u_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE id = u_id
$$;

CREATE OR REPLACE FUNCTION public.date_ideen_check_event_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.date_ideen_is_user_verified(NEW.organizer_user_id) THEN
    RAISE EXCEPTION 'Organizer must be verified';
  END IF;
  IF NEW.end_at <= NEW.start_at THEN
    RAISE EXCEPTION 'end_at must be after start_at';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS date_ideen_events_before_insert ON public.date_ideen_events;
CREATE TRIGGER date_ideen_events_before_insert
  BEFORE INSERT ON public.date_ideen_events
  FOR EACH ROW EXECUTE FUNCTION public.date_ideen_check_event_insert();

CREATE OR REPLACE FUNCTION public.date_ideen_is_user_eligible(e_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  ev RECORD;
  p RECORD;
  user_age INTEGER;
  within_radius BOOLEAN;
  gender_ok BOOLEAN;
  interests_ok BOOLEAN;
  balanced_ok BOOLEAN;
  male_count INTEGER;
  female_count INTEGER;
  target_gender TEXT;
BEGIN
  SELECT * INTO ev FROM public.date_ideen_events WHERE id = e_id;
  IF ev IS NULL THEN RETURN FALSE; END IF;
  SELECT birth_date, gender, latitude, longitude, interests INTO p FROM public.datingideen_profiles WHERE user_id = u_id;
  IF p.birth_date IS NULL THEN RETURN FALSE; END IF;
  user_age := EXTRACT(YEAR FROM AGE(p.birth_date));
  IF user_age < ev.age_min OR user_age > ev.age_max THEN RETURN FALSE; END IF;
  IF p.latitude IS NULL OR p.longitude IS NULL OR ev.place IS NULL THEN RETURN FALSE; END IF;
  within_radius := ST_DWithin(ev.place, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude),4326)::geography, ev.radius_km * 1000);
  IF NOT within_radius THEN RETURN FALSE; END IF;
  gender_ok := TRUE;
  IF ev.gender_policy = 'female_only' AND p.gender <> 'female' THEN gender_ok := FALSE; END IF;
  IF ev.gender_policy = 'male_only' AND p.gender <> 'male' THEN gender_ok := FALSE; END IF;
  IF NOT gender_ok THEN RETURN FALSE; END IF;
  interests_ok := TRUE;
  IF ev.interests_filter IS NOT NULL AND array_length(ev.interests_filter,1) > 0 THEN
    interests_ok := EXISTS (
      SELECT 1 WHERE EXISTS (
        SELECT 1 FROM unnest(ev.interests_filter) f
        WHERE f = ANY (COALESCE(p.interests, ARRAY[]::TEXT[]))
      )
    );
  END IF;
  IF NOT interests_ok THEN RETURN FALSE; END IF;
  balanced_ok := TRUE;
  IF ev.gender_policy = 'balanced' THEN
    SELECT COALESCE(SUM(CASE WHEN dp.gender = 'male' THEN 1 ELSE 0 END),0),
           COALESCE(SUM(CASE WHEN dp.gender = 'female' THEN 1 ELSE 0 END),0)
    INTO male_count, female_count
    FROM public.date_ideen_event_participants ep
    JOIN public.datingideen_profiles dp ON dp.user_id = ep.user_id
    WHERE ep.event_id = e_id AND ep.status IN ('confirmed','attended');
    target_gender := p.gender::TEXT;
    IF target_gender = 'male' AND male_count > female_count THEN balanced_ok := FALSE; END IF;
    IF target_gender = 'female' AND female_count > male_count THEN balanced_ok := FALSE; END IF;
  END IF;
  IF NOT balanced_ok THEN RETURN FALSE; END IF;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.date_ideen_check_participant_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  participant_count INTEGER;
  capacity_ok BOOLEAN;
BEGIN
  IF NOT public.date_ideen_is_user_eligible(NEW.event_id, NEW.user_id) THEN
    RAISE EXCEPTION 'User not eligible for this event';
  END IF;
  SELECT COUNT(*) INTO participant_count FROM public.date_ideen_event_participants WHERE event_id = NEW.event_id AND status IN ('confirmed','attended');
  capacity_ok := participant_count < (SELECT max_participants FROM public.date_ideen_events WHERE id = NEW.event_id);
  IF NOT capacity_ok THEN
    RAISE EXCEPTION 'Event is full';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS date_ideen_event_participants_before_insert ON public.date_ideen_event_participants;
CREATE TRIGGER date_ideen_event_participants_before_insert
  BEFORE INSERT ON public.date_ideen_event_participants
  FOR EACH ROW EXECUTE FUNCTION public.date_ideen_check_participant_insert();

ALTER TABLE public.date_ideen_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideen_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY date_ideen_events_select ON public.date_ideen_events FOR SELECT USING (true);
CREATE POLICY date_ideen_events_insert ON public.date_ideen_events FOR INSERT WITH CHECK (auth.uid() = organizer_user_id);
CREATE POLICY date_ideen_events_update ON public.date_ideen_events FOR UPDATE USING (auth.uid() = organizer_user_id);

CREATE POLICY date_ideen_event_participants_rw ON public.date_ideen_event_participants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY date_ideen_event_participants_read_event_organizer ON public.date_ideen_event_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.date_ideen_events ev WHERE ev.id = event_id AND ev.organizer_user_id = auth.uid()));

CREATE POLICY date_ideen_event_invitations_owner ON public.date_ideen_event_invitations FOR ALL USING (inviter_id = auth.uid());
CREATE POLICY date_ideen_event_invitations_invitee_read ON public.date_ideen_event_invitations FOR SELECT USING (invitee_user_id = auth.uid());

CREATE POLICY date_ideen_payments_user_read ON public.date_ideen_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY date_ideen_payments_event_owner_read ON public.date_ideen_payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.date_ideen_events ev WHERE ev.id = event_id AND ev.organizer_user_id = auth.uid()));

CREATE POLICY date_ideen_feedback_rw ON public.date_ideen_feedback FOR ALL USING (auth.uid() = reviewer_user_id) WITH CHECK (auth.uid() = reviewer_user_id);

CREATE POLICY date_ideen_notifications_rw ON public.date_ideen_notifications FOR SELECT USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.date_ideen_search_events_by_radius(
  center_lat numeric,
  center_lng numeric,
  radius_km numeric,
  start_time timestamptz DEFAULT NULL,
  end_time timestamptz DEFAULT NULL,
  gender_policy_filter public.date_ideen_gender_policy DEFAULT NULL,
  age_min integer DEFAULT NULL,
  age_max integer DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  title text,
  description text,
  address text,
  start_at timestamptz,
  end_at timestamptz,
  distance_km numeric,
  max_participants integer,
  organizer_user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.address,
    e.start_at,
    e.end_at,
    ST_Distance(e.place, ST_SetSRID(ST_MakePoint(center_lng, center_lat),4326)::geography) / 1000.0 as distance_km,
    e.max_participants,
    e.organizer_user_id
  FROM public.date_ideen_events e
  WHERE 
    e.place IS NOT NULL
    AND ST_DWithin(e.place, ST_SetSRID(ST_MakePoint(center_lng, center_lat),4326)::geography, radius_km * 1000)
    AND (start_time IS NULL OR e.start_at >= start_time)
    AND (end_time IS NULL OR e.end_at <= end_time)
    AND (gender_policy_filter IS NULL OR e.gender_policy = gender_policy_filter)
    AND (age_min IS NULL OR e.age_min >= age_min)
    AND (age_max IS NULL OR e.age_max <= age_max)
  ORDER BY distance_km ASC;
END;
$$;