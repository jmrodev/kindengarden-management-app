-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de roles de usuario
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles predefinidos
INSERT INTO user_roles (name, description) VALUES
  ('padre', 'Padre o tutor de alumno'),
  ('maestro', 'Maestro del jardín'),
  ('directivo', 'Personal directivo del jardín'),
  ('admin', 'Administrador del sistema');

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role_id UUID REFERENCES user_roles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alumnos
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10),
  medical_conditions TEXT,
  allergies TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  teacher_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación padres-alumnos
CREATE TABLE parent_student_relations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- 'padre', 'madre', 'tutor', etc.
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Tabla de personas autorizadas para retirar alumnos
CREATE TABLE authorized_pickups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  authorized_person_name VARCHAR(200) NOT NULL,
  authorized_person_phone VARCHAR(20),
  authorized_person_dni VARCHAR(20),
  relationship VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencia
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'presente', 'ausente', 'tardanza'
  arrival_time TIME,
  departure_time TIME,
  picked_up_by VARCHAR(200),
  notes TEXT,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Tabla de vacunas
CREATE TABLE vaccines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  required_age_months INTEGER,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de registro de vacunas por alumno
CREATE TABLE student_vaccines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  vaccine_id UUID REFERENCES vaccines(id),
  vaccination_date DATE,
  batch_number VARCHAR(100),
  administered_by VARCHAR(200),
  notes TEXT,
  is_up_to_date BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, vaccine_id)
);

-- Tabla de cambio de pañales
CREATE TABLE diaper_changes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  change_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(20) NOT NULL, -- 'orina', 'deposicion', 'ambos'
  notes TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comunicaciones
CREATE TABLE communications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'general', 'individual', 'urgente'
  sender_id UUID REFERENCES user_profiles(id),
  target_role VARCHAR(50), -- para comunicaciones generales por rol
  target_student_id UUID REFERENCES students(id), -- para comunicaciones específicas
  is_urgent BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de cambios de datos
CREATE TABLE change_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES user_profiles(id),
  target_type VARCHAR(50) NOT NULL, -- 'student', 'parent', 'authorized_pickup'
  target_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  current_value TEXT,
  requested_value TEXT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inscripciones públicas (sorteo)
CREATE TABLE public_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_birth_date DATE NOT NULL,
  parent_first_name VARCHAR(100) NOT NULL,
  parent_last_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_address TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'selected', 'rejected', 'enrolled'
  lottery_number INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  selected_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_communications_target ON communications(target_student_id, target_role);
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_public_enrollments_status ON public_enrollments(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (se pueden refinar más adelante)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
