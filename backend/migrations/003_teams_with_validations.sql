-- Migración 003: Equipos con Validaciones
-- Fecha: 2025-08-22
-- Descripción: Equipos con validación de límites por plan de usuario

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  club_name VARCHAR(100) NOT NULL,
  division_id UUID NOT NULL REFERENCES divisions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  max_players INTEGER DEFAULT 20 CHECK (max_players <= 20 AND max_players > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar límite de equipos según plan del usuario
CREATE OR REPLACE FUNCTION validate_team_limit_by_plan()
RETURNS TRIGGER AS $$
DECLARE
    user_plan VARCHAR(15);
    current_team_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Obtener plan del usuario
    SELECT plan INTO user_plan FROM users WHERE id = NEW.user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found with id: %', NEW.user_id;
    END IF;
    
    -- Contar equipos actuales del usuario (solo activos)
    SELECT COUNT(*) INTO current_team_count 
    FROM teams 
    WHERE user_id = NEW.user_id AND is_active = true;
    
    -- Determinar límite según plan
    max_allowed := CASE 
        WHEN user_plan = '2_teams' THEN 2
        WHEN user_plan = '3_teams' THEN 3
        WHEN user_plan = '5_teams' THEN 5
        ELSE 2 -- Default conservador
    END;
    
    -- Validar límite (si es INSERT, sumar 1 al conteo)
    IF TG_OP = 'INSERT' THEN
        IF current_team_count >= max_allowed THEN
            RAISE EXCEPTION 'User plan % allows maximum % teams. Current active teams: %', 
                user_plan, max_allowed, current_team_count;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Si se está reactivando un equipo inactivo
        IF OLD.is_active = false AND NEW.is_active = true THEN
            IF current_team_count >= max_allowed THEN
                RAISE EXCEPTION 'User plan % allows maximum % teams. Current active teams: %', 
                    user_plan, max_allowed, current_team_count;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar límite de equipos en INSERT y UPDATE
CREATE TRIGGER validate_team_limit_trigger
    BEFORE INSERT OR UPDATE ON teams
    FOR EACH ROW 
    EXECUTE FUNCTION validate_team_limit_by_plan();

-- Índices para performance
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_division_id ON teams(division_id);
CREATE INDEX idx_teams_club_name ON teams(club_name);
CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_teams_user_active ON teams(user_id, is_active);

-- Vista para equipos con información de división
CREATE VIEW teams_with_division AS
SELECT 
    t.id,
    t.name,
    t.club_name,
    t.max_players,
    t.is_active,
    t.created_at,
    d.name as division_name,
    d.gender as division_gender,
    d.allows_shootout,
    u.email as owner_email,
    u.first_name || ' ' || u.last_name as owner_name
FROM teams t
JOIN divisions d ON t.division_id = d.id
JOIN users u ON t.user_id = u.id;

-- Comentarios para documentación
COMMENT ON TABLE teams IS 'Equipos con validación de límites por plan de usuario';
COMMENT ON COLUMN teams.max_players IS 'Máximo 20 jugadoras por equipo (11 titulares + 9 suplentes)';
COMMENT ON TRIGGER validate_team_limit_trigger ON teams IS 'Valida que el usuario no exceda el límite de equipos según su plan';
