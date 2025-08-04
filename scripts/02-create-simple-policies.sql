-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to reports" ON reports;
DROP POLICY IF EXISTS "Allow public insert access to reports" ON reports;
DROP POLICY IF EXISTS "Allow public update votes on reports" ON reports;

DROP POLICY IF EXISTS "Allow public read access to report_votes" ON report_votes;
DROP POLICY IF EXISTS "Allow public insert access to report_votes" ON report_votes;

DROP POLICY IF EXISTS "Allow public read access to report_comments" ON report_comments;
DROP POLICY IF EXISTS "Allow public insert access to report_comments" ON report_comments;

-- Reports policies
-- Allow anyone to read reports
CREATE POLICY "Allow public read access to reports" ON reports
  FOR SELECT USING (true);

-- Allow anyone to insert reports
CREATE POLICY "Allow public insert access to reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update votes on reports
CREATE POLICY "Allow public update votes on reports" ON reports
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Report votes policies
-- Allow anyone to read votes
CREATE POLICY "Allow public read access to report_votes" ON report_votes
  FOR SELECT USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Allow public insert access to report_votes" ON report_votes
  FOR INSERT WITH CHECK (true);

-- Report comments policies
-- Allow anyone to read comments
CREATE POLICY "Allow public read access to report_comments" ON report_comments
  FOR SELECT USING (true);

-- Allow anyone to insert comments
CREATE POLICY "Allow public insert access to report_comments" ON report_comments
  FOR INSERT WITH CHECK (true);
