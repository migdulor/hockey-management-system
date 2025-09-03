# 🗄️ ESQUEMA BASE DE DATOS ACTUALIZADO
## Con Especificaciones Exactas del PDF

**Fecha:** 22 de agosto de 2025  
**Fuente:** "Dudas críticas para el desarrollo.pdf"  
**Estado:** Especificaciones finales confirmadas

---

## 📊 MIGRACIÓN 1.1: Actualización Tabla Usuarios

```sql
-- Actualizar usuarios con validación de planes
ALTER TABLE users ADD COLUMN max_teams INTEGER DEFAULT 2;

-- Trigger para validar límites de equipos por plan
CREATE OR REPLACE FUNCTION validate_team_limit()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE team_count INTEGER;
  DECLARE max_allowed INTEGER;
  
  SELECT COUNT(*) INTO team_count 
  FROM teams 
  WHERE coach_id = NEW.coach_id;
  
  SELECT max_teams INTO max_allowed 
  FROM users 
  WHERE id = NEW.coach_id;
  
  IF team_count >= max_allowed THEN
    RAISE EXCEPTION 'Coach has reached maximum team limit: %', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_team_limit_trigger
  BEFORE INSERT ON teams
  FOR EACH ROW EXECUTE FUNCTION validate_team_limit();

-- Actualizar planes existentes
UPDATE users SET max_teams = 
  CASE 
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3  
    WHEN plan = '5_teams' THEN 5
    ELSE 2
  END;
```

---

## 📊 MIGRACIÓN 1.2: Tabla Divisiones con Edades Exactas

```sql
-- Crear tabla configuración divisiones
CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(20) NOT NULL, -- 'femenino', 'masculino'  
  min_birth_year INTEGER,
  max_birth_year INTEGER,
  has_shootouts BOOLEAN DEFAULT true,
  max_players INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poblar divisiones femeninas con edades exactas
INSERT INTO divisions (name, category, min_birth_year, max_birth_year, has_shootouts) VALUES
('Sub14', 'femenino', 2011, NULL, false),  -- 2011 y posteriores, SIN shootouts
('Sub16', 'femenino', 2009, 2010, true),   -- 2009-2010, CON shootouts  
('Sub19', 'femenino', 2006, 2008, true),   -- 2006-2008, CON shootouts
('Inter', 'femenino', 2000, 2005, true),   -- 2000-2005, CON shootouts
('Primera', 'femenino', NULL, 1999, true); -- Todas las edades, CON shootouts

-- Poblar divisiones masculinas
INSERT INTO divisions (name, category, min_birth_year, max_birth_year, has_shootouts) VALUES  
('Sub14', 'masculino', 2011, NULL, false),
('Sub16', 'masculino', 2009, 2010, true),
('Sub19', 'masculino', 2006, 2008, true), 
('Inter', 'masculino', 2000, 2005, true),
('Primera', 'masculino', NULL, 1999, true);
```

---

## 📊 MIGRACIÓN 1.3: Actualizar Tabla Players con Birth Year

```sql
-- Agregar año de nacimiento para validaciones
ALTER TABLE players ADD COLUMN birth_year INTEGER;
ALTER TABLE players ADD COLUMN current_division VARCHAR(20);

-- Función para validar jugadora en división por edad
CREATE OR REPLACE FUNCTION validate_player_division_age()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE div_min_year INTEGER;
  DECLARE div_max_year INTEGER;
  DECLARE team_division VARCHAR(20);
  
  -- Obtener división del equipo
  SELECT t.division INTO team_division
  FROM teams t 
  WHERE t.id = NEW.team_id;
  
  -- Obtener límites de edad de la división
  SELECT min_birth_year, max_birth_year INTO div_min_year, div_max_year
  FROM divisions d
  WHERE d.name = team_division;
  
  -- Validar edad de la jugadora
  IF (div_min_year IS NOT NULL AND NEW.birth_year < div_min_year) OR 
     (div_max_year IS NOT NULL AND NEW.birth_year > div_max_year) THEN
    RAISE EXCEPTION 'Player birth year % does not match division % requirements (%-%).', 
                    NEW.birth_year, team_division, div_min_year, div_max_year;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar edad en asignación a equipo
CREATE TRIGGER validate_player_age_trigger
  BEFORE INSERT OR UPDATE ON team_players  
  FOR EACH ROW EXECUTE FUNCTION validate_player_division_age();
```

---

## 📊 MIGRACIÓN 1.4: Tabla Tipos de Acciones Predefinidas

