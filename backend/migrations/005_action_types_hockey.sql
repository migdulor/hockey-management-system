-- Migración 005: Tipos de Acciones Hockey
-- Fecha: 2025-08-22
-- Descripción: 10 tipos de acciones específicas confirmadas del PDF

-- Tabla tipos de acciones específicas de hockey
CREATE TABLE action_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  requires_zone BOOLEAN NOT NULL DEFAULT true,
  requires_player BOOLEAN NOT NULL DEFAULT true,
  requires_rival_area BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  color VARCHAR(7),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar 10 acciones específicas confirmadas del PDF
INSERT INTO action_types (name, requires_zone, requires_player, requires_rival_area, icon, color, description) VALUES
('Gol', true, true, true, 'goal', '#00ff00', 'Gol marcado - requiere zona y sector área rival (L/C/R)'),
('Cambio', true, true, false, 'substitute', '#0099ff', 'Cambio de jugadora - requiere zona y 2 jugadoras (entrada/salida)'),
('Tarjeta Verde', false, true, false, 'green-card', '#00cc00', 'Tarjeta verde - 2 minutos de sanción'),
('Tarjeta Amarilla', false, true, false, 'yellow-card', '#ff9900', 'Tarjeta amarilla - 5 minutos de sanción'),
('Tarjeta Roja', false, true, false, 'red-card', '#ff0000', 'Tarjeta roja - expulsión del partido'),
('Recuperación Bocha', true, true, false, 'defense', '#00cc00', 'Recuperación de bocha - requiere zona'),
('Pérdida Bocha', true, true, false, 'attack', '#ff6600', 'Pérdida de bocha - requiere zona'),
('Corner', true, false, false, 'corner', '#9900ff', 'Tiro de esquina - solo requiere zona'),
('Penal', false, false, true, 'penalty', '#ff3300', 'Penal - requiere sector área rival (L/C/R)'),
('Falta', true, true, false, 'foul', '#ffff00', 'Falta - requiere zona y jugadora');

-- Crear tabla para sanciones (relacionada con tarjetas)
CREATE TABLE sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  match_id UUID NOT NULL, -- Referencia se agregará en migración matches
  sanction_type VARCHAR(20) NOT NULL CHECK (sanction_type IN ('green', 'yellow', 'red')),
  minutes_duration INTEGER NOT NULL CHECK (minutes_duration > 0),
  start_quarter INTEGER NOT NULL CHECK (start_quarter BETWEEN 1 AND 4),
  start_minute INTEGER NOT NULL CHECK (start_minute BETWEEN 0 AND 15),
  start_second INTEGER DEFAULT 0 CHECK (start_second BETWEEN 0 AND 59),
  end_quarter INTEGER CHECK (end_quarter BETWEEN 1 AND 4),
  end_minute INTEGER CHECK (end_minute BETWEEN 0 AND 15), 
  end_second INTEGER DEFAULT 0 CHECK (end_second BETWEEN 0 AND 59),
  is_active BOOLEAN DEFAULT true, -- false cuando termina la sanción o partido
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para calcular duración de sanción automáticamente
CREATE OR REPLACE FUNCTION set_sanction_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Establecer duración según tipo de tarjeta
    NEW.minutes_duration := CASE 
        WHEN NEW.sanction_type = 'green' THEN 2
        WHEN NEW.sanction_type = 'yellow' THEN 5
        WHEN NEW.sanction_type = 'red' THEN 9999 -- Expulsión = resto del partido
        ELSE 2
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para establecer duración automática
CREATE TRIGGER set_sanction_duration_trigger
    BEFORE INSERT ON sanctions
    FOR EACH ROW 
    EXECUTE FUNCTION set_sanction_duration();

-- Función para verificar si jugadora puede realizar acción (no sancionada)
CREATE OR REPLACE FUNCTION player_can_perform_action(
    p_player_id UUID,
    p_match_id UUID,
    p_quarter INTEGER,
    p_minute INTEGER,
    p_second INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
    active_sanction_count INTEGER;
BEGIN
    -- Contar sanciones activas para la jugadora en este partido
    SELECT COUNT(*) INTO active_sanction_count
    FROM sanctions 
    WHERE player_id = p_player_id 
    AND match_id = p_match_id 
    AND is_active = true
    AND (
        -- Sanción aún no terminó por tiempo
        (start_quarter * 15 * 60 + start_minute * 60 + start_second) + (minutes_duration * 60) > 
        (p_quarter * 15 * 60 + p_minute * 60 + p_second)
        OR
        -- Tarjeta roja (expulsión total)
        sanction_type = 'red'
    );
    
    RETURN active_sanction_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX idx_action_types_name ON action_types(name);
CREATE INDEX idx_action_types_requires ON action_types(requires_zone, requires_player, requires_rival_area);
CREATE INDEX idx_sanctions_player ON sanctions(player_id);
CREATE INDEX idx_sanctions_match ON sanctions(match_id);
CREATE INDEX idx_sanctions_active ON sanctions(is_active);
CREATE INDEX idx_sanctions_type ON sanctions(sanction_type);

-- Vista para acciones con requisitos
CREATE VIEW action_types_summary AS
SELECT 
    id,
    name,
    requires_zone,
    requires_player,
    requires_rival_area,
    CASE 
        WHEN requires_zone AND requires_player AND requires_rival_area THEN 'Zona + Jugadora + Área Rival'
        WHEN requires_zone AND requires_player THEN 'Zona + Jugadora'
        WHEN requires_player AND requires_rival_area THEN 'Jugadora + Área Rival'
        WHEN requires_zone THEN 'Solo Zona'
        WHEN requires_player THEN 'Solo Jugadora'
        WHEN requires_rival_area THEN 'Solo Área Rival'
        ELSE 'Sin requisitos específicos'
    END as requirements_summary,
    icon,
    color,
    description
FROM action_types
ORDER BY name;

-- Comentarios para documentación
COMMENT ON TABLE action_types IS '10 tipos de acciones específicas del hockey confirmadas del PDF';
COMMENT ON TABLE sanctions IS 'Control de sanciones por tarjetas con duración automática';
COMMENT ON COLUMN action_types.requires_zone IS 'true = requiere especificar zona (1-4)';
COMMENT ON COLUMN action_types.requires_player IS 'true = requiere especificar jugadora';  
COMMENT ON COLUMN action_types.requires_rival_area IS 'true = requiere especificar sector área rival (L/C/R)';
COMMENT ON FUNCTION player_can_perform_action IS 'Verifica si jugadora puede realizar acción (no sancionada)';
