-- Crear tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  reporter_name VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(latitude, longitude);

-- Habilitar Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Allow public read access" ON reports
  FOR SELECT USING (true);

-- Política para permitir inserción a todos
CREATE POLICY "Allow public insert access" ON reports
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualización de votos
CREATE POLICY "Allow public update votes" ON reports
  FOR UPDATE USING (true)
  WITH CHECK (true);
