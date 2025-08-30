-- 🏑 Hockey Management System
-- Script de inicialización de base de datos
-- FASE 1B + FASE 1C: Autenticación + Equipos

-- Eliminar tablas si existen (para reiniciar)
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabla de usuarios (FASE 1B)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'coach' CHECK (role IN ('admin', 'coach')),
    club_name VARCHAR(255),
    plan VARCHAR(50) DEFAULT '2_teams' CHECK (plan IN ('2_teams', '3_teams', '5_teams')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de divisiones (FASE 1C)
CREATE TABLE divisions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    allows_shootouts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de equipos (FASE 1C)
CREATE TABLE teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division_id VARCHAR(50) REFERENCES divisions(id),
    user_id VARCHAR(50) REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    max_players INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de jugadores en equipos (preparación para futuras fases)
CREATE TABLE team_players (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) REFERENCES teams(id),
    player_id VARCHAR(50), -- Por ahora solo ID, luego referencia a players
    position VARCHAR(50),
    jersey_number INTEGER,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_division_id ON teams(division_id);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);

-- Insertar usuario administrador por defecto
INSERT INTO users (id, email, password, name, role, club_name, plan, is_active) VALUES 
('admin_001', 'migdulor@hotmail.com', 'admin123', 'Miguel Duque', 'admin', 'Admin Club', '5_teams', true);

-- Insertar divisiones por defecto
INSERT INTO divisions (id, name, gender, min_age, max_age, allows_shootouts) VALUES 
('div_sub14_f', 'Sub14 Femenino', 'female', 10, 14, true),
('div_sub16_f', 'Sub16 Femenino', 'female', 14, 16, true),
('div_sub18_f', 'Sub18 Femenino', 'female', 16, 18, true),
('div_primera_f', 'Primera Femenino', 'female', 18, 50, true),
('div_sub14_m', 'Sub14 Masculino', 'male', 10, 14, true),
('div_sub16_m', 'Sub16 Masculino', 'male', 14, 16, true),
('div_sub18_m', 'Sub18 Masculino', 'male', 16, 18, true),
('div_primera_m', 'Primera Masculino', 'male', 18, 50, true);

-- Insertar algunos equipos de ejemplo
INSERT INTO teams (id, name, division_id, user_id, active) VALUES 
('team_demo_001', 'Equipo Demo Femenino', 'div_primera_f', 'admin_001', true),
('team_demo_002', 'Equipo Demo Masculino', 'div_primera_m', 'admin_001', true);

COMMIT;
