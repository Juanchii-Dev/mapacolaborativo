-- This script is primarily for setting up triggers or functions related to auth.users
-- The profiles table and handle_new_user function are already in 01-create-database-schema.sql
-- This file can be used for additional auth-related schema changes if needed.

-- Create or replace function to update updated_at timestamp for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace trigger to automatically update updated_at for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for public access to profiles (read-only for non-owners)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (TRUE);

-- Policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure the 'reports' table exists and has 'user_id'
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT DEFAULT 'pending',
    image_url TEXT,
    address TEXT,
    votes INTEGER DEFAULT 0, -- Ensure votes column exists
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Ensure user_id column exists
);

-- Add index for reports user_id
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

-- Add votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, report_id) -- Ensure a user can only vote once per report
);

-- Add index for votes user_id and report_id
CREATE INDEX IF NOT EXISTS idx_votes_user_report ON public.votes(user_id, report_id);

-- Create the admin_users table (for managing reports)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY, -- This will link to auth.users.id
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
