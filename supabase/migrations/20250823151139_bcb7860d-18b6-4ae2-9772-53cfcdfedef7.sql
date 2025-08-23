-- Create user roles enum with datingideen prefix
CREATE TYPE public.datingideen_app_role AS ENUM ('user', 'admin');

-- Create profiles table with datingideen prefix
CREATE TABLE public.datingideen_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table with datingideen prefix
CREATE TABLE public.datingideen_user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role datingideen_app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create dating ideas table with datingideen prefix
CREATE TABLE public.datingideen_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  url TEXT,
  date_planned DATE,
  time_planned TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.datingideen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datingideen_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datingideen_ideas ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.datingideen_has_role(_user_id UUID, _role datingideen_app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.datingideen_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles table
CREATE POLICY "datingideen_profiles_select_own" 
ON public.datingideen_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "datingideen_profiles_insert_own" 
ON public.datingideen_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "datingideen_profiles_update_own" 
ON public.datingideen_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for user roles table
CREATE POLICY "datingideen_user_roles_select_own" 
ON public.datingideen_user_roles 
FOR SELECT 
USING (auth.uid() = user_id OR public.datingideen_has_role(auth.uid(), 'admin'));

CREATE POLICY "datingideen_user_roles_admin_manage" 
ON public.datingideen_user_roles 
FOR ALL 
USING (public.datingideen_has_role(auth.uid(), 'admin'));

-- RLS Policies for dating ideas table
CREATE POLICY "datingideen_ideas_select_own" 
ON public.datingideen_ideas 
FOR SELECT 
USING (auth.uid() = user_id OR public.datingideen_has_role(auth.uid(), 'admin'));

CREATE POLICY "datingideen_ideas_insert_own" 
ON public.datingideen_ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "datingideen_ideas_update_own" 
ON public.datingideen_ideas 
FOR UPDATE 
USING (auth.uid() = user_id OR public.datingideen_has_role(auth.uid(), 'admin'));

CREATE POLICY "datingideen_ideas_delete_own" 
ON public.datingideen_ideas 
FOR DELETE 
USING (auth.uid() = user_id OR public.datingideen_has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.datingideen_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER datingideen_profiles_updated_at
  BEFORE UPDATE ON public.datingideen_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.datingideen_update_updated_at_column();

CREATE TRIGGER datingideen_ideas_updated_at
  BEFORE UPDATE ON public.datingideen_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.datingideen_update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.datingideen_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.datingideen_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign default user role
  INSERT INTO public.datingideen_user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER datingideen_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.datingideen_handle_new_user();