-- Add category enum for dating ideas
CREATE TYPE public.datingideen_category AS ENUM (
  'romantic', 'adventure', 'cultural', 'outdoor', 'indoor', 
  'food_drinks', 'sports', 'creative', 'relaxation', 'entertainment'
);

-- Add fields to datingideen_ideas for community features
ALTER TABLE public.datingideen_ideas 
ADD COLUMN category public.datingideen_category DEFAULT 'romantic',
ADD COLUMN is_public boolean DEFAULT false,
ADD COLUMN max_participants integer DEFAULT 2,
ADD COLUMN current_participants integer DEFAULT 1;

-- Create function for radius search
CREATE OR REPLACE FUNCTION public.search_dates_by_radius(
  center_lat numeric,
  center_lng numeric,
  radius_km numeric,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  idea_category public.datingideen_category DEFAULT NULL,
  min_age integer DEFAULT NULL,
  max_age integer DEFAULT NULL,
  gender_filter public.datingideen_gender DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  title text,
  description text,
  location text,
  latitude numeric,
  longitude numeric,
  category public.datingideen_category,
  date_planned date,
  time_planned time,
  duration text,
  max_participants integer,
  current_participants integer,
  distance_km numeric,
  creator_name text,
  creator_age integer,
  creator_gender public.datingideen_gender,
  creator_city text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.location,
    i.latitude,
    i.longitude,
    i.category,
    i.date_planned,
    i.time_planned,
    i.duration,
    i.max_participants,
    i.current_participants,
    calculate_distance(center_lat, center_lng, i.latitude, i.longitude) as distance_km,
    COALESCE(p.name, 'Anonym') as creator_name,
    CASE 
      WHEN p.birth_date IS NOT NULL THEN 
        EXTRACT(YEAR FROM AGE(p.birth_date))::integer
      ELSE NULL 
    END as creator_age,
    p.gender as creator_gender,
    p.city as creator_city
  FROM datingideen_ideas i
  INNER JOIN datingideen_profiles p ON i.user_id = p.user_id
  WHERE 
    i.is_public = true
    AND i.latitude IS NOT NULL 
    AND i.longitude IS NOT NULL
    AND calculate_distance(center_lat, center_lng, i.latitude, i.longitude) <= radius_km
    AND (start_date IS NULL OR i.date_planned >= start_date)
    AND (end_date IS NULL OR i.date_planned <= end_date)
    AND (idea_category IS NULL OR i.category = idea_category)
    AND (min_age IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date))::integer >= min_age)
    AND (max_age IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date))::integer <= max_age)
    AND (gender_filter IS NULL OR p.gender = gender_filter)
  ORDER BY distance_km ASC;
END;
$$;