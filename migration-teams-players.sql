-- Migración: Crear tablas de equipos y jugadores
-- Fecha: 2025-09-01

-- Crear tabla teams si no existe
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20), -- 'femenino' o 'masculino'
    division VARCHAR(20), -- 'sub-14', 'sub-16', 'sub-19', 'inter', 'primera'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla players si no existe
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    jersey_number INTEGER,
    position VARCHAR(30), -- 'Arquera', 'Defensora', 'Volante', 'Delantera'
    date_of_birth DATE,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: jersey number único por equipo
    UNIQUE(team_id, jersey_number)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_jersey ON players(team_id, jersey_number);

-- Verificar que existe la tabla users (debería existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabla users no existe. Debe ejecutar primero la migración de usuarios.';
    END IF;
END $$;