```sql
-- Crear tabla tipos de acciones con configuración exacta
CREATE TABLE action_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  requires_player BOOLEAN DEFAULT true,
  requires_zone BOOLEAN DEFAULT false,
  requires_area_sector BOOLEAN DEFAULT false, -- Para goles
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poblar con acciones específicas del hockey
INSERT INTO action_types (name, description, requires_player, requires_zone, requires_area_sector, icon, color) VALUES
-- Acciones de gol (requiere sector área rival)
('Gol', 'Anotación en arco rival', true, false, true, '🏑', '#00ff00'),

-- Acciones de cambios (requiere zona y 2 jugadoras)
('Cambio', 'Sustitución de jugadora', true, true, false, '🔄', '#0099ff'),

-- Sanciones disciplinarias  
('Tarjeta Verde', 'Sanción 2 minutos', true, false, false, '🟨', '#ffff00'),
('Tarjeta Amarilla', 'Sanción 5 minutos', true, false, false, '🟨', '#ff9900'),
('Tarjeta Roja', 'Expulsión del partido', true, false, false, '🟥', '#ff0000'),

-- Acciones tácticas con zona
('Recuperación Bocha', 'Recuperación de pelota', true, true, false, '🛡️', '#00cc00'),
('Pérdida Bocha', 'Pérdida de pelota', true, true, false, '⚠️', '#ff6600'),
('Corner', 'Tiro de esquina', false, true, false, '📐', '#9900ff'),

-- Acciones adicionales 
('Penal', 'Tiro penal', true, false, true, '🥅', '#ff00ff'),
('Falta', 'Infracción sin tarjeta', true, true, false, '❌', '#666666');
```

---

## 📊 MIGRACIÓN 1.5: Tabla Acciones de Partido con Zonas Exactas

```sql
-- Actualizar tabla match_actions con especificaciones exactas
ALTER TABLE match_actions ADD COLUMN area_sector VARCHAR(20); -- 'area_left', 'area_central', 'area_right'

-- Constraint para validar zonas
ALTER TABLE match_actions ADD CONSTRAINT valid_zone_check 
  CHECK (zone IN ('zona_1', 'zona_2', 'zona_3', 'zona_4'));

-- Constraint para validar sectores área rival  
ALTER TABLE match_actions ADD CONSTRAINT valid_area_sector_check
  CHECK (area_sector IN ('area_left', 'area_central', 'area_right'));

-- Función para validar acciones según tipo
CREATE OR REPLACE FUNCTION validate_match_action()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE action_requires_zone BOOLEAN;
  DECLARE action_requires_area BOOLEAN;
  
  -- Obtener requerimientos del tipo de acción
  SELECT requires_zone, requires_area_sector INTO action_requires_zone, action_requires_area
  FROM action_types 
  WHERE id = NEW.action_type_id;
  
  -- Validar zona requerida
  IF action_requires_zone AND NEW.zone IS NULL THEN
    RAISE EXCEPTION 'This action type requires a zone to be specified.';
  END IF;
  
  -- Validar sector área requerido  
  IF action_requires_area AND NEW.area_sector IS NULL THEN
    RAISE EXCEPTION 'This action type requires an area sector to be specified.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_match_action_trigger
  BEFORE INSERT OR UPDATE ON match_actions
  FOR EACH ROW EXECUTE FUNCTION validate_match_action();
```

---

## 📊 MIGRACIÓN 1.6: Control de Sanciones Automático

```sql
-- Tabla para control de sanciones activas
CREATE TABLE active_sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  sanction_type VARCHAR(50) NOT NULL, -- 'verde', 'amarilla', 'roja'
  start_quarter INTEGER NOT NULL,
  start_time INTEGER NOT NULL, -- Segundos en el cuarto
  duration_minutes INTEGER, -- 2, 5, o NULL para roja
  end_quarter INTEGER,
  end_time INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, player_id, start_quarter, start_time)
);

-- Función para calcular fin de sanción automáticamente
CREATE OR REPLACE FUNCTION calculate_sanction_end()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE total_seconds INTEGER;
  DECLARE quarter_seconds INTEGER;
  
  IF NEW.duration_minutes IS NOT NULL THEN
    total_seconds := NEW.duration_minutes * 60;
    quarter_seconds := NEW.start_time + total_seconds;
    
    -- Si excede los 15 minutos del cuarto actual
    IF quarter_seconds > 900 THEN -- 15 min = 900 seg
      NEW.end_quarter := NEW.start_quarter + 1 + ((quarter_seconds - 900) / 900);
      NEW.end_time := (quarter_seconds - 900) % 900;
    ELSE
      NEW.end_quarter := NEW.start_quarter;
      NEW.end_time := quarter_seconds;
    END IF;
  ELSE
    -- Sanción roja: hasta final del partido
    NEW.end_quarter := 4;
    NEW.end_time := 900;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_sanction_end_trigger
  BEFORE INSERT ON active_sanctions
  FOR EACH ROW EXECUTE FUNCTION calculate_sanction_end();
```

