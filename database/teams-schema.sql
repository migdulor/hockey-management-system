-- � Hockey Management System - Esquema adicional para equipos y jugadores
-- Extensión del schema existente

-- Tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES users(id),
    season VARCHAR(50) DEFAULT '2025',
    category VARCHAR(50), -- juvenil, senior, etc.
    division VARCHAR(50), -- primera, segunda, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    jersey_number INTEGER,
    position VARCHAR(50) CHECK (position IN ('forward', 'defense', 'goalie', 'center', 'wing')),
    date_of_birth DATE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, jersey_number)
);

-- Tabla de entrenamientos
CREATE TABLE IF NOT EXISTS trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    training_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    is_cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencias a entrenamientos
CREATE TABLE IF NOT EXISTS training_attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('present', 'absent', 'excused', 'pending')),
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    marked_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(training_id, player_id)
);

-- Tabla de temporadas (ya existente, pero agregar si no existe)
CREATE TABLE IF NOT EXISTS seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_teams_coach ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_trainings_team ON trainings(team_id);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(training_date);
CREATE INDEX IF NOT EXISTS idx_attendance_training ON training_attendances(training_id);
CREATE INDEX IF NOT EXISTS idx_attendance_player ON training_attendances(player_id);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo
-- Temporada actual
INSERT INTO seasons (name, start_date, end_date, is_active)
VALUES ('Temporada 2025', '2025-01-01', '2025-12-31', true)
ON CONFLICT DO NOTHING;

-- Equipo de ejemplo (configurar manualmente con email válido)
-- INSERT INTO teams (name, description, coach_id, category, division)
-- VALUES (
--     'Mi Equipo',
--     'Descripción del equipo',
--     (SELECT id FROM users WHERE email = 'tu_email@aqui.com' LIMIT 1),
--     'Senior',
--     'Primera División'
-- ) ON CONFLICT DO NOTHING;

-- Jugadores de ejemplo
INSERT INTO players (team_id, first_name, last_name, jersey_number, position, email, phone)
SELECT 
    t.id,
    'Carlos',
    'Delantero',
    10,
    'forward',
    'carlos@hockey.com',
    '+1234567890'
FROM teams t WHERE t.name = 'Hockey Stars'
ON CONFLICT DO NOTHING;

INSERT INTO players (team_id, first_name, last_name, jersey_number, position, email, phone)
SELECT 
    t.id,
    'Ana',
    'Defensora',
    5,
    'defense',
    'ana@hockey.com',
    '+1234567891'
FROM teams t WHERE t.name = 'Hockey Stars'
ON CONFLICT DO NOTHING;

INSERT INTO players (team_id, first_name, last_name, jersey_number, position, email, phone)
SELECT 
    t.id,
    'Pedro',
    'Portero',
    1,
    'goalie',
    'pedro@hockey.com',
    '+1234567892'
FROM teams t WHERE t.name = 'Hockey Stars'
ON CONFLICT DO NOTHING;

-- Entrenamiento de ejemplo
INSERT INTO trainings (team_id, name, training_date, start_time, end_time, location, created_by)
SELECT 
    t.id,
--     'Entrenamiento Técnico',
--     CURRENT_DATE + INTERVAL '1 day',
--     '19:00',
--     '21:00',
--     'Pista Principal',
--     (SELECT id FROM users WHERE email = 'tu_email@aqui.com' LIMIT 1)
-- FROM teams t WHERE t.name = 'Mi Equipo'
-- ON CONFLICT DO NOTHING;

SELECT 'Schema actualizado exitosamente! ✅' as status;
