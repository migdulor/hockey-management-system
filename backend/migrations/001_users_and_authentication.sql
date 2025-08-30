-- Migración 001: Usuarios y Autenticación
-- Fecha: 2025-08-22
-- Descripción: Tabla usuarios con roles (admin/coach) y planes (2/3/5 equipos)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla usuarios con roles y planes
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'coach')),
  plan VARCHAR(15) NOT NULL CHECK (plan IN ('2_teams', '3_teams', '5_teams')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  club_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_plan ON users(plan);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at en usuarios
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario admin de prueba
INSERT INTO users (
    email, password_hash, role, plan, first_name, last_name, club_name
) VALUES (
    'admin@hockey.com', 
    '$2b$12$dummy.hash.for.testing', 
    'admin', 
    '5_teams', 
    'Admin', 
    'Sistema',
    'Sistema Hockey'
);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema con roles y planes de suscripción';
COMMENT ON COLUMN users.role IS 'Rol: admin (acceso total) o coach (solo sus equipos)';
COMMENT ON COLUMN users.plan IS 'Plan: 2_teams, 3_teams o 5_teams según límite de equipos';
