-- Agregar campo numérico max_teams a la tabla users
-- Este campo almacenará el número real de equipos (0-10)

ALTER TABLE users 
ADD COLUMN max_teams INTEGER DEFAULT 2 CHECK (max_teams >= 0 AND max_teams <= 10);

-- Migrar datos existentes del campo plan al nuevo campo max_teams
UPDATE users 
SET max_teams = CASE 
    WHEN plan = '1_teams' THEN 1
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3
    WHEN plan = '5_teams' THEN 5
    ELSE 2 -- Valor por defecto
END;

-- Verificar la migración
SELECT id, email, plan, max_teams 
FROM users 
ORDER BY email;

SELECT 'Migration completed successfully! ✅' as status;
