-- Migración 004: Jugadoras con Controles
-- Fecha: 2025-08-22
-- Descripción: Jugadoras con validaciones de división y límites por equipo/club

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  birth_date DATE NOT NULL,
  position VARCHAR(50),
  photo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla relación muchos a muchos jugadoras-equipos
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_starter BOOLEAN DEFAULT false,
  jersey_number INTEGER CHECK (jersey_number BETWEEN 1 AND 99),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(team_id, player_id),
  UNIQUE(team_id, jersey_number)
);

-- Trigger updated_at para players
CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON players
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función validar máximo 20 jugadoras por equipo
CREATE OR REPLACE FUNCTION validate_max_players_per_team()
RETURNS TRIGGER AS $$
DECLARE
    current_player_count INTEGER;
    team_max_players INTEGER;
BEGIN
    -- Obtener límite del equipo
    SELECT max_players INTO team_max_players 
    FROM teams 
    WHERE id = NEW.team_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found with id: %', NEW.team_id;
    END IF;
    
    -- Contar jugadoras activas actuales
    SELECT COUNT(*) INTO current_player_count 
    FROM team_players 
    WHERE team_id = NEW.team_id AND is_active = true;
    
    -- Validar límite
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true) THEN
        IF current_player_count >= team_max_players THEN
            RAISE EXCEPTION 'Team already has maximum % active players', team_max_players;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar máximo jugadoras por equipo
CREATE TRIGGER validate_max_players_trigger
    BEFORE INSERT OR UPDATE ON team_players
    FOR EACH ROW 
    EXECUTE FUNCTION validate_max_players_per_team();

-- Función validar máximo 2 divisiones por club por jugadora
CREATE OR REPLACE FUNCTION validate_max_divisions_per_club()
RETURNS TRIGGER AS $$
DECLARE
    club_division_count INTEGER;
    new_team_club VARCHAR(100);
    new_team_division UUID;
BEGIN
    -- Obtener club y división del nuevo equipo
    SELECT club_name, division_id 
    INTO new_team_club, new_team_division
    FROM teams 
    WHERE id = NEW.team_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found with id: %', NEW.team_id;
    END IF;
    
    -- Contar divisiones distintas actuales de la jugadora en este club
    SELECT COUNT(DISTINCT t.division_id) INTO club_division_count
    FROM team_players tp
    JOIN teams t ON tp.team_id = t.id
    WHERE tp.player_id = NEW.player_id 
    AND t.club_name = new_team_club
    AND tp.is_active = true
    AND t.is_active = true;
    
    -- Si es INSERT o reactivación, verificar si ya tiene la división
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true) THEN
        -- Verificar si ya tiene esta división en el club
        SELECT COUNT(*) INTO club_division_count
        FROM team_players tp
        JOIN teams t ON tp.team_id = t.id
        WHERE tp.player_id = NEW.player_id 
        AND t.club_name = new_team_club
        AND t.division_id = new_team_division
        AND tp.is_active = true
        AND t.is_active = true;
        
        -- Si no tiene esta división, contar divisiones totales
        IF club_division_count = 0 THEN
            SELECT COUNT(DISTINCT t.division_id) INTO club_division_count
            FROM team_players tp
            JOIN teams t ON tp.team_id = t.id
            WHERE tp.player_id = NEW.player_id 
            AND t.club_name = new_team_club
            AND tp.is_active = true
            AND t.is_active = true;
            
            -- Validar máximo 2 divisiones por club
            IF club_division_count >= 2 THEN
                RAISE EXCEPTION 'Player can only participate in maximum 2 divisions per club. Current divisions in %: %', 
                    new_team_club, club_division_count;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar divisiones por club
CREATE TRIGGER validate_divisions_per_club_trigger
    BEFORE INSERT OR UPDATE ON team_players
    FOR EACH ROW 
    EXECUTE FUNCTION validate_max_divisions_per_club();

-- Función validar edad de jugadora para división del equipo
CREATE OR REPLACE FUNCTION validate_player_age_for_team_division()
RETURNS TRIGGER AS $$
DECLARE
    team_division_id UUID;
    player_birth_date DATE;
    is_valid_age BOOLEAN;
BEGIN
    -- Obtener división del equipo
    SELECT division_id INTO team_division_id
    FROM teams 
    WHERE id = NEW.team_id;
    
    -- Obtener fecha nacimiento jugadora
    SELECT birth_date INTO player_birth_date
    FROM players
    WHERE id = NEW.player_id;
    
    -- Validar edad usando función de divisiones
    SELECT validate_birth_date_for_division(player_birth_date, team_division_id) 
    INTO is_valid_age;
    
    IF NOT is_valid_age THEN
        RAISE EXCEPTION 'Player birth date % is not valid for team division', player_birth_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar edad por división
CREATE TRIGGER validate_player_age_trigger
    BEFORE INSERT OR UPDATE ON team_players
    FOR EACH ROW 
    EXECUTE FUNCTION validate_player_age_for_team_division();

-- Índices para performance
CREATE INDEX idx_players_birth_date ON players(birth_date);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);
CREATE INDEX idx_team_players_active ON team_players(is_active);
CREATE INDEX idx_team_players_team_active ON team_players(team_id, is_active);

-- Vista para jugadoras con información de equipos
CREATE VIEW players_with_teams AS
SELECT 
    p.id,
    p.name,
    p.nickname,
    p.birth_date,
    p.position,
    p.photo_url,
    t.name as team_name,
    t.club_name,
    d.name as division_name,
    d.gender as division_gender,
    tp.is_starter,
    tp.jersey_number,
    tp.joined_at
FROM players p
JOIN team_players tp ON p.id = tp.player_id
JOIN teams t ON tp.team_id = t.id
JOIN divisions d ON t.division_id = d.id
WHERE p.is_active = true 
AND tp.is_active = true 
AND t.is_active = true;

-- Comentarios para documentación
COMMENT ON TABLE players IS 'Jugadoras de hockey con validaciones de edad y división';
COMMENT ON TABLE team_players IS 'Relación jugadoras-equipos con validaciones: max 20 por equipo, max 2 divisiones por club';
COMMENT ON TRIGGER validate_max_players_trigger ON team_players IS 'Valida máximo 20 jugadoras por equipo';
COMMENT ON TRIGGER validate_divisions_per_club_trigger ON team_players IS 'Valida máximo 2 divisiones por club por jugadora';
COMMENT ON TRIGGER validate_player_age_trigger ON team_players IS 'Valida que la edad de la jugadora sea válida para la división del equipo';
