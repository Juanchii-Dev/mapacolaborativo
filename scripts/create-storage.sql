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

-- Create a storage bucket for my_bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('my_bucket', 'my_bucket', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload to 'my_bucket'
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'my_bucket' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to read from 'my_bucket'
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (bucket_id = 'my_bucket' AND auth.role() = 'authenticated');
