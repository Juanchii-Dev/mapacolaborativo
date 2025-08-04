-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage policies for report images
-- Allow anyone to upload images
CREATE POLICY "Allow public upload to report-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-images' 
    AND (storage.foldername(name))[1] = 'uploads'
  );

-- Allow anyone to read images
CREATE POLICY "Allow public read from report-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-images');

-- Allow deletion of images (for cleanup)
CREATE POLICY "Allow public delete from report-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'report-images');
