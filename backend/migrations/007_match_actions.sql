-- Migración 007: Acciones de Partido  
-- Fecha: 2025-08-22
-- Descripción: Registro de acciones durante partidos con validaciones de zona y área rival

CREATE TABLE match_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id), -- Null para acciones sin jugadora específica
  action_type_id UUID NOT NULL REFERENCES action_types(id),
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  minute_in_quarter INTEGER NOT NULL CHECK (minute_in_quarter BETWEEN 0 AND 15),
  second_in_quarter INTEGER DEFAULT 0 CHECK (second_in_quarter BETWEEN 0 AND 59),
  zone INTEGER CHECK (zone BETWEEN 1 AND 4), -- 4 zonas confirmadas del PDF
  rival_area_sector VARCHAR(1) CHECK (rival_area_sector IN ('L', 'C', 'R')), -- 3 sectores área rival
  substitute_player_out_id UUID REFERENCES players(id), -- Para cambios: jugadora que sale
  substitute_player_in_id UUID REFERENCES players(id),  -- Para cambios: jugadora que entra
  observations TEXT,
  synced BOOLEAN DEFAULT false, -- Para control offline
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función validar datos requeridos por tipo de acción
CREATE OR REPLACE FUNCTION validate_action_requirements()
RETURNS TRIGGER AS $$
DECLARE
    action_rec RECORD;
    action_name VARCHAR(50);
BEGIN
    -- Obtener requisitos del tipo de acción
    SELECT name, requires_zone, requires_player, requires_rival_area 
    INTO action_rec
    FROM action_types 
    WHERE id = NEW.action_type_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Action type not found';
    END IF;
    
    action_name := action_rec.name;
    
    -- Validar zona si es requerida
    IF action_rec.requires_zone AND NEW.zone IS NULL THEN
        RAISE EXCEPTION 'Action type "%" requires zone specification (1-4)', action_name;
    END IF;
    
    -- Validar jugadora si es requerida
    IF action_rec.requires_player AND NEW.player_id IS NULL THEN
        RAISE EXCEPTION 'Action type "%" requires player specification', action_name;
    END IF;
    
    -- Validar área rival si es requerida
    IF action_rec.requires_rival_area AND NEW.rival_area_sector IS NULL THEN
        RAISE EXCEPTION 'Action type "%" requires rival area sector (L, C, R)', action_name;
    END IF;
    
    -- Validaciones específicas por tipo de acción
    CASE action_name
        WHEN 'Cambio' THEN
            -- Cambio requiere jugadora que sale y jugadora que entra
            IF NEW.substitute_player_out_id IS NULL OR NEW.substitute_player_in_id IS NULL THEN
                RAISE EXCEPTION 'Substitution requires both out and in players';
            END IF;
            
            -- No puede ser la misma jugadora
            IF NEW.substitute_player_out_id = NEW.substitute_player_in_id THEN
                RAISE EXCEPTION 'Cannot substitute player with herself';
            END IF;
            
        WHEN 'Gol' THEN
            -- Gol debe tener zona y área rival
            IF NEW.zone IS NULL OR NEW.rival_area_sector IS NULL THEN
                RAISE EXCEPTION 'Goal requires both zone and rival area sector';
            END IF;
            
        WHEN 'Penal' THEN
            -- Penal requiere área rival pero no zona específica
            IF NEW.rival_area_sector IS NULL THEN
                RAISE EXCEPTION 'Penalty requires rival area sector';
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar requisitos de acción
CREATE TRIGGER validate_action_requirements_trigger
    BEFORE INSERT ON match_actions
    FOR EACH ROW 
    EXECUTE FUNCTION validate_action_requirements();

-- Función para validar que jugadora no esté sancionada
CREATE OR REPLACE FUNCTION validate_player_not_sanctioned()
RETURNS TRIGGER AS $$
DECLARE
    can_play BOOLEAN;
    action_name VARCHAR(50);
BEGIN
    -- Solo validar si hay jugadora especificada
    IF NEW.player_id IS NOT NULL THEN
        -- Verificar si puede realizar acción
        SELECT player_can_perform_action(
            NEW.player_id, 
            NEW.match_id, 
            NEW.quarter, 
            NEW.minute_in_quarter, 
            NEW.second_in_quarter
        ) INTO can_play;
        
        IF NOT can_play THEN
            SELECT name INTO action_name FROM action_types WHERE id = NEW.action_type_id;
            RAISE EXCEPTION 'Player is sanctioned and cannot perform action "%"', action_name;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar jugadora no sancionada
CREATE TRIGGER validate_player_sanctioned_trigger
    BEFORE INSERT ON match_actions
    FOR EACH ROW 
    EXECUTE FUNCTION validate_player_not_sanctioned();

-- Función para crear sanción automática por tarjetas
CREATE OR REPLACE FUNCTION create_sanction_for_card()
RETURNS TRIGGER AS $$
DECLARE
    action_name VARCHAR(50);
    sanction_type VARCHAR(20);
