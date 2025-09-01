-- Agregar campo max_teams numérico a la tabla users
-- Este campo almacenará el número real de equipos (0-10)

-- Agregar la columna max_teams con valor por defecto 2
ALTER TABLE users 
ADD COLUMN max_teams INTEGER DEFAULT 2;

-- Actualizar valores existentes basados en el plan actual
UPDATE users 
SET max_teams = CASE 
    WHEN plan = '1_teams' THEN 1
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3
    WHEN plan = '5_teams' THEN 5
    ELSE 2
END;

-- Agregar constraint para validar el rango
ALTER TABLE users 
ADD CONSTRAINT users_max_teams_check CHECK (max_teams >= 0 AND max_teams <= 10);

-- Verificar que la migración se aplicó correctamente
SELECT 'Migración completada: campo max_teams agregado' as status;
SELECT id, email, plan, max_teams FROM users LIMIT 5;
