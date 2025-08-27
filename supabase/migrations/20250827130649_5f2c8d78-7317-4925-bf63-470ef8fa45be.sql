-- Add duration column to datingideen_ideas table
ALTER TABLE public.datingideen_ideas 
ADD COLUMN duration text DEFAULT '2 Stunden';