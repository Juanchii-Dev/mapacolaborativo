-- scripts/08-update-reports-table-for-auth.sql
-- Add user_id column to reports table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='user_id') THEN
        ALTER TABLE reports
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update existing reports to associate them with a default user or null if no user is logged in
-- This is a placeholder. In a real scenario, you might migrate existing data or handle it differently.
-- For now, we'll set it to NULL for existing reports if no user is specified.
UPDATE public.reports
SET user_id = NULL
WHERE user_id IS NULL;

-- Make user_id NOT NULL if you want every report to be associated with a user
-- ALTER TABLE public.reports ALTER COLUMN user_id SET NOT NULL;

-- Add reporter_name column to reports table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reporter_name') THEN
        ALTER TABLE reports
        ADD COLUMN reporter_name TEXT;
    END IF;
END $$;

-- Update existing reports to set a default reporter_name if it's null
UPDATE reports
SET reporter_name = COALESCE(reporter_name, 'Anónimo')
WHERE reporter_name IS NULL AND user_id IS NULL;

-- Optionally, if you have a way to link existing reports to users, you could do it here.
-- For example, if you had a temporary 'reporter_email' column:
-- UPDATE reports r
-- SET user_id = u.id
-- FROM auth.users u
-- WHERE r.reporter_email = u.email AND r.user_id IS NULL;
-- ALTER TABLE reports DROP COLUMN reporter_email; -- Then drop the temporary column

-- Update RLS policy for reports to allow authenticated users to insert reports with their user_id
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.reports;
CREATE POLICY "Allow authenticated users to insert reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update RLS policy for reports to allow authenticated users to update their own reports
DROP POLICY IF EXISTS "Allow authenticated users to update their own reports" ON public.reports;
CREATE POLICY "Allow authenticated users to update their own reports"
ON public.reports FOR UPDATE
USING (auth.uid() = user_id);

-- Update RLS policy for reports to allow authenticated users to delete their own reports
DROP POLICY IF EXISTS "Allow authenticated users to delete their own reports" ON public.reports;
CREATE POLICY "Allow authenticated users to delete their own reports"
ON public.reports FOR DELETE
USING (auth.uid() = user_id);

-- Update RLS policy for reports to allow all users to read reports
DROP POLICY IF EXISTS "Allow all users to read reports" ON public.reports;
CREATE POLICY "Allow all users to read reports"
ON public.reports FOR SELECT
USING (true);

-- Add a trigger to automatically set user_id on new report inserts
CREATE OR REPLACE FUNCTION public.set_user_id_on_report()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_on_report_trigger ON public.reports;
CREATE TRIGGER set_user_id_on_report_trigger
BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_report();
