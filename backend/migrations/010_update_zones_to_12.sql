-- Migración 010: Actualización de Zonas de Cancha a 12 Zonas
-- Fecha: 2025-09-05
-- Descripción: Actualiza el sistema de 8 zonas a 12 zonas para mejor análisis táctico

-- Eliminar datos existentes de zonas para limpiar
DELETE FROM tactical_zones;

-- Actualizar restricción para 12 zonas
ALTER TABLE tactical_zones 
DROP CONSTRAINT tactical_zones_zone_number_check;

ALTER TABLE tactical_zones 
ADD CONSTRAINT tactical_zones_zone_number_check 
CHECK (zone_number BETWEEN 1 AND 12);

-- Insertar las 12 zonas actualizadas según nueva distribución
INSERT INTO tactical_zones (zone_number, zone_name, zone_description) VALUES
-- Fila 1 (Defensiva)
(1, 'Defensivo Izquierdo', 'Zona defensiva del lado izquierdo del campo'),
(2, 'Defensivo Centro', 'Zona defensiva del centro del campo'),
(3, 'Defensivo Derecho', 'Zona defensiva del lado derecho del campo'),
-- Fila 2 (Medio Defensiva)
(4, 'Medio Defensivo Izquierdo', 'Zona media defensiva del lado izquierdo del campo'),
(5, 'Medio Defensivo Centro', 'Zona media defensiva del centro del campo'),
(6, 'Medio Defensivo Derecho', 'Zona media defensiva del lado derecho del campo'),
-- Fila 3 (Medio Ofensiva)
(7, 'Medio Ofensivo Izquierdo', 'Zona media ofensiva del lado izquierdo del campo'),
(8, 'Medio Ofensivo Centro', 'Zona media ofensiva del centro del campo'),
(9, 'Medio Ofensivo Derecho', 'Zona media ofensiva del lado derecho del campo'),
-- Fila 4 (Ofensiva)
(10, 'Ofensivo Izquierdo', 'Zona ofensiva del lado izquierdo del campo'),
(11, 'Ofensivo Centro', 'Zona ofensiva del centro del campo'),
(12, 'Ofensivo Derecho', 'Zona ofensiva del lado derecho del campo');

-- Actualizar también la tabla match_actions para permitir zonas 1-12
ALTER TABLE match_actions 
DROP CONSTRAINT match_actions_zone_check;

ALTER TABLE match_actions 
ADD CONSTRAINT match_actions_zone_check 
CHECK (zone BETWEEN 1 AND 12);

-- Crear vista para mapas de calor con 12 zonas
CREATE OR REPLACE VIEW tactical_heatmap_data AS
SELECT 
    tz.zone_number,
    tz.zone_name,
    at.action_name,
    COUNT(ma.id) as action_count,
    ma.team_id,
    ma.match_id
FROM tactical_zones tz
LEFT JOIN match_actions ma ON tz.id = ma.tactical_zone_id
LEFT JOIN action_types at ON ma.action_type_id = at.id
GROUP BY tz.zone_number, tz.zone_name, at.action_name, ma.team_id, ma.match_id;

-- Comentarios actualizados
COMMENT ON TABLE tactical_zones IS 'Tabla de 12 zonas tácticas de la cancha de hockey para análisis detallado';
COMMENT ON COLUMN tactical_zones.zone_number IS 'Número de zona (1-12): 1-3 defensivo, 4-6 medio defensivo, 7-9 medio ofensivo, 10-12 ofensivo';
COMMENT ON COLUMN match_actions.zone IS '1-12: Zona de cancha donde ocurrió la acción (nueva distribución de 12 zonas)';

-- Índices adicionales para mejor performance con 12 zonas
CREATE INDEX IF NOT EXISTS idx_tactical_zones_number ON tactical_zones(zone_number);
CREATE INDEX IF NOT EXISTS idx_match_actions_zone_team ON match_actions(zone, team_id);
