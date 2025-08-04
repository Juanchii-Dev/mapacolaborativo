# Configuración Manual de Supabase para el Mapa Colaborativo de Problemas

Este documento detalla los pasos manuales necesarios para configurar tu proyecto Supabase y asegurar que la aplicación "Mapa Colaborativo de Problemas" funcione correctamente.

## 1. Crear un Nuevo Proyecto Supabase

1.  Ve a [Supabase Dashboard](https://app.supabase.com/).
2.  Haz clic en "New project".
3.  Elige un nombre para tu proyecto (ej. "mapa-problemas-vecinales").
4.  Establece una contraseña segura para la base de datos.
5.  Selecciona la región más cercana a tus usuarios.
6.  Haz clic en "Create new project".

## 2. Obtener las Credenciales de Supabase

Una vez que tu proyecto esté listo:

1.  Ve a "Project Settings" (icono de engranaje en la barra lateral izquierda).
2.  Selecciona "API".
3.  Copia los siguientes valores:
    *   **Project URL**: Esta será tu `NEXT_PUBLIC_SUPABASE_URL`.
    *   **`anon` public key**: Esta será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   **`service_role` secret key**: Esta será tu `SUPABASE_SERVICE_ROLE_KEY`.

## 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz de tu proyecto Next.js y añade las credenciales obtenidas:

```dotenv
NEXT_PUBLIC_SUPABASE_URL="[TU_PROJECT_URL]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[TU_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[TU_SERVICE_ROLE_KEY]"
