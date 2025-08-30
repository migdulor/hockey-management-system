-- Migración 009: Temporadas y Gestión Histórica
-- Fecha: 2025-08-26
-- Descripción: Sistema de temporadas para migración manual y cierre de períodos

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL, -- ej: "Temporada 2025", "Apertura 2025", etc.
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  is_closed BOOLEAN DEFAULT false,
  total_matches INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Trigger updated_at para seasons
CREATE TRIGGER update_seasons_updated_at 
    BEFORE UPDATE ON seasons
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar season_id a las tablas principales
ALTER TABLE teams ADD COLUMN season_id UUID REFERENCES seasons(id);
ALTER TABLE matches ADD COLUMN season_id UUID REFERENCES seasons(id);

-- Función para validar una sola temporada activa por usuario
CREATE OR REPLACE FUNCTION validate_single_active_season()
RETURNS TRIGGER AS $$
DECLARE
    active_season_count INTEGER;
BEGIN
    IF NEW.is_active = true THEN
        SELECT COUNT(*) INTO active_season_count 
        FROM seasons 
        WHERE user_id = NEW.user_id AND is_active = true AND id != NEW.id;
        
        IF active_season_count > 0 THEN
            RAISE EXCEPTION 'Un usuario solo puede tener una temporada activa. Cierre la temporada actual antes de crear una nueva.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar temporada única activa
CREATE TRIGGER validate_single_active_season_trigger
    BEFORE INSERT OR UPDATE ON seasons
    FOR EACH ROW 
    EXECUTE FUNCTION validate_single_active_season();

-- Tabla para resúmenes de temporada (para exportación)
CREATE TABLE season_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id),
  total_matches INTEGER DEFAULT 0,
  total_training_sessions INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  top_scorer_player_id UUID REFERENCES players(id),
  most_active_player_id UUID REFERENCES players(id),
  summary_data JSONB, -- Estadísticas adicionales en formato JSON
  exported_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para generar resumen automático al cerrar temporada
CREATE OR REPLACE FUNCTION generate_season_summary()
RETURNS TRIGGER AS $$
DECLARE
    match_count INTEGER;
    player_count INTEGER;
BEGIN
    IF NEW.is_closed = true AND OLD.is_closed = false THEN
        -- Contar partidos de la temporada
        SELECT COUNT(*) INTO match_count 
        FROM matches 
        WHERE season_id = NEW.id;
        
        -- Contar jugadores únicos de la temporada
        SELECT COUNT(DISTINCT tp.player_id) INTO player_count
        FROM team_players tp
        JOIN teams t ON tp.team_id = t.id
        WHERE t.season_id = NEW.id;
        
        -- Crear resumen automático
        INSERT INTO season_summaries (season_id, total_matches, total_players)
        VALUES (NEW.id, match_count, player_count);
        
        -- Actualizar totales en la temporada
        UPDATE seasons 
        SET total_matches = match_count, total_players = player_count
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar resumen automático
CREATE TRIGGER generate_season_summary_trigger
    AFTER UPDATE ON seasons
    FOR EACH ROW 
    EXECUTE FUNCTION generate_season_summary();

-- Índices para performance
CREATE INDEX idx_seasons_user_active ON seasons(user_id, is_active);
CREATE INDEX idx_seasons_closed ON seasons(is_closed);
CREATE INDEX idx_teams_season ON teams(season_id);
CREATE INDEX idx_matches_season ON matches(season_id);
