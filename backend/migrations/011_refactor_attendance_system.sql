-- Migración 011: Refactoring Sistema de Asistencias
-- Fecha: 2025-08-26
-- Descripción: Eliminar attendances vinculadas a partidos y crear sistema de entrenamientos

-- PASO 1: Eliminar tabla actual y sus dependencias
DROP TABLE IF EXISTS attendances CASCADE;

-- PASO 2: Crear tabla de sesiones de entrenamiento
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- ej: "Entrenamiento Técnico", "Preparación vs Rival X"
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(100),
  duration_minutes INTEGER DEFAULT 90, -- Duración típica en minutos
  type VARCHAR(20) DEFAULT 'regular' CHECK (type IN ('regular', 'tactical', 'physical', 'recovery')),
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  weather_conditions VARCHAR(50), -- Para entrenamientos al aire libre
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 3: Crear tabla de asistencias a entrenamientos (según US005)
CREATE TABLE training_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  
  -- Estados específicos según US005: "Presente", "Tarde", "Ausente"
  status VARCHAR(10) NOT NULL CHECK (status IN ('presente', 'tarde', 'ausente')),
  
  -- Campos adicionales para control detallado
  arrival_time TIME, -- Hora real de llegada (para casos "tarde")
  departure_time TIME, -- Hora de salida (si se va antes)
  excuse_reason VARCHAR(200), -- Motivo de ausencia o tardanza
  
  -- Métricas de participación
  participation_level INTEGER CHECK (participation_level BETWEEN 1 AND 5), -- 1-5 nivel de participación
  performance_notes TEXT, -- Observaciones del entrenador sobre rendimiento
  
  -- Control administrativo
  marked_by VARCHAR(50) DEFAULT 'coach', -- Quién marcó la asistencia
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: Una sola asistencia por jugadora por entrenamiento
  UNIQUE(player_id, training_session_id)
);

-- PASO 4: Índices para optimizar consultas frecuentes
CREATE INDEX idx_training_sessions_team_date ON training_sessions(team_id, date DESC);
CREATE INDEX idx_training_sessions_date ON training_sessions(date DESC);
CREATE INDEX idx_training_sessions_active ON training_sessions(is_cancelled, date);

CREATE INDEX idx_training_attendances_session ON training_attendances(training_session_id);
CREATE INDEX idx_training_attendances_player ON training_attendances(player_id);
CREATE INDEX idx_training_attendances_status ON training_attendances(status);
CREATE INDEX idx_training_attendances_player_status ON training_attendances(player_id, status);

-- PASO 5: Triggers para updated_at
CREATE TRIGGER update_training_sessions_updated_at 
    BEFORE UPDATE ON training_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_attendances_updated_at 
    BEFORE UPDATE ON training_attendances
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- PASO 6: Función para obtener estadísticas de asistencia por jugadora
CREATE OR REPLACE FUNCTION get_player_attendance_stats(
    target_player_id UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) RETURNS TABLE (
    total_trainings INTEGER,
    present_count INTEGER,
    late_count INTEGER,
    absent_count INTEGER,
    attendance_percentage DECIMAL(5,2),
    punctuality_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH training_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN ta.status = 'presente' THEN 1 END) as presente,
            COUNT(CASE WHEN ta.status = 'tarde' THEN 1 END) as tarde,
            COUNT(CASE WHEN ta.status = 'ausente' THEN 1 END) as ausente
        FROM training_sessions ts
        LEFT JOIN training_attendances ta ON ts.id = ta.training_session_id 
            AND ta.player_id = target_player_id
        JOIN team_players tp ON ts.team_id = tp.team_id 
            AND tp.player_id = target_player_id
        WHERE ts.is_cancelled = false
            AND (start_date IS NULL OR ts.date >= start_date)
            AND (end_date IS NULL OR ts.date <= end_date)
    )
    SELECT 
        total::INTEGER,
        presente::INTEGER,
        tarde::INTEGER,
        ausente::INTEGER,
        CASE 
            WHEN total > 0 THEN ROUND((presente + tarde) * 100.0 / total, 2)
            ELSE 0.00
        END as attendance_percentage,
        CASE 
            WHEN (presente + tarde) > 0 THEN ROUND(presente * 100.0 / (presente + tarde), 2)
            ELSE 0.00
        END as punctuality_percentage
    FROM training_stats;
END;
$$ LANGUAGE plpgsql;

-- PASO 7: Función para obtener resumen de asistencia por entrenamiento
CREATE OR REPLACE FUNCTION get_training_attendance_summary(training_session_id UUID)
RETURNS TABLE (
    total_players INTEGER,
    present_count INTEGER,
    late_count INTEGER,
    absent_count INTEGER,
    attendance_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH session_stats AS (
        SELECT 
            COUNT(tp.player_id) as total,
            COUNT(CASE WHEN ta.status = 'presente' THEN 1 END) as presente,
            COUNT(CASE WHEN ta.status = 'tarde' THEN 1 END) as tarde,
            COUNT(CASE WHEN ta.status = 'ausente' THEN 1 END) as ausente
        FROM training_sessions ts
        JOIN team_players tp ON ts.team_id = tp.team_id AND tp.is_active = true
        LEFT JOIN training_attendances ta ON ts.id = ta.training_session_id 
            AND tp.player_id = ta.player_id
        WHERE ts.id = training_session_id
        GROUP BY ts.id
    )
    SELECT 
        total::INTEGER,
        presente::INTEGER,
        tarde::INTEGER,
        ausente::INTEGER,
        CASE 
            WHEN total > 0 THEN ROUND((presente + tarde) * 100.0 / total, 2)
            ELSE 0.00
        END as attendance_rate
    FROM session_stats;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Vista para facilitar consultas de asistencias con información completa
CREATE VIEW v_training_attendance_details AS
SELECT 
    ta.id,
    ta.training_session_id,
    ta.player_id,
    p.name as player_name,
    ta.status,
    ta.arrival_time,
    ta.departure_time,
    ta.excuse_reason,
    ta.participation_level,
    ta.performance_notes,
    ts.name as training_name,
    ts.date as training_date,
    ts.time as training_time,
    ts.location,
    ts.type as training_type,
    t.name as team_name,
    ta.created_at,
    ta.updated_at
FROM training_attendances ta
JOIN players p ON ta.player_id = p.id
JOIN training_sessions ts ON ta.training_session_id = ts.id
JOIN teams t ON ts.team_id = t.id;

-- PASO 9: Datos de ejemplo para testing
INSERT INTO training_sessions (team_id, name, date, time, location, type) 
SELECT 
    t.id, 
    'Entrenamiento Técnico', 
    CURRENT_DATE + INTERVAL '1 day',
    '18:00'::TIME,
    'Campo Principal',
    'tactical'
FROM teams t 
LIMIT 1;
