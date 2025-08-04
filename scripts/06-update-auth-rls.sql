-- Update RLS policies for the 'reports' table to allow admins to update
-- Policy for users to view all reports
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports;
CREATE POLICY "Enable read access for all users" ON public.reports
  FOR SELECT USING (TRUE);

-- Policy for authenticated users to insert reports
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reports;
CREATE POLICY "Enable insert for authenticated users only" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for report owners to update their own reports
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reports;
CREATE POLICY "Enable update for users based on user_id" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for admins to update any report
DROP POLICY IF EXISTS "Admins can update all reports" ON public.reports;
CREATE POLICY "Admins can update all reports" ON public.reports
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Policy for report owners to delete their own reports
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reports;
CREATE POLICY "Enable delete for users based on user_id" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for admins to delete any report
DROP POLICY IF EXISTS "Admins can delete all reports" ON public.reports;
CREATE POLICY "Admins can delete all reports" ON public.reports
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS for votes table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert votes
DROP POLICY IF EXISTS "Enable insert for authenticated users on votes" ON public.votes;
CREATE POLICY "Enable insert for authenticated users on votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all users to read votes (to check if they've voted)
DROP POLICY IF EXISTS "Enable read access for all users on votes" ON public.votes;
CREATE POLICY "Enable read access for all users on votes" ON public.votes
  FOR SELECT USING (TRUE);

-- Allow users to delete their own votes (if needed)
DROP POLICY IF EXISTS "Enable delete for users on their own votes" ON public.votes;
CREATE POLICY "Enable delete for users on their own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- Admin users policies (restrict access)
CREATE POLICY "Admin users can only see themselves" ON admin_users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Only admins can insert admin users" ON admin_users
FOR INSERT WITH CHECK (false); -- Disable public insert, only via admin
