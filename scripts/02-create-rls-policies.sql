-- scripts/02-create-rls-policies.sql
-- Enable Row Level Security (RLS) for relevant tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Reports policies
DROP POLICY IF EXISTS "Allow public read access to reports" ON reports;
CREATE POLICY "Allow public read access to reports" ON reports
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to reports" ON reports;
CREATE POLICY "Allow public insert access to reports" ON reports
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update their own reports
DROP POLICY IF EXISTS "Allow authenticated users to update their own reports" ON reports;
CREATE POLICY "Allow authenticated users to update their own reports" ON reports
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own reports
DROP POLICY IF EXISTS "Allow authenticated users to delete their own reports" ON reports;
CREATE POLICY "Allow authenticated users to delete their own reports" ON reports
FOR DELETE USING (auth.uid() = user_id);

-- Allow anyone to update votes on reports (specifically for the 'votes' column, handled by RPC)
-- This policy is broad because the actual vote logic is in the RPC and report_votes table.
DROP POLICY IF EXISTS "Allow anyone to update votes on reports" ON reports;
CREATE POLICY "Allow anyone to update votes on reports" ON reports
FOR UPDATE USING (true) WITH CHECK (true);


-- Report comments policies
DROP POLICY IF EXISTS "Allow public read access to report_comments" ON report_comments;
CREATE POLICY "Allow public read access to report_comments" ON report_comments
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON report_comments;
CREATE POLICY "Allow authenticated users to insert comments" ON report_comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to delete their own comments" ON report_comments;
CREATE POLICY "Allow authenticated users to delete their own comments" ON report_comments
FOR DELETE USING (auth.uid() = user_id);


-- Report votes policies
DROP POLICY IF EXISTS "Allow authenticated users to insert votes" ON report_votes;
CREATE POLICY "Allow authenticated users to insert votes" ON report_votes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Allow authenticated users to delete their own votes" ON report_votes;
CREATE POLICY "Allow authenticated users to delete their own votes" ON report_votes
FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON profiles;
CREATE POLICY "Allow authenticated users to read their own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
CREATE POLICY "Allow authenticated users to update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin policy for profiles (optional, if you have an admin role)
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- CREATE POLICY "Admins can view all profiles" ON profiles
-- FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
