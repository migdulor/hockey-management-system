-- Agregar campo max_teams numérico a la tabla users
-- Este campo almacenará el número real de equipos permitidos (0-10)

ALTER TABLE users ADD COLUMN max_teams INTEGER DEFAULT 2;

-- Migrar datos existentes del campo plan al nuevo campo max_teams
UPDATE users SET max_teams = 
  CASE 
    WHEN plan = '1_teams' THEN 1
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3
    WHEN plan = '5_teams' THEN 5
    ELSE 2
  END;

-- Agregar constraint para validar que max_teams esté entre 0 y 10
ALTER TABLE users ADD CONSTRAINT users_max_teams_check CHECK (max_teams >= 0 AND max_teams <= 10);

SELECT 'Campo max_teams agregado exitosamente!' as status;
