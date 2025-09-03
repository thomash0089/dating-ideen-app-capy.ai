-- Create a function to calculate distance between two points using PostGIS
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
  SELECT ST_Distance(
    ST_GeogFromText('POINT(' || lng1 || ' ' || lat1 || ')'),
    ST_GeogFromText('POINT(' || lng2 || ' ' || lat2 || ')')
  ) / 1000.0; -- Convert to kilometers
$$;