-- Drop existing tables and types to ensure a clean slate during development
DROP TABLE IF EXISTS report_comments CASCADE;
DROP TABLE IF EXISTS report_votes CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TYPE IF EXISTS problem_type CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for problem types
CREATE TYPE problem_type AS ENUM ('bache', 'luz', 'basura', 'inseguridad', 'otro');

-- Create reports table
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type problem_type NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL CHECK (length(description) <= 500),
  image_url TEXT,
  reporter_name VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  votes INTEGER DEFAULT 0 CHECK (votes >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create votes table to track individual votes
CREATE TABLE report_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate votes from same fingerprint
  UNIQUE(report_id, voter_fingerprint)
);

-- Create comments table for reports
CREATE TABLE report_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  comment TEXT NOT NULL CHECK (length(comment) <= 1000),
  commenter_name VARCHAR(100),
  commenter_ip INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_votes ON reports(votes DESC);
CREATE INDEX IF NOT EXISTS idx_reports_coordinates ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_report_votes_report_id ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_votes_fingerprint ON report_votes(voter_fingerprint);
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
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create simple function to increment votes
CREATE OR REPLACE FUNCTION increment_report_votes(report_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE reports
    SET votes = votes + 1
    WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;
