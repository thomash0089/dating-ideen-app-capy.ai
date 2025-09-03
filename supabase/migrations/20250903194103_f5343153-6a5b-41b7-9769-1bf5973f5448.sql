-- Create a simple haversine distance calculation function
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
) RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r_earth CONSTANT numeric := 6371; -- Earth radius in kilometers
  dlat numeric;
  dlng numeric;
  a numeric;
  c numeric;
BEGIN
  -- Convert to radians
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  
  -- Haversine formula
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r_earth * c;
END;
$$;