-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum for problem types
CREATE TYPE problem_type AS ENUM ('bache', 'luz', 'basura', 'inseguridad', 'otro');

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  votes INTEGER DEFAULT 0 CHECK (votes >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  -- Add geospatial column for efficient location queries
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_Point(longitude, latitude)) STORED
);

-- Create votes table to track individual votes
CREATE TABLE IF NOT EXISTS report_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate votes from same IP/fingerprint
  UNIQUE(report_id, voter_ip, voter_fingerprint)
);

-- Create comments table for reports
CREATE TABLE IF NOT EXISTS report_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (length(comment_text) <= 1000),
  commenter_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table (for managing reports)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY, -- This will link to auth.users.id
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_votes ON reports(votes DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_coordinates ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_report_votes_report_id ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_report_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reports 
        SET votes = votes + 1 
        WHERE id = NEW.report_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reports 
        SET votes = votes - 1 
        WHERE id = OLD.report_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update vote count
CREATE TRIGGER update_votes_count_trigger
    AFTER INSERT OR DELETE ON report_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_report_votes_count();
