-- Migración 012: Sistema Completo de Formaciones
-- Fecha: 2025-08-26
-- Descripción: Formaciones visuales con drag & drop, información de partidos y exportación

-- PASO 1: Eliminar tabla formations actual (muy básica)
DROP TABLE IF EXISTS formations CASCADE;

-- PASO 2: Crear tabla principal de formaciones (US006, US007, US008)
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Información básica de la formación
  name VARCHAR(100) NOT NULL, -- ej: "Formación vs River", "4-3-3 Ofensiva"
  description TEXT,
  
  -- US007: Información del partido contextual
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL, -- Opcional: si es para un partido específico
  rival_team_name VARCHAR(100), -- Nombre del equipo rival
  match_date DATE,
  match_time TIME,
  match_location VARCHAR(100),
  
  -- US006: Configuración táctica
  tactical_system VARCHAR(20) NOT NULL DEFAULT '4-3-3', -- ej: "4-4-2", "3-5-2", "4-3-3"
  formation_type VARCHAR(20) DEFAULT 'offensive' CHECK (formation_type IN ('offensive', 'defensive', 'balanced')),
  
  -- Configuración visual y exportación
  field_dimensions JSONB, -- Dimensiones de cancha para exportación
  color_scheme JSONB, -- Colores para exportación PNG
  
  -- US006: Plantilla reutilizable
  is_template BOOLEAN DEFAULT false, -- Si es plantilla reutilizable
  template_category VARCHAR(50), -- ej: "Defensiva", "Contra-ataque", "Presión alta"
  
  -- US008: Configuración de exportación PNG
  export_settings JSONB DEFAULT '{
    "width": 1080,
    "height": 1350,
    "format": "PNG",
    "background_color": "#2D5A2D",
    "player_circle_size": 40,
    "font_family": "Arial",
    "font_size": 12
  }'::jsonb,
  
  -- Control de versiones y uso
  version INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0, -- Cuántas veces se ha usado
  last_used_at TIMESTAMP,
  
  -- Metadatos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: Nombre único por equipo
  UNIQUE(team_id, name)
);

-- PASO 3: Crear tabla de posiciones en la formación (US006: drag & drop)
CREATE TABLE formation_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- US006: 11 titulares + 9 suplentes
  position_type VARCHAR(10) NOT NULL CHECK (position_type IN ('starter', 'substitute')),
  position_number INTEGER NOT NULL CHECK (position_number BETWEEN 1 AND 20), -- 1-11 titulares, 12-20 suplentes
  
  -- Posición en la cancha (coordenadas para drag & drop)
  field_position_x DECIMAL(5,2) NOT NULL CHECK (field_position_x BETWEEN 0 AND 100), -- Porcentaje de la cancha (0-100)
  field_position_y DECIMAL(5,2) NOT NULL CHECK (field_position_y BETWEEN 0 AND 100), -- Porcentaje de la cancha (0-100)
  
  -- Información táctica
  position_name VARCHAR(30), -- ej: "Arquera", "Lateral Derecho", "Mediocampo Central"
  tactical_role VARCHAR(50), -- ej: "Playmaker", "Marcador", "Creativo"
  position_zone VARCHAR(20) CHECK (position_zone IN ('defensive', 'midfield', 'offensive')),
  
  -- Configuración visual
  jersey_number INTEGER CHECK (jersey_number BETWEEN 1 AND 99),
  captain BOOLEAN DEFAULT false,
  vice_captain BOOLEAN DEFAULT false,
  
  -- Instrucciones específicas
  special_instructions TEXT, -- Instrucciones tácticas específicas para esta posición
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(formation_id, player_id), -- Un jugador no puede estar dos veces en la misma formación
  UNIQUE(formation_id, position_number), -- Cada número de posición es único en la formación
  UNIQUE(formation_id, jersey_number) -- Cada número de camiseta es único en la formación
);

-- PASO 4: Tabla para estrategias y variantes de formación
CREATE TABLE formation_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  
  strategy_name VARCHAR(100) NOT NULL, -- ej: "Presión Alta", "Salida por Bandas"
  strategy_type VARCHAR(20) NOT NULL CHECK (strategy_type IN ('offensive', 'defensive', 'transition')),
  description TEXT,
  
  -- Configuración específica de la estrategia
  strategy_config JSONB, -- Configuración detallada en JSON
  
  -- Cuándo aplicar esta estrategia
  game_situation VARCHAR(50), -- ej: "winning", "losing", "drawing", "first_half", "second_half"
  min_score_difference INTEGER, -- Aplicar cuando hay X diferencia de goles
  
  -- Control de uso
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00, -- Porcentaje de éxito cuando se usa
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 5: Tabla para exportaciones de formaciones (US008)
CREATE TABLE formation_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  
  -- Información del archivo exportado
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500), -- Para almacenamiento local o URL de Vercel Blob
  file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('PNG', 'PDF', 'SVG')),
  file_size_kb INTEGER,
  
  -- US008: Configuración específica PNG 1080x1350
  export_width INTEGER DEFAULT 1080,
  export_height INTEGER DEFAULT 1350,
  export_quality INTEGER DEFAULT 95 CHECK (export_quality BETWEEN 1 AND 100),
  
  -- Configuración visual del export
  include_player_photos BOOLEAN DEFAULT true,
  include_jersey_numbers BOOLEAN DEFAULT true,
  include_player_names BOOLEAN DEFAULT true,
  include_tactical_instructions BOOLEAN DEFAULT false,
  
  -- Metadatos
  exported_by UUID REFERENCES users(id), -- Quién exportó
  export_purpose VARCHAR(100), -- ej: "Presentación equipo", "Análisis rival"
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days') -- Los exports expiran
);

