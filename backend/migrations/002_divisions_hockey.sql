-- Migración 002: Divisiones Hockey
-- Fecha: 2025-08-22
-- Descripción: Divisiones con edades específicas y reglas de shootout confirmadas del PDF

-- Tabla divisiones con edades específicas
CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
  min_birth_year INTEGER,
  max_birth_year INTEGER,
  allows_shootout BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poblar divisiones FEMENINAS con datos exactos del PDF
INSERT INTO divisions (name, gender, min_birth_year, max_birth_year, allows_shootout, description) VALUES
('Sub 14', 'female', 2011, NULL, false, 'Nacidas en 2011 y posteriores - SIN shootouts'),
('Sub 16', 'female', 2009, 2010, true, 'Nacidas en 2009-2010 - CON shootouts'),
('Sub 19', 'female', 2006, 2008, true, 'Nacidas en 2006-2008 - CON shootouts'),
('Intermedia', 'female', 2000, 2005, true, 'Nacidas en 2000-2005 - CON shootouts'),
('Primera', 'female', NULL, 1999, true, 'Todas las edades - CON shootouts');

-- Poblar divisiones MASCULINAS con las mismas reglas
INSERT INTO divisions (name, gender, min_birth_year, max_birth_year, allows_shootout, description) VALUES
('Sub 14', 'male', 2011, NULL, false, 'Nacidas en 2011 y posteriores - SIN shootouts'),
('Sub 16', 'male', 2009, 2010, true, 'Nacidas en 2009-2010 - CON shootouts'),
('Sub 19', 'male', 2006, 2008, true, 'Nacidas en 2006-2008 - CON shootouts'),
('Intermedia', 'male', 2000, 2005, true, 'Nacidas en 2000-2005 - CON shootouts'),
('Primera', 'male', NULL, 1999, true, 'Todas las edades - CON shootouts');

-- Índices para performance
CREATE INDEX idx_divisions_gender ON divisions(gender);
CREATE INDEX idx_divisions_name ON divisions(name);
CREATE INDEX idx_divisions_shootout ON divisions(allows_shootout);

-- Función para validar si una fecha de nacimiento es válida para una división
CREATE OR REPLACE FUNCTION validate_birth_date_for_division(
    birth_date DATE, 
    division_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    division_record RECORD;
    birth_year INTEGER;
BEGIN
    -- Obtener datos de la división
    SELECT min_birth_year, max_birth_year 
    INTO division_record 
    FROM divisions 
    WHERE id = division_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Obtener año de nacimiento
    birth_year := EXTRACT(YEAR FROM birth_date);
    
    -- Validar límite mínimo (año más reciente)
    IF division_record.min_birth_year IS NOT NULL AND birth_year < division_record.min_birth_year THEN
        RETURN false;
    END IF;
    
    -- Validar límite máximo (año más antiguo)
    IF division_record.max_birth_year IS NOT NULL AND birth_year > division_record.max_birth_year THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE divisions IS 'Divisiones de hockey con edades específicas y reglas de shootout';
COMMENT ON COLUMN divisions.min_birth_year IS 'Año mínimo de nacimiento (más reciente) - NULL = sin límite';
COMMENT ON COLUMN divisions.max_birth_year IS 'Año máximo de nacimiento (más antiguo) - NULL = sin límite';
COMMENT ON COLUMN divisions.allows_shootout IS 'Sub14: false, resto: true según PDF';
