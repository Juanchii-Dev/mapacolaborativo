# Configuración Actualizada - Mapa Colaborativo

## 🔧 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
\`\`\`

## 📊 Configuración Simplificada de Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Anota la URL y la clave anónima del proyecto

### 2. Ejecutar Scripts SQL Simplificados
**¡IMPORTANTE!** Ejecuta estos scripts en el SQL Editor de Supabase **en el orden exacto** para asegurar que la base de datos se configure correctamente. El primer script ahora incluye sentencias para limpiar la base de datos antes de recrear las tablas.

1. `scripts/01-create-simple-schema.sql` - Crea tablas básicas y funciones
2. `scripts/02-create-simple-policies.sql` - Configura permisos RLS
3. `scripts/03-create-simple-storage.sql` - Crea bucket de imágenes y sus políticas
4. `scripts/04-insert-simple-data.sql` - Inserta datos de ejemplo

### 3. Verificar Configuración
- Ve a "Table Editor" y verifica que las tablas se crearon:
  - `reports`
  - `report_votes`
  - `report_comments`
- Ve a "Storage" y verifica que el bucket "report-images" existe

## ✅ Problemas Solucionados

### 1. Errores de Esquema (Tablas y Columnas)
- ❌ **Antes**: Errores como `relation "report_votes" does not exist` o `column "status" does not exist`.
- ✅ **Ahora**: El script `01-create-simple-schema.sql` incluye `DROP TABLE IF EXISTS` y `DROP TYPE IF EXISTS` para asegurar una recreación limpia de la base de datos, resolviendo estos problemas de esquema.

### 2. Sistema de Votos Simplificado
- ✅ Verificación de votos existentes antes de insertar
- ✅ Inserción en tabla `report_votes`
- ✅ Actualización del contador en tabla `reports`
- ✅ Manejo de errores con fallback local

### 3. Configuración Mínima
- ✅ Solo 4 scripts SQL necesarios
- ✅ Sin dependencias de extensiones complejas (excepto `uuid-ossp`)
- ✅ Funciona con configuración básica de Supabase
- ✅ Políticas RLS simplificadas

## 🚀 Instalación Rápida

\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crear .env.local con las credenciales de Supabase

# 3. Ejecutar aplicación
npm run dev
\`\`\`

## 🔍 Funcionalidades Verificadas

- ✅ Crear reportes con geolocalización
- ✅ Subir imágenes al storage
- ✅ Votar en reportes (sin duplicados)
- ✅ Filtrar reportes por tipo y zona
- ✅ Ver detalles de reportes
- ✅ Generar PDF con estadísticas
- ✅ Actualizaciones en tiempo real
- ✅ Modo offline con datos de ejemplo

## 🛠️ Troubleshooting

### Si sigues teniendo errores de función:
1. Asegúrate de haber ejecutado todos los scripts SQL en el orden indicado.
2. Si la función `increment_report_votes` no se creó, puedes ejecutar solo esta parte:

\`\`\`sql
CREATE OR REPLACE FUNCTION increment_report_votes(report_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE reports
    SET votes = votes + 1
    WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;
\`\`\`

### Si los votos no funcionan:
1. La aplicación está diseñada para funcionar incluso si la función SQL no está presente, usando un fallback a la actualización manual.
2. Los votos se guardan en `report_votes` y el contador se actualiza en `reports`.

## 📱 Características

- **Fingerprinting**: Previene votos duplicados por dispositivo
- **Tiempo real**: Actualizaciones automáticas con Supabase
- **Offline**: Funciona con datos locales sin conexión
- **Responsive**: Optimizado para móviles y desktop
- **Seguro**: Políticas RLS para proteger datos

La aplicación ahora es más robusta frente a errores de configuración de la base de datos.
