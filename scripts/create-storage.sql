-- Crear bucket para imágenes de reportes
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir subida de imágenes
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-images');

-- Política para permitir lectura de imágenes
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-images');
