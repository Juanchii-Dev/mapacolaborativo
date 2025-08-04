-- RLS for reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all reports
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
CREATE POLICY "Enable read access for all users" ON reports
  FOR SELECT USING (TRUE);

-- Allow authenticated users to insert reports
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reports;
CREATE POLICY "Enable insert for authenticated users only" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own reports (optional, for future features)
DROP POLICY IF EXISTS "Enable update for authenticated users on their own reports" ON reports;
CREATE POLICY "Enable update for authenticated users on their own reports" ON reports
  FOR UPDATE USING (auth.uid() = (SELECT id FROM profiles WHERE email = auth.email()));

-- Allow admins to update all reports (status, priority)
DROP POLICY IF EXISTS "Admins can update all reports" ON reports;
CREATE POLICY "Admins can update all reports" ON reports
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- RLS for report_votes table
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert votes
DROP POLICY IF EXISTS "Enable insert for authenticated users on report_votes" ON report_votes;
CREATE POLICY "Enable insert for authenticated users on report_votes" ON report_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all users to read votes (for vote counts)
DROP POLICY IF EXISTS "Enable read access for all users on report_votes" ON report_votes;
CREATE POLICY "Enable read access for all users on report_votes" ON report_votes
  FOR SELECT USING (TRUE);

-- RLS for report_comments table
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert comments
DROP POLICY IF EXISTS "Enable insert for authenticated users on report_comments" ON report_comments;
CREATE POLICY "Enable insert for authenticated users on report_comments" ON report_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all users to read comments
DROP POLICY IF EXISTS "Enable read access for all users on report_comments" ON report_comments;
CREATE POLICY "Enable read access for all users on report_comments" ON report_comments
  FOR SELECT USING (TRUE);

-- RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Enable read access for authenticated users on their own profile" ON profiles;
CREATE POLICY "Enable read access for authenticated users on their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Enable update for authenticated users on their own profile" ON profiles;
CREATE POLICY "Enable update for authenticated users on their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow new users to create their profile (handled by trigger, but good to have a policy)
DROP POLICY IF EXISTS "Enable insert for new users on profiles" ON profiles;
CREATE POLICY "Enable insert for new users on profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;
