# 🌱 Sistema de Gestión de Jardín de Infantes

Sistema completo para la gestión de jardines de infantes con inscripciones públicas, dashboards diferenciados por roles y gestión integral de alumnos.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 2. Configurar Supabase
- Ve a Project Settings → Integrations
- Conecta tu proyecto de Supabase
- Las variables de entorno se configuran automáticamente

### 3. Configurar la base de datos
Ejecuta estos scripts en orden desde la interfaz de v0:
\`\`\`sql
scripts/01-create-database-schema.sql
scripts/02-seed-initial-data.sql
\`\`\`

### 4. Ejecutar la aplicación
\`\`\`bash
npm run dev
\`\`\`

¡Listo! La aplicación estará disponible en `http://localhost:3000`

## 👥 Usuarios de Prueba

Después de ejecutar los scripts, puedes usar estos usuarios:

- **Admin**: `admin@jardin.com` / `admin123`
- **Directivo**: `directivo@jardin.com` / `directivo123`  
- **Maestro**: `maestra1@jardin.com` / `maestra123`

## 📱 Funcionalidades

- **Página Pública**: Inscripciones de alumnos para sorteo
- **Dashboard Padres**: Ver información de hijos, asistencia, comunicaciones
- **Dashboard Maestros**: Gestión de alumnos asignados, asistencia, actividades
- **Dashboard Directivos**: CRUD completo de personal, alumnos y padres

## 🔗 Navegación

- **Página Principal**: `/` (inscripciones públicas)
- **Login**: `/auth/login` 
- **Dashboards**: `/dashboard` (redirige según rol)

---

Para más detalles técnicos, consulta `README-TECNICO.md`  
Para guía de usuario, consulta `README-USUARIO.md`
