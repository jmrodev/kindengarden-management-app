# Sistema de Gestión de Jardín de Infantes - Documentación Técnica

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14 con App Router
- **Backend**: Next.js API Routes y Server Actions
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **TypeScript**: Para tipado estático

### Estructura del Proyecto
\`\`\`
├── app/                          # App Router de Next.js
│   ├── auth/                     # Páginas de autenticación
│   │   ├── login/               # Página de login
│   │   └── register/            # Página de registro
│   ├── dashboard/               # Dashboards por rol
│   │   ├── padre/              # Dashboard de padres
│   │   ├── maestro/            # Dashboard de maestros
│   │   └── directivo/          # Dashboard de directivos
│   └── alumno/[id]/            # Perfil detallado de alumno
├── components/                  # Componentes reutilizables
│   ├── ui/                     # Componentes base de shadcn/ui
│   ├── auth-guard.tsx          # Protección de rutas
│   ├── dashboard-layout.tsx    # Layout de dashboards
│   └── [otros-componentes].tsx
├── lib/                        # Utilidades y configuraciones
│   ├── supabase/              # Configuración de Supabase
│   │   ├── client.ts          # Cliente para el navegador
│   │   ├── server.ts          # Cliente para el servidor
│   │   └── middleware.ts      # Middleware de autenticación
│   ├── actions.ts             # Server Actions
│   └── utils.ts               # Utilidades generales
├── scripts/                   # Scripts SQL
│   ├── 01-create-database-schema.sql
│   └── 02-seed-initial-data.sql
└── middleware.ts              # Middleware de Next.js
\`\`\`

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `auth.users` (Supabase Auth)
- Gestión de usuarios y autenticación

#### `user_profiles`
- `id` (UUID, PK)
- `user_id` (UUID, FK a auth.users)
- `role` (ENUM: padre, maestro, directivo, admin)
- `first_name`, `last_name`
- `email`, `phone`
- `created_at`, `updated_at`

#### `students`
- `id` (UUID, PK)
- `first_name`, `last_name`
- `birth_date`, `age`
- `medical_info`, `allergies`
- `assigned_teacher_id` (FK a user_profiles)
- `status` (ENUM: inscrito, activo, inactivo)

#### `parents`
- `id` (UUID, PK)
- `user_id` (UUID, FK a auth.users)
- `student_id` (UUID, FK a students)
- `relationship` (padre, madre, tutor)
- `is_primary` (BOOLEAN)

#### `attendance`
- `id` (UUID, PK)
- `student_id` (FK a students)
- `date` (DATE)
- `status` (presente, ausente, tardanza)
- `notes`, `recorded_by`

#### `vaccines`
- `id` (UUID, PK)
- `student_id` (FK a students)
- `vaccine_name`, `date_administered`
- `next_due_date`, `notes`

#### `diaper_changes`
- `id` (UUID, PK)
- `student_id` (FK a students)
- `changed_at` (TIMESTAMP)
- `changed_by` (FK a user_profiles)
- `notes`

#### `authorized_pickups`
- `id` (UUID, PK)
- `student_id` (FK a students)
- `authorized_person_name`
- `relationship`, `phone`, `id_number`
- `is_active` (BOOLEAN)

#### `communications`
- `id` (UUID, PK)
- `from_user_id`, `to_user_id` (FK a user_profiles)
- `student_id` (FK a students)
- `subject`, `message`
- `is_read` (BOOLEAN)
- `created_at`

#### `change_requests`
- `id` (UUID, PK)
- `requested_by` (FK a user_profiles)
- `student_id` (FK a students)
- `request_type`, `current_data`, `requested_data`
- `status` (pendiente, aprobado, rechazado)
- `reviewed_by`, `reviewed_at`

#### `public_enrollments`
- `id` (UUID, PK)
- `parent_name`, `parent_email`, `parent_phone`
- `child_name`, `child_birth_date`
- `address`, `emergency_contact`
- `status` (pendiente, seleccionado, rechazado)
- `submitted_at`

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone [url-del-repositorio]
cd garden-management
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
# Las siguientes variables ya están configuradas en Vercel:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. **Ejecutar scripts de base de datos**
\`\`\`bash
# Ejecutar en el orden correcto:
# 1. scripts/01-create-database-schema.sql
# 2. scripts/02-seed-initial-data.sql
\`\`\`

5. **Iniciar el servidor de desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## 🔐 Sistema de Autenticación

### Roles y Permisos

#### Admin
- Acceso completo al sistema
- Puede crear usuarios de cualquier rol
- Gestión de configuración del sistema

#### Directivo
- CRUD completo de personal, alumnos y padres
- Aprobación de solicitudes de cambios
- Acceso a reportes y estadísticas

#### Maestro
- CRUD de alumnos asignados
- Registro de asistencia y actividades
- Comunicación con padres
- Gestión de personas autorizadas para retiro

#### Padre
- Visualización de información de sus hijos
- Solicitud de cambios de datos
- Comunicación con maestros
- Seguimiento de asistencia

### Flujo de Autenticación

1. **Registro público**: Solo para inscripciones de padres
2. **Registro administrativo**: Admin/Directivos crean cuentas de personal
3. **Login**: Redirección automática según rol
4. **Middleware**: Protección de rutas por rol
5. **Session management**: Manejo automático con Supabase

## 🔧 Desarrollo

### Comandos Útiles
\`\`\`bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
\`\`\`

### Estructura de Componentes
- **Componentes de UI**: Basados en shadcn/ui
- **Componentes de negocio**: Específicos del dominio
- **Layouts**: Estructuras de página reutilizables
- **Forms**: Formularios con validación

### Server Actions
- Ubicados en `lib/actions.ts`
- Manejo de operaciones de base de datos
- Validación de permisos por rol

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Variables de Entorno en Producción
\`\`\`bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
\`\`\`

## 🐛 Debugging

### Logs de Desarrollo
- Usar `console.log("[v0] mensaje")` para debugging
- Logs de Supabase en la consola del navegador
- Network tab para inspeccionar requests

### Problemas Comunes
1. **Error de autenticación**: Verificar variables de entorno
2. **Error de base de datos**: Verificar que los scripts SQL se ejecutaron
3. **Error de permisos**: Verificar RLS policies en Supabase

## 📊 Monitoreo

### Métricas Importantes
- Tiempo de respuesta de la aplicación
- Errores de autenticación
- Uso de la base de datos
- Logs de Supabase

## 🔄 Mantenimiento

### Backups
- Supabase maneja backups automáticos
- Exportar datos importantes regularmente

### Actualizaciones
- Mantener dependencias actualizadas
- Revisar logs de Supabase regularmente
- Monitorear performance

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs de la aplicación
2. Verificar estado de Supabase
3. Consultar documentación de Next.js
4. Contactar al equipo de desarrollo
