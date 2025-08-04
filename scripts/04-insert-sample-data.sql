-- Insert sample reports for testing
INSERT INTO reports (type, address, description, reporter_name, latitude, longitude, votes, status) VALUES
(
  'bache',
  'Av. Corrientes 1234, Buenos Aires, Argentina',
  'Bache grande en el carril derecho que dificulta el tránsito vehicular y puede causar daños a los vehículos',
  'Juan Pérez',
  -34.6037,
  -58.3816,
  12,
  'pending'
),
(
  'luz',
  'Calle Florida 567, Buenos Aires, Argentina',
  'Luminaria rota desde hace una semana, genera inseguridad durante la noche',
  'María González',
  -34.602,
  -58.375,
  8,
  'in_progress'
),
(
  'basura',
  'Plaza San Martín, Buenos Aires, Argentina',
  'Acumulación de basura en la esquina, genera malos olores y atrae roedores',
  NULL,
  -34.598,
  -58.38,
  15,
  'pending'
),
(
  'inseguridad',
  'Av. Santa Fe 890, Buenos Aires, Argentina',
  'Zona con poca iluminación donde han ocurrido varios robos en las últimas semanas',
  'Carlos Rodríguez',
  -34.595,
  -58.385,
  23,
  'pending'
),
(
  'otro',
  'Calle Lavalle 456, Buenos Aires, Argentina',
  'Semáforo intermitente que no funciona correctamente, causa problemas de tránsito',
  NULL,
  -34.608,
  -58.378,
  6,
  'resolved'
),
(
  'bache',
  'Av. 9 de Julio 123, Buenos Aires, Argentina',
  'Múltiples baches en la avenida principal que afectan el tránsito diario',
  'Ana López',
  -34.61,
  -58.383,
  31,
  'pending'
),
(
  'luz',
  'Parque Centenario, Buenos Aires, Argentina',
  'Varias luminarias del parque no funcionan, creando zonas muy oscuras',
  NULL,
  -34.606,
  -58.432,
  18,
  'in_progress'
),
(
  'basura',
  'Av. Rivadavia 2000, Buenos Aires, Argentina',
  'Contenedores desbordados que no se vacían hace días',
  'Luis Martínez',
  -34.609,
  -58.392,
  9,
  'pending'
),
('bache', 'Av. Corrientes 1234, CABA', 'Bache grande en el carril derecho, peligroso para vehículos.', -34.6037, -58.3816, 15, 'pending', 'Juan Pérez'),
('luminaria', 'Calle Falsa 123, CABA', 'Luminaria pública quemada, la calle está muy oscura por la noche.', -34.595, -58.405, 8, 'in_progress', 'María García'),
('seguridad', 'Plaza San Martín, CABA', 'Robos frecuentes en la plaza, se necesita más presencia policial.', -34.5997, -58.3762, 22, 'resolved', 'Pedro López'),
('limpieza', 'Rivadavia 5000, CABA', 'Acumulación de basura en la vereda, los contenedores están desbordados.', -34.615, -58.435, 10, 'pending', 'Ana Fernández'),
('otro', 'Diagonal Norte 800, CABA', 'Árbol caído bloqueando parcialmente la vereda.', -34.601, -58.377, 5, 'pending', 'Carlos Ruiz'),
('inundación', 'Defensa 200, CABA', 'Calles inundadas después de lluvias leves, problemas de drenaje.', -34.608, -58.372, 18, 'in_progress', 'Laura Giménez'),
('ruido', 'Santa Fe 2500, CABA', 'Ruido excesivo de un bar por las noches, afecta el descanso de los vecinos.', -34.589, -58.409, 9, 'pending', 'Roberto Castro'),
('transporte', 'Estación Retiro, CABA', 'Problemas con la frecuencia de los colectivos en hora pico.', -34.591, -58.373, 12, 'pending', 'Sofía Torres'),
('salud', 'Hospital Durand, CABA', 'Falta de insumos básicos en el hospital público.', -34.609, -58.423, 25, 'in_progress', 'Diego Morales'),
('educación', 'Escuela N° 1, CABA', 'Problemas de infraestructura en la escuela, aulas sin calefacción.', -34.620, -58.390, 7, 'pending', 'Elena Gómez');

-- Insert some sample comments
INSERT INTO report_comments (report_id, comment, commenter_name) VALUES
(
  (SELECT id FROM reports WHERE address LIKE '%Corrientes%' LIMIT 1),
  'Este bache está empeorando cada día. Ya dañó la llanta de mi auto.',
  'Vecino Preocupado'
),
(
  (SELECT id FROM reports WHERE address LIKE '%Florida%' LIMIT 1),
  'Confirmo, esta zona está muy oscura por las noches.',
  'María José'
),
(
  (SELECT id FROM reports WHERE address LIKE '%Santa Fe%' LIMIT 1),
  'Ayer intentaron robarme aquí a las 9 PM. Necesitamos más iluminación urgente.',
  'Carlos M.'
);

-- Insert new sample reports for Springfield
INSERT INTO reports (type, address, description, latitude, longitude, reporter_name, user_id) VALUES
('Bache', 'Calle Falsa 123, Springfield', 'Gran bache en la calle principal, peligroso para ciclistas.', -34.6037, -58.3816, 'Juan Pérez', NULL),
('Falla de alumbrado', 'Avenida Siempreviva 742, Springfield', 'Varias farolas no funcionan en esta avenida, muy oscuro por la noche.', -34.605, -58.385, 'María García', NULL),
('Basura acumulada', 'Plaza Central, Springfield', 'Acumulación de basura cerca de los bancos, atrae plagas.', -34.602, -58.380, 'Carlos Ruiz', NULL);