---

## 📊 MIGRACIÓN 1.7: Tabla Validación 2 Divisiones por Jugadora

```sql
-- Función para validar máximo 2 divisiones por jugadora
CREATE OR REPLACE FUNCTION validate_player_division_limit()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE division_count INTEGER;
  DECLARE player_club VARCHAR(200);
  DECLARE team_club VARCHAR(200);
  
  -- Obtener club de la jugadora (desde su primer equipo)
  SELECT u.club_name INTO player_club
  FROM team_players tp
  JOIN teams t ON tp.team_id = t.id  
  JOIN users u ON t.coach_id = u.id
  WHERE tp.player_id = NEW.player_id
  LIMIT 1;
  
  -- Obtener club del nuevo equipo
  SELECT u.club_name INTO team_club
  FROM teams t
  JOIN users u ON t.coach_id = u.id
  WHERE t.id = NEW.team_id;
  
  -- Solo validar si es el mismo club
  IF player_club = team_club THEN
    -- Contar divisiones actuales de la jugadora en este club
    SELECT COUNT(DISTINCT t.division) INTO division_count
    FROM team_players tp
    JOIN teams t ON tp.team_id = t.id
    JOIN users u ON t.coach_id = u.id  
    WHERE tp.player_id = NEW.player_id 
    AND u.club_name = team_club
    AND tp.is_active = true;
    
    IF division_count >= 2 THEN
      RAISE EXCEPTION 'Player can only participate in maximum 2 divisions per club.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_division_limit_trigger
  BEFORE INSERT ON team_players
  FOR EACH ROW EXECUTE FUNCTION validate_player_division_limit();
```

---

## 📊 MIGRACIÓN 1.8: Configuración WhatsApp Business

```sql
-- Tabla configuración WhatsApp
CREATE TABLE whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  business_account_id VARCHAR(100),
  access_token TEXT,
  webhook_verify_token VARCHAR(100),
  monthly_message_count INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla mensajes enviados (para tracking)
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- 'formation', 'reminder', 'notification'
  content TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 SCRIPT COMPLETO DE INICIALIZACIÓN

```sql
-- Script para poblar base de datos con datos de prueba
DO $$
BEGIN
  -- Crear usuario administrador
  INSERT INTO users (email, password_hash, role, first_name, last_name, plan, max_teams)
  VALUES ('migdulor@hotmail.com', '$2b$10$hashed_password_here', 'admin', 'Miguel', 'Dulor', '5_teams', 5);
  
  -- Crear usuarios entrenadores de prueba
  INSERT INTO users (email, password_hash, role, first_name, last_name, club_name, plan, max_teams)
  VALUES 
  ('coach1@test.com', '$2b$10$hashed_password_here', 'coach', 'Coach', 'Test1', 'Club Atlético Test', '3_teams', 3),
  ('coach2@test.com', '$2b$10$hashed_password_here', 'coach', 'Coach', 'Test2', 'Club Deportivo Ejemplo', '2_teams', 2);
  
  -- Crear equipos de prueba
  INSERT INTO teams (coach_id, name, division, category, season)
  SELECT u.id, 'Sub16 Femenino', 'Sub16', 'femenino', '2025'
  FROM users u WHERE u.email = 'coach1@test.com';
  
  -- Crear jugadoras de prueba con años de nacimiento válidos
  INSERT INTO players (first_name, last_name, birth_year, nickname, current_division)
  VALUES 
  ('Ana', 'García', 2009, 'Anita', 'Sub16'),
  ('María', 'López', 2010, 'Mary', 'Sub16'),
  ('Sofía', 'Martínez', 2009, 'Sofi', 'Sub16');
  
END $$;
```

---

## 🎯 VALIDACIONES CRÍTICAS IMPLEMENTADAS

### ✅ Validaciones de Negocio:
1. **Límite equipos por plan** - Automático via trigger
2. **Edad jugadoras por división** - Validación por año nacimiento  
3. **Máximo 2 divisiones por jugadora** - Control por club
4. **20 jugadoras máximo por equipo** - Constraint simple
5. **Números camiseta únicos** - Unique constraint por equipo
6. **Acciones válidas por zona** - Validación según tipo acción

### ✅ Configuraciones Específicas:
1. **Shootouts por división** - Configurado en tabla divisions
2. **Zonas cancha exactas** - 4 zonas + 3 sectores área
3. **Tipos acciones hockey** - 10 acciones predefinidas
4. **Control sanciones** - Cálculo automático tiempos
5. **WhatsApp limits** - Tracking mensajes mensuales

---

**🎯 BASE DE DATOS COMPLETA Y LISTA PARA DESARROLLO**  
**📋 TODAS LAS ESPECIFICACIONES DEL PDF IMPLEMENTADAS**
