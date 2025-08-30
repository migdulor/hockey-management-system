-- Migración 006: Partidos con Control Temporal
-- Fecha: 2025-08-22
-- Descripción: Partidos con cronómetro 4 cuartos y control tiempo jugado

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  rival_team VARCHAR(100) NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME,
  field_name VARCHAR(100),
  current_quarter INTEGER DEFAULT 1 CHECK (current_quarter BETWEEN 1 AND 4),
  quarter_start_time TIMESTAMP,
  is_paused BOOLEAN DEFAULT true, -- Inicia pausado
  total_time_seconds INTEGER DEFAULT 0,
  quarter_1_seconds INTEGER DEFAULT 0,
  quarter_2_seconds INTEGER DEFAULT 0, 
  quarter_3_seconds INTEGER DEFAULT 0,
  quarter_4_seconds INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT false,
  final_score_home INTEGER DEFAULT 0,
  final_score_away INTEGER DEFAULT 0,
  had_shootout BOOLEAN DEFAULT false,
  shootout_score_home INTEGER DEFAULT 0,
  shootout_score_away INTEGER DEFAULT 0,
  observations TEXT,
  synced BOOLEAN DEFAULT false, -- Para control offline
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger updated_at para matches
CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabla para control tiempo jugado por jugadora por cuarto
CREATE TABLE match_player_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  entry_time INTEGER DEFAULT 0, -- Segundo de entrada al cuarto
  exit_time INTEGER, -- Segundo de salida (null = sigue jugando)
  total_seconds INTEGER DEFAULT 0,
  is_on_field BOOLEAN DEFAULT false, -- true = actualmente en cancha
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, player_id, quarter)
);

-- Función para validar shootout según división del equipo
CREATE OR REPLACE FUNCTION validate_shootout_for_division()
RETURNS TRIGGER AS $$
DECLARE
    division_allows_shootout BOOLEAN;
BEGIN
    -- Solo validar si el partido tuvo shootout
    IF NEW.had_shootout = true THEN
        -- Obtener si la división permite shootout
        SELECT d.allows_shootout 
        INTO division_allows_shootout
        FROM teams t
        JOIN divisions d ON t.division_id = d.id
        WHERE t.id = NEW.team_id;
        
        -- Validar que la división permita shootout
        IF NOT division_allows_shootout THEN
            RAISE EXCEPTION 'Division does not allow shootout. Had shootout must be false.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar shootout
CREATE TRIGGER validate_shootout_trigger
    BEFORE INSERT OR UPDATE ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION validate_shootout_for_division();

-- Función para calcular tiempo total automáticamente
CREATE OR REPLACE FUNCTION update_match_total_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_time_seconds := NEW.quarter_1_seconds + NEW.quarter_2_seconds + 
                             NEW.quarter_3_seconds + NEW.quarter_4_seconds;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular tiempo total
CREATE TRIGGER update_total_time_trigger
    BEFORE UPDATE ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION update_match_total_time();

-- Función para controlar entrada/salida de jugadoras
CREATE OR REPLACE FUNCTION manage_player_field_time()
RETURNS TRIGGER AS $$
DECLARE
    current_match_seconds INTEGER;
    current_quarter INTEGER;
    current_quarter_seconds INTEGER;
BEGIN
    -- Obtener estado actual del partido
    SELECT 
        CASE 
            WHEN current_quarter = 1 THEN quarter_1_seconds
            WHEN current_quarter = 2 THEN quarter_2_seconds
            WHEN current_quarter = 3 THEN quarter_3_seconds
            WHEN current_quarter = 4 THEN quarter_4_seconds
            ELSE 0
        END,
        current_quarter
    INTO current_quarter_seconds, current_quarter
    FROM matches 
    WHERE id = NEW.match_id;
    
    -- Si es INSERT (jugadora entra a cancha)
    IF TG_OP = 'INSERT' THEN
        NEW.entry_time := current_quarter_seconds;
        NEW.is_on_field := true;
        
    -- Si es UPDATE (jugadora sale de cancha)
    ELSIF TG_OP = 'UPDATE' AND OLD.is_on_field = true AND NEW.is_on_field = false THEN
        NEW.exit_time := current_quarter_seconds;
        NEW.total_seconds := NEW.total_seconds + (current_quarter_seconds - NEW.entry_time);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para controlar tiempo en cancha
CREATE TRIGGER manage_field_time_trigger
    BEFORE INSERT OR UPDATE ON match_player_time
    FOR EACH ROW 
    EXECUTE FUNCTION manage_player_field_time();

-- Agregar FK a sanctions que referenciaba matches
ALTER TABLE sanctions 
ADD CONSTRAINT fk_sanctions_match 
FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_finished ON matches(is_finished);
CREATE INDEX idx_matches_synced ON matches(synced);
CREATE INDEX idx_match_player_time_match ON match_player_time(match_id);
CREATE INDEX idx_match_player_time_player ON match_player_time(player_id);
CREATE INDEX idx_match_player_time_quarter ON match_player_time(quarter);
CREATE INDEX idx_match_player_time_on_field ON match_player_time(is_on_field);

-- Vista para partidos con información completa
CREATE VIEW matches_complete AS
SELECT 
    m.id,
    m.rival_team,
    m.match_date,
    m.match_time,
    m.field_name,
    m.current_quarter,
    m.is_paused,
    m.total_time_seconds,
    m.is_finished,
    m.final_score_home,
    m.final_score_away,
    m.had_shootout,
    m.shootout_score_home,
    m.shootout_score_away,
    t.name as team_name,
    t.club_name,
    d.name as division_name,
    d.allows_shootout as division_allows_shootout,
    u.first_name || ' ' || u.last_name as coach_name
FROM matches m
JOIN teams t ON m.team_id = t.id
JOIN divisions d ON t.division_id = d.id  
JOIN users u ON t.user_id = u.id;

-- Vista para tiempo jugado por jugadora
CREATE VIEW player_match_time_summary AS
SELECT 
    mpt.match_id,
    mpt.player_id,
    p.name as player_name,
    p.nickname,
    m.rival_team,
    m.match_date,
    SUM(mpt.total_seconds) as total_seconds_played,
    ROUND(SUM(mpt.total_seconds) / 60.0, 2) as total_minutes_played,
    COUNT(DISTINCT mpt.quarter) as quarters_played
FROM match_player_time mpt
JOIN players p ON mpt.player_id = p.id
JOIN matches m ON mpt.match_id = m.id
GROUP BY mpt.match_id, mpt.player_id, p.name, p.nickname, m.rival_team, m.match_date;

-- Comentarios para documentación
COMMENT ON TABLE matches IS 'Partidos con cronómetro 4 cuartos y validación shootout por división';
COMMENT ON TABLE match_player_time IS 'Control automático tiempo jugado por jugadora por cuarto';
COMMENT ON COLUMN matches.had_shootout IS 'Solo true si la división permite shootout (Sub14: false, resto: true)';
COMMENT ON COLUMN matches.current_quarter IS 'Cuarto actual (1-4), cada cuarto dura 15 minutos';
COMMENT ON COLUMN match_player_time.is_on_field IS 'true = jugadora actualmente en cancha en este cuarto';
