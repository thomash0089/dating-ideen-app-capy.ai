-- Fix the search_path for the calculate_distance function
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT earth_distance(
    ll_to_earth(lat1, lng1),
    ll_to_earth(lat2, lng2)
  ) / 1000.0; -- Convert to kilometers
$$;