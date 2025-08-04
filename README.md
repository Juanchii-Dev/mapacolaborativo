# Mapa Colaborativo de Problemas Vecinales

Esta es una aplicación web para que los vecinos puedan reportar y visualizar problemas en su comunidad de forma colaborativa.

## Características

-   **Reporte de Problemas**: Los usuarios pueden reportar problemas en un mapa, incluyendo tipo, descripción, ubicación y una imagen.
-   **Visualización en Mapa**: Los problemas se muestran en un mapa interactivo (Leaflet).
-   **Votación**: Los usuarios pueden votar por los reportes para indicar su importancia o acuerdo.
-   **Comentarios**: Los usuarios pueden añadir comentarios a los reportes.
-   **Autenticación**: Registro e inicio de sesión de usuarios con Supabase Auth.
-   **Modo Offline**: Funcionalidad básica disponible incluso sin conexión a la base de datos (con limitaciones).
-   **Panel de Administración**: Una sección protegida para que los administradores gestionen los reportes (cambiar estado, prioridad, eliminar).
-   **Notificaciones**: (Futura implementación) Notificaciones en tiempo real para actualizaciones de reportes.
-   **Exportación a PDF**: (Futura implementación) Funcionalidad para exportar reportes a PDF.

## Tecnologías Utilizadas

-   **Next.js**: Framework de React para el frontend y el backend (API Routes, Server Actions).
-   **React**: Biblioteca de JavaScript para construir interfaces de usuario.
-   **TypeScript**: Lenguaje de programación tipado.
-   **Tailwind CSS**: Framework CSS para estilos rápidos y responsivos.
-   **Shadcn/ui**: Componentes UI reutilizables y accesibles.
-   **Supabase**: Backend como servicio (BaaS) para base de datos PostgreSQL, autenticación y almacenamiento de archivos.
-   **Leaflet**: Biblioteca de JavaScript para mapas interactivos.
-   **Lucide React**: Iconos.

## Configuración del Entorno

Consulta `CONFIGURACION_ACTUALIZADA.md` para los pasos detallados de configuración de Supabase y variables de entorno.

## Instalación

1.  Clona el repositorio:
    \`\`\`bash
    git clone <URL_DEL_REPOSITORIO>
    cd mapa-colaborativo-problemas
    \`\`\`
2.  Instala las dependencias:
    \`\`\`bash
    npm install
    # o
    yarn install
    \`\`\`
3.  Configura tus variables de entorno (ver `CONFIGURACION_ACTUALIZADA.md`).
4.  Configura tu base de datos Supabase (ver `CONFIGURACION_ACTUALIZADA.md`).

## Ejecución

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

-   `app/`: Rutas de Next.js (App Router).
    -   `layout.tsx`: Layout principal de la aplicación.
    -   `page.tsx`: Página principal del mapa.
    -   `admin/page.tsx`: Panel de administración.
    -   `loading.tsx`: Componente de carga global.
-   `components/`: Componentes React reutilizables.
    -   `ui/`: Componentes de Shadcn/ui.
-   `lib/`: Utilidades y lógica de negocio.
    -   `supabase/`: Configuración del cliente Supabase (cliente y servidor).
    -   `database.types.ts`: Tipos generados por Supabase CLI.
-   `hooks/`: Hooks personalizados de React.
-   `public/`: Archivos estáticos.
-   `scripts/`: Scripts SQL para la configuración de la base de datos.
-   `styles/`: Archivos CSS globales.

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request.

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)
