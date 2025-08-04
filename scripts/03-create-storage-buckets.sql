-- scripts/03-create-storage-buckets.sql
-- This script creates storage buckets and sets up RLS policies for them.

-- Create a storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report_images', 'report_images', TRUE) -- Set to TRUE for public access to images
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images to 'report_images'
DROP POLICY IF EXISTS "Allow authenticated uploads to report_images" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to report_images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'report_images'
    AND auth.role() = 'authenticated'
);

-- Policy to allow anyone to read images from 'report_images'
DROP POLICY IF EXISTS "Allow public read access to report_images" ON storage.objects;
CREATE POLICY "Allow public read access to report_images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'report_images'
);

-- Policy to allow authenticated users to delete their own images (optional)
DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'report_images'
    AND auth.uid() = (storage.foldername(name))[1]::uuid -- Assumes user_id is the first part of the path
);
