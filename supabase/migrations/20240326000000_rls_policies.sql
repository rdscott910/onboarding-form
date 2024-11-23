-- Enable RLS on all tables
ALTER TABLE public.anonymous_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own registrations" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.anonymous_registrations;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.anonymous_registrations;

DROP POLICY IF EXISTS "Users can view own locations" ON public.locations;
DROP POLICY IF EXISTS "Users can insert own locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update own locations" ON public.locations;

-- Policy for anonymous_registrations
CREATE POLICY "Enable read access for authenticated users"
  ON public.anonymous_registrations
  FOR SELECT
  USING (auth.jwt()->>'email' = primary_email);

CREATE POLICY "Enable insert for everyone"
  ON public.anonymous_registrations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.anonymous_registrations
  FOR UPDATE
  USING (auth.jwt()->>'email' = primary_email)
  WITH CHECK (auth.jwt()->>'email' = primary_email);

-- Policy for locations
CREATE POLICY "Users can view own locations"
  ON public.locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.anonymous_registrations ar
      WHERE ar.id::text = location_registration_id::text
      AND ar.primary_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can insert own locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.anonymous_registrations ar
      WHERE ar.id::text = location_registration_id::text
      AND ar.primary_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can update own locations"
  ON public.locations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.anonymous_registrations ar
      WHERE ar.id::text = location_registration_id::text
      AND ar.primary_email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.anonymous_registrations ar
      WHERE ar.id::text = location_registration_id::text
      AND ar.primary_email = auth.jwt()->>'email'
    )
  );
