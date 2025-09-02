-- Eliminar la columna is_starter de la tabla team_players
-- La titularidad ahora será manejada por formación de partido, no como propiedad fija del jugador

-- Verificar la estructura actual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'team_players' 
AND column_name = 'is_starter';

-- Eliminar la columna is_starter
ALTER TABLE team_players DROP COLUMN IF EXISTS is_starter;

-- Verificar que se eliminó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'team_players' 
ORDER BY ordinal_position;
