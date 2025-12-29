-- Enable RLS on badges table (public read access)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read badges
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);