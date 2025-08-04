-- Create a storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report_images', 'report_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage security policy
CREATE POLICY "Allow public read access to report images" ON storage.objects
FOR SELECT USING (bucket_id = 'report_images');

CREATE POLICY "Allow authenticated inserts to report images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated updates to report images" ON storage.objects
FOR UPDATE USING (bucket_id = 'report_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated deletes to report images" ON storage.objects
FOR DELETE USING (bucket_id = 'report_images' AND auth.uid() IS NOT NULL);

-- Create a storage bucket named 'public_files' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_files', 'public_files', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to upload files to 'public_files'
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'public_files');

-- Policy to allow anyone to read files from 'public_files'
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'public_files');
