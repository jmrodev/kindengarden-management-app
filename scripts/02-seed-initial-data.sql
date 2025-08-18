-- Insertar vacunas comunes para jardín de infantes
INSERT INTO vaccines (name, description, required_age_months, is_required) VALUES
  ('BCG', 'Tuberculosis', 0, true),
  ('Hepatitis B', 'Hepatitis B', 0, true),
  ('DPT (1ra dosis)', 'Difteria, Pertussis, Tétanos', 2, true),
  ('DPT (2da dosis)', 'Difteria, Pertussis, Tétanos', 4, true),
  ('DPT (3ra dosis)', 'Difteria, Pertussis, Tétanos', 6, true),
  ('Polio (1ra dosis)', 'Poliomielitis', 2, true),
  ('Polio (2da dosis)', 'Poliomielitis', 4, true),
  ('Polio (3ra dosis)', 'Poliomielitis', 6, true),
  ('Triple Viral', 'Sarampión, Rubéola, Paperas', 12, true),
  ('Varicela', 'Varicela', 12, true),
  ('Hepatitis A', 'Hepatitis A', 12, true),
  ('DPT Refuerzo', 'Refuerzo DPT', 18, true),
  ('Polio Refuerzo', 'Refuerzo Polio', 18, true);

-- Crear usuario administrador inicial (se debe cambiar la contraseña)
-- Nota: Este usuario se creará manualmente en Supabase Auth