BEGIN
    -- Obtener nombre de la acción
    SELECT name INTO action_name FROM action_types WHERE id = NEW.action_type_id;
    
    -- Crear sanción si es tarjeta
    IF action_name IN ('Tarjeta Verde', 'Tarjeta Amarilla', 'Tarjeta Roja') THEN
        sanction_type := CASE action_name
            WHEN 'Tarjeta Verde' THEN 'green'
            WHEN 'Tarjeta Amarilla' THEN 'yellow'
            WHEN 'Tarjeta Roja' THEN 'red'
        END;
        
        INSERT INTO sanctions (
            player_id,
            match_id, 
            sanction_type,
            start_quarter,
            start_minute,
            start_second,
            minutes_duration -- Se calcula automáticamente por trigger
        ) VALUES (
            NEW.player_id,
            NEW.match_id,
            sanction_type,
            NEW.quarter,
            NEW.minute_in_quarter,
            NEW.second_in_quarter,
            0 -- Se establece por trigger
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear sanciones automáticas
CREATE TRIGGER create_sanction_trigger
    AFTER INSERT ON match_actions
    FOR EACH ROW 
    EXECUTE FUNCTION create_sanction_for_card();

-- Índices para performance
CREATE INDEX idx_match_actions_match_id ON match_actions(match_id);
CREATE INDEX idx_match_actions_player_id ON match_actions(player_id);
CREATE INDEX idx_match_actions_type ON match_actions(action_type_id);
CREATE INDEX idx_match_actions_quarter ON match_actions(quarter);
CREATE INDEX idx_match_actions_zone ON match_actions(zone);
CREATE INDEX idx_match_actions_rival_area ON match_actions(rival_area_sector);
CREATE INDEX idx_match_actions_synced ON match_actions(synced);
CREATE INDEX idx_match_actions_time ON match_actions(quarter, minute_in_quarter, second_in_quarter);

-- Vista para acciones completas con información contextual
CREATE VIEW match_actions_complete AS
SELECT 
    ma.id,
    ma.quarter,
    ma.minute_in_quarter,
    ma.second_in_quarter,
    ma.zone,
    ma.rival_area_sector,
    ma.observations,
    ma.synced,
    ma.created_at,
    at.name as action_name,
    at.icon as action_icon,
    at.color as action_color,
    p.name as player_name,
    p.nickname as player_nickname,
    po.name as substitute_out_name,
    pi.name as substitute_in_name,
    m.rival_team,
    m.match_date,
    t.name as team_name,
    t.club_name
FROM match_actions ma
JOIN action_types at ON ma.action_type_id = at.id
JOIN matches m ON ma.match_id = m.id
JOIN teams t ON m.team_id = t.id
LEFT JOIN players p ON ma.player_id = p.id
LEFT JOIN players po ON ma.substitute_player_out_id = po.id  
LEFT JOIN players pi ON ma.substitute_player_in_id = pi.id;

-- Vista para estadísticas por zona
CREATE VIEW zone_statistics AS
SELECT 
    ma.match_id,
    ma.zone,
    at.name as action_type,
    COUNT(*) as action_count,
    m.rival_team,
    m.match_date,
    t.name as team_name
FROM match_actions ma
JOIN action_types at ON ma.action_type_id = at.id
JOIN matches m ON ma.match_id = m.id
JOIN teams t ON m.team_id = t.id
WHERE ma.zone IS NOT NULL
GROUP BY ma.match_id, ma.zone, at.name, m.rival_team, m.match_date, t.name
ORDER BY ma.match_id, ma.zone, action_count DESC;

-- Vista para estadísticas área rival
CREATE VIEW rival_area_statistics AS
SELECT 
    ma.match_id,
    ma.rival_area_sector,
    at.name as action_type,
    COUNT(*) as action_count,
    m.rival_team,
    m.match_date,
    t.name as team_name
FROM match_actions ma
JOIN action_types at ON ma.action_type_id = at.id
JOIN matches m ON ma.match_id = m.id
JOIN teams t ON m.team_id = t.id
WHERE ma.rival_area_sector IS NOT NULL
GROUP BY ma.match_id, ma.rival_area_sector, at.name, m.rival_team, m.match_date, t.name
ORDER BY ma.match_id, ma.rival_area_sector, action_count DESC;

-- Comentarios para documentación
COMMENT ON TABLE match_actions IS 'Registro de acciones durante partidos con validaciones automáticas';
COMMENT ON COLUMN match_actions.zone IS '1-4: Zona de cancha donde ocurrió la acción';
COMMENT ON COLUMN match_actions.rival_area_sector IS 'L/C/R: Sector área rival para goles y penales';
COMMENT ON COLUMN match_actions.substitute_player_out_id IS 'Para cambios: jugadora que sale de cancha';
COMMENT ON COLUMN match_actions.substitute_player_in_id IS 'Para cambios: jugadora que entra a cancha';
COMMENT ON TRIGGER validate_action_requirements_trigger ON match_actions IS 'Valida que la acción tenga los datos requeridos según su tipo';
COMMENT ON TRIGGER create_sanction_trigger ON match_actions IS 'Crea sanción automáticamente para tarjetas verde/amarilla/roja';
