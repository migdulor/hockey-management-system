-- Migración para agregar campos de imagen a equipos y jugadores

-- Agregar campo de foto de camiseta a la tabla teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_jersey_photo TEXT;

-- Agregar campo de foto a la tabla players  
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_photo TEXT;

-- Crear índices para mejorar consultas si hay muchas imágenes
CREATE INDEX IF NOT EXISTS idx_teams_has_jersey_photo ON teams(team_jersey_photo) WHERE team_jersey_photo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_has_photo ON players(player_photo) WHERE player_photo IS NOT NULL;

-- Comentarios sobre el uso
COMMENT ON COLUMN teams.team_jersey_photo IS 'Base64 encoded image of team jersey, used as default when player has no photo';
COMMENT ON COLUMN players.player_photo IS 'Base64 encoded profile photo of the player';
