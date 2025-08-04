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
);

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
