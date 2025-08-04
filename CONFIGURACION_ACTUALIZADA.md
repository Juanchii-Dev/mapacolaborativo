# Configuración Actualizada del Proyecto

Este documento detalla los cambios y la configuración necesaria para el proyecto "Mapa Colaborativo de Problemas" después de las últimas actualizaciones.

## 1. Estructura de Clientes Supabase

Hemos refactorizado la forma en que se inicializan y utilizan los clientes de Supabase para seguir las mejores prácticas de Next.js (App Router).

-   **`lib/supabase/client.ts`**: Contiene la inicialización del cliente Supabase para ser usado en **componentes de cliente** (`"use client"`). Este cliente utiliza las claves `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
-   **`lib/supabase/server.ts`**: Contiene la inicialización del cliente Supabase para ser usado en **Server Components, Route Handlers y Server Actions**. Este cliente utiliza la clave `SUPABASE_SERVICE_ROLE_KEY` para operaciones seguras en el servidor.
-   **`lib/supabase.ts`**: Este archivo ahora actúa como un punto central para exportar las funciones `supabaseHelpers` que interactúan con la base de datos, utilizando internamente el cliente de Supabase del lado del cliente.

**Acción Requerida**: Asegúrate de que tus componentes importen el cliente correcto (`@/lib/supabase/client` o `@/lib/supabase/server`) según su entorno de ejecución.

## 2. Políticas de Seguridad a Nivel de Fila (RLS)

El script de políticas RLS (`scripts/02-create-rls-policies.sql`) ha sido actualizado para ser **idempotente**. Esto significa que puedes ejecutarlo múltiples veces sin causar errores si las políticas ya existen.

**Acción Requerida**: Vuelve a ejecutar el script `scripts/02-create-rls-policies.sql` en tu base de datos Supabase.

## 3. Tipificación de la Base de Datos

Se ha introducido el archivo `lib/database.types.ts` para proporcionar tipificación fuerte para las interacciones con tu base de datos Supabase.

**Acción Requerida**: Si aún no lo has hecho, genera este archivo usando la CLI de Supabase. Puedes usar un comando similar a:
`npx supabase gen types typescript --project-id "tu-id-de-proyecto" --schema public > lib/database.types.ts`

## 4. Variables de Entorno

Asegúrate de que las siguientes variables de entorno estén configuradas en tu entorno de desarrollo (`.env.local`) y en tu plataforma de despliegue (Vercel):

-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY` (¡Importante: esta clave solo debe usarse en el servidor!)

## 5. Tablas y Funciones de la Base de Datos

Confirma que las siguientes tablas y funciones existen en tu esquema `public` de Supabase:

-   **Tablas**: `reports`, `report_comments`, `report_votes`, `profiles`.
-   **Funciones (RPC)**: `increment_report_votes`, `decrement_report_votes`.
-   **Triggers**: `update_votes_count_trigger` en `report_votes`.

**Acción Requerida**: Si no estás seguro, puedes ejecutar los scripts SQL en el orden recomendado:
1.  `scripts/01-create-database-schema.sql` (si es la primera vez)
2.  `scripts/07-add-votes-table.sql`
3.  `scripts/02-create-rls-policies.sql`

## 6. Almacenamiento (Storage)

-   **Bucket**: Asegúrate de tener un bucket de almacenamiento llamado `report_images`.
-   **Políticas RLS**: Configura las políticas de RLS para este bucket para permitir que los usuarios autenticados suban y lean imágenes.

---

Con estos pasos, tu aplicación debería estar completamente configurada y funcionando correctamente.