-- PASO 6: Índices para optimización
CREATE INDEX idx_formations_team ON formations(team_id);
CREATE INDEX idx_formations_template ON formations(is_template, template_category);
CREATE INDEX idx_formations_match ON formations(match_id);
CREATE INDEX idx_formations_usage ON formations(usage_count DESC, last_used_at DESC);

CREATE INDEX idx_formation_positions_formation ON formation_positions(formation_id);
CREATE INDEX idx_formation_positions_player ON formation_positions(player_id);
CREATE INDEX idx_formation_positions_type ON formation_positions(position_type);
CREATE INDEX idx_formation_positions_starter_order ON formation_positions(formation_id, position_type, position_number);

CREATE INDEX idx_formation_strategies_formation ON formation_strategies(formation_id);
CREATE INDEX idx_formation_strategies_type ON formation_strategies(strategy_type, game_situation);

CREATE INDEX idx_formation_exports_formation ON formation_exports(formation_id);
CREATE INDEX idx_formation_exports_user ON formation_exports(exported_by);
CREATE INDEX idx_formation_exports_expires ON formation_exports(expires_at);

-- PASO 7: Triggers para updated_at
CREATE TRIGGER update_formations_updated_at 
    BEFORE UPDATE ON formations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formation_positions_updated_at 
    BEFORE UPDATE ON formation_positions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formation_strategies_updated_at 
    BEFORE UPDATE ON formation_strategies
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- PASO 8: Función para validar máximo 11 titulares
CREATE OR REPLACE FUNCTION validate_formation_starters()
RETURNS TRIGGER AS $$
DECLARE
    starter_count INTEGER;
BEGIN
    IF NEW.position_type = 'starter' THEN
        SELECT COUNT(*) INTO starter_count
        FROM formation_positions
        WHERE formation_id = NEW.formation_id 
        AND position_type = 'starter'
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
        
        IF starter_count >= 11 THEN
            RAISE EXCEPTION 'Una formación no puede tener más de 11 jugadoras titulares';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar titulares
CREATE TRIGGER validate_formation_starters_trigger
    BEFORE INSERT OR UPDATE ON formation_positions
    FOR EACH ROW 
    EXECUTE FUNCTION validate_formation_starters();

-- PASO 9: Función para clonar formación (US006: plantillas reutilizables)
CREATE OR REPLACE FUNCTION clone_formation(
    source_formation_id UUID,
    new_name VARCHAR(100),
    target_team_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_formation_id UUID;
    source_team_id UUID;
BEGIN
    -- Obtener team_id de la formación origen
    SELECT team_id INTO source_team_id FROM formations WHERE id = source_formation_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Formación origen no encontrada: %', source_formation_id;
    END IF;
    
    -- Usar team_id objetivo o el mismo de origen
    IF target_team_id IS NULL THEN
        target_team_id := source_team_id;
    END IF;
    
    -- Clonar formación principal
    INSERT INTO formations (
        team_id, name, description, tactical_system, formation_type,
        field_dimensions, color_scheme, is_template, template_category,
        export_settings, version
    )
    SELECT 
        target_team_id, new_name, description, tactical_system, formation_type,
        field_dimensions, color_scheme, false, template_category,
        export_settings, 1
    FROM formations 
    WHERE id = source_formation_id
    RETURNING id INTO new_formation_id;
    
    -- Clonar posiciones (sin jugadores específicos si es para otro equipo)
    IF target_team_id = source_team_id THEN
        -- Mismo equipo: clonar con jugadores
        INSERT INTO formation_positions (
            formation_id, player_id, position_type, position_number,
            field_position_x, field_position_y, position_name, tactical_role,
            position_zone, special_instructions
        )
        SELECT 
            new_formation_id, player_id, position_type, position_number,
            field_position_x, field_position_y, position_name, tactical_role,
            position_zone, special_instructions
        FROM formation_positions 
        WHERE formation_id = source_formation_id;
    ELSE
        -- Diferente equipo: clonar solo estructura sin jugadores
        INSERT INTO formation_positions (
            formation_id, position_type, position_number,
            field_position_x, field_position_y, position_name, tactical_role,
            position_zone, special_instructions
        )
        SELECT 
            new_formation_id, position_type, position_number,
            field_position_x, field_position_y, position_name, tactical_role,
            position_zone, special_instructions
        FROM formation_positions 
        WHERE formation_id = source_formation_id;
    END IF;
    
    -- Clonar estrategias
    INSERT INTO formation_strategies (
        formation_id, strategy_name, strategy_type, description,
        strategy_config, game_situation, min_score_difference
    )
    SELECT 
        new_formation_id, strategy_name, strategy_type, description,
        strategy_config, game_situation, min_score_difference
    FROM formation_strategies 
    WHERE formation_id = source_formation_id;
    
    RETURN new_formation_id;
END;
$$ LANGUAGE plpgsql;

-- PASO 10: Vista completa para facilitar consultas
CREATE VIEW v_formation_details AS
SELECT 
    f.id as formation_id,
    f.name as formation_name,
    f.description,
    f.tactical_system,
    f.formation_type,
    f.rival_team_name,
    f.match_date,
    f.match_location,
    f.is_template,
    f.template_category,
    f.usage_count,
    f.last_used_at,
    t.name as team_name,
    
    -- Estadísticas de la formación
    (SELECT COUNT(*) FROM formation_positions fp WHERE fp.formation_id = f.id AND fp.position_type = 'starter') as starters_count,
    (SELECT COUNT(*) FROM formation_positions fp WHERE fp.formation_id = f.id AND fp.position_type = 'substitute') as substitutes_count,
    (SELECT COUNT(*) FROM formation_strategies fs WHERE fs.formation_id = f.id) as strategies_count,
    
    f.created_at,
    f.updated_at
FROM formations f
JOIN teams t ON f.team_id = t.id;
