-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Reports policies
-- Allow anyone to read reports
CREATE POLICY "Allow public read access to reports" ON reports
  FOR SELECT USING (true);

-- Allow anyone to insert reports
CREATE POLICY "Allow public insert access to reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update votes on reports (for vote counting)
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

-- Prevent duplicate votes (handled by unique constraint, but extra safety)
CREATE POLICY "Prevent duplicate votes" ON report_votes
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM report_votes 
      WHERE report_id = NEW.report_id 
      AND (voter_ip = NEW.voter_ip OR voter_fingerprint = NEW.voter_fingerprint)
    )
  );

-- Report comments policies
-- Allow anyone to read comments
CREATE POLICY "Allow public read access to report_comments" ON report_comments
  FOR SELECT USING (true);

-- Allow anyone to insert comments
CREATE POLICY "Allow public insert access to report_comments" ON report_comments
  FOR INSERT WITH CHECK (true);

-- Admin users policies (restrict access)
CREATE POLICY "Admin users can only see themselves" ON admin_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Only admins can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (false); -- Disable public insert, only via admin
