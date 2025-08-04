-- scripts/01-create-database-schema.sql
-- This script creates the core tables for the application.

-- Enable the "uuid-ossp" extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'in_progress', 'resolved'
    votes INTEGER DEFAULT 0 NOT NULL,
    reporter_name TEXT, -- Name of the reporter (can be anonymous)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Link to auth.users table
);

-- Table for comments on reports
CREATE TABLE IF NOT EXISTS report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    commenter_name TEXT, -- Name of the commenter (can be anonymous)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth.users table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking votes on reports
CREATE TABLE IF NOT EXISTS report_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to auth.users table
    voter_fingerprint TEXT, -- A unique identifier for anonymous voting (e.g., IP hash, browser fingerprint)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (report_id, user_id), -- A user can only vote once per report
    UNIQUE (report_id, voter_fingerprint) -- A fingerprint can only vote once per report (for anonymous)
);

-- Table for user profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Function to create a profile for new users upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, is_admin)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
