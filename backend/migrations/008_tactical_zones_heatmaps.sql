-- Migración 008: Zonas Tácticas para Mapas de Calor
-- Fecha: 2025-08-26  
-- Descripción: 8 zonas de cancha + 3 sectores de área rival para análisis táctico

-- Tabla de zonas de cancha (las 8 zonas específicas del hockey)
CREATE TABLE tactical_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_number INTEGER NOT NULL UNIQUE CHECK (zone_number BETWEEN 1 AND 8),
  zone_name VARCHAR(50) NOT NULL,
  zone_description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las 8 zonas tácticas según análisis funcional
INSERT INTO tactical_zones (zone_number, zone_name, zone_description) VALUES
(1, 'Defensivo Izquierdo', 'Zona defensiva del lado izquierdo del campo'),
(2, 'Defensivo Derecho', 'Zona defensiva del lado derecho del campo'), 
(3, 'Medio Izquierdo', 'Zona media del lado izquierdo del campo'),
(4, 'Medio Defensivo Derecho', 'Zona media defensiva del lado derecho del campo'),
(5, 'Medio Ofensivo Izquierdo', 'Zona media ofensiva del lado izquierdo del campo'),
(6, 'Medio Ofensivo Derecho', 'Zona media ofensiva del lado derecho del campo'),
(7, 'Ataque Izquierdo', 'Zona de ataque del lado izquierdo del campo'),
(8, 'Ataque Derecho', 'Zona de ataque del lado derecho del campo');

-- Tabla de sectores del área rival (los 3 sectores específicos)
CREATE TABLE rival_area_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_number INTEGER NOT NULL UNIQUE CHECK (sector_number BETWEEN 1 AND 3),
  sector_name VARCHAR(20) NOT NULL,
  sector_description VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los 3 sectores del área rival
INSERT INTO rival_area_sectors (sector_number, sector_name, sector_description) VALUES
(1, 'Central', 'Sector central del área rival'),
(2, 'Derecha', 'Sector derecho del área rival'),
(3, 'Izquierda', 'Sector izquierdo del área rival');

-- Actualizar tabla match_actions para incluir zona táctica y sector
ALTER TABLE match_actions 
ADD COLUMN tactical_zone_id UUID REFERENCES tactical_zones(id),
ADD COLUMN rival_sector_id UUID REFERENCES rival_area_sectors(id);

-- Índices para mejorar performance en mapas de calor
CREATE INDEX idx_match_actions_tactical_zone ON match_actions(tactical_zone_id);
CREATE INDEX idx_match_actions_rival_sector ON match_actions(rival_sector_id);
CREATE INDEX idx_match_actions_zone_and_type ON match_actions(tactical_zone_id, action_type_id);
CREATE INDEX idx_match_actions_sector_and_type ON match_actions(rival_sector_id, action_type_id);
