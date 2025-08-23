-- Fix security issues: Set proper search_path for all functions

-- Update the role checking function with proper search_path
CREATE OR REPLACE FUNCTION public.datingideen_has_role(_user_id UUID, _role datingideen_app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.datingideen_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update the timestamp function with proper search_path  
CREATE OR REPLACE FUNCTION public.datingideen_update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;