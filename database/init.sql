-- 🏒 Hockey Management System Database Schema
-- Inicialización de tablas para Vercel Postgres

-- Extension para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'coach' CHECK (role IN ('admin', 'coach', 'player', 'manager')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coach_id INTEGER REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    team_id INTEGER REFERENCES teams(id),
    jersey_number INTEGER,
    position VARCHAR(20) CHECK (position IN ('forward', 'defense', 'goalie')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, jersey_number)
);

-- Tabla de temporadas
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de juegos
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    season_id INTEGER REFERENCES seasons(id),
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'finished', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estadísticas de jugadores por juego
CREATE TABLE IF NOT EXISTS player_game_stats (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    player_id INTEGER REFERENCES players(id),
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    penalty_minutes INTEGER DEFAULT 0,
    plus_minus INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, away_team_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a las tablas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario administrador inicial
-- Contraseña: admin123 (hasheada con bcrypt, salt rounds 12)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES (
    'admin@hockey.com',
    '$2b$12$BnmGQ/jM3DawhQB/IqLPfeVKeblgfpZb7l3dqxocZ24MfBFJ8nZBW',
    'Admin',
    'Sistema',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuario coach de prueba
-- Contraseña: coach123 (hasheada con bcrypt, salt rounds 12)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES (
    'coach@hockey.com',
    '$2b$12$Y/29TPEIfyadAYGm6tgVu.vlSpIYQZf1xTEJpBqmpdeCX2oNmfjsm',
    'Coach',
    'Demo',
    'coach'
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuario test
-- Contraseña: test123 (hasheada con bcrypt, salt rounds 12)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES (
    'test@hockey.com',
    '$2b$12$gVq0MWZrUVaHSPArLXxYVu8gJXU6UA9CUflT1LnzEIJrNLmTmWvWW',
    'Test',
    'User',
    'coach'
) ON CONFLICT (email) DO NOTHING;

-- Insertar temporada actual
INSERT INTO seasons (name, start_date, end_date, active)
VALUES (
    '2025 Season',
    '2025-09-01',
    '2026-04-30',
    true
) ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
SELECT 'Database initialized successfully! ✅' as status;
