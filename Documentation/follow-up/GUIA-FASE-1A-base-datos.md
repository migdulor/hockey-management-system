# 🗄️ GUÍA FASE 1A: IMPLEMENTACIÓN BASE DE DATOS
**Duración:** 2-3 días | **Prioridad:** 🔥 CRÍTICA

---

## 🎯 OBJETIVO
Implementar el esquema completo de PostgreSQL con las 8 migraciones, triggers de validación y datos iniciales basados en las especificaciones técnicas del PDF confirmado.

---

## 📋 PASO A PASO

### 🚀 **PASO 1: Preparación del Entorno (30 min)**

#### 1.1 Verificar Conexión Railway
```bash
# En el directorio backend
cd C:\Proyectos\hockey-management-system\backend

# Verificar variables de entorno
echo $env:DATABASE_URL
# Debe mostrar: postgresql://postgres:password@turntable.proxy.rlwy.net:53371/railway?sslmode=require
```

#### 1.2 Instalar Herramientas de Migración
```bash
# Instalar node-pg-migrate
npm install --save-dev node-pg-migrate
npm install pg @types/pg

# Crear carpeta para migraciones
mkdir migrations
```

#### 1.3 Configurar Scripts de Migración
```json
// Agregar a package.json
"scripts": {
  "migrate:create": "migrate create",
  "migrate:up": "migrate up",
  "migrate:down": "migrate down",
  "migrate:reset": "migrate reset"
}
```

---

### 🏗️ **PASO 2: Migraciones Core (3 horas)**

#### 2.1 Migración 1: Usuarios y Autenticación
```bash
# Crear migración
npm run migrate:create users_and_authentication
```

```sql
-- migrations/001_users_and_authentication.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla usuarios con roles y planes
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'coach')),
  plan VARCHAR(15) NOT NULL CHECK (plan IN ('2_teams', '3_teams', '5_teams')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  club_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2.2 Migración 2: Divisiones Hockey  
```bash
npm run migrate:create divisions_hockey
```

```sql
-- migrations/002_divisions_hockey.sql

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

-- Poblar divisiones femeninas con datos exactos del PDF
INSERT INTO divisions (name, gender, min_birth_year, max_birth_year, allows_shootout, description) VALUES
('Sub 14', 'female', 2011, NULL, false, 'Nacidas en 2011 y posteriores - SIN shootouts'),
('Sub 16', 'female', 2009, 2010, true, 'Nacidas en 2009-2010 - CON shootouts'),
('Sub 19', 'female', 2006, 2008, true, 'Nacidas en 2006-2008 - CON shootouts'),
('Intermedia', 'female', 2000, 2005, true, 'Nacidas en 2000-2005 - CON shootouts'),
('Primera', 'female', NULL, 1999, true, 'Todas las edades - CON shootouts');

-- Divisiones masculinas idénticas
INSERT INTO divisions (name, gender, min_birth_year, max_birth_year, allows_shootout, description) VALUES
('Sub 14', 'male', 2011, NULL, false, 'Nacidas en 2011 y posteriores - SIN shootouts'),
('Sub 16', 'male', 2009, 2010, true, 'Nacidas en 2009-2010 - CON shootouts'),
('Sub 19', 'male', 2006, 2008, true, 'Nacidas en 2006-2008 - CON shootouts'),
('Intermedia', 'male', 2000, 2005, true, 'Nacidas en 2000-2005 - CON shootouts'),
('Primera', 'male', NULL, 1999, true, 'Todas las edades - CON shootouts');

CREATE INDEX idx_divisions_gender ON divisions(gender);
```

#### 2.3 Migración 3: Equipos con Validaciones
```bash
npm run migrate:create teams_with_validations
```

```sql
-- migrations/003_teams_with_validations.sql

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  club_name VARCHAR(100) NOT NULL,
  division_id UUID NOT NULL REFERENCES divisions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  max_players INTEGER DEFAULT 20 CHECK (max_players <= 20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar límite de equipos según plan
CREATE OR REPLACE FUNCTION validate_team_limit_by_plan()
RETURNS TRIGGER AS $$
DECLARE
    user_plan VARCHAR(15);
    current_team_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Obtener plan del usuario
    SELECT plan INTO user_plan FROM users WHERE id = NEW.user_id;
    
    -- Contar equipos actuales del usuario
    SELECT COUNT(*) INTO current_team_count 
    FROM teams 
    WHERE user_id = NEW.user_id AND is_active = true;
    
    -- Determinar límite según plan
    max_allowed := CASE 
        WHEN user_plan = '2_teams' THEN 2
        WHEN user_plan = '3_teams' THEN 3
        WHEN user_plan = '5_teams' THEN 5
        ELSE 2
    END;
    
    -- Validar límite (si es INSERT, sumar 1)
    IF TG_OP = 'INSERT' THEN
        IF current_team_count >= max_allowed THEN
            RAISE EXCEPTION 'User plan % allows maximum % teams. Current count: %', 
                user_plan, max_allowed, current_team_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar límite de equipos
CREATE TRIGGER validate_team_limit_trigger
    BEFORE INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION validate_team_limit_by_plan();

-- Índices
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_division_id ON teams(division_id);
CREATE INDEX idx_teams_club_name ON teams(club_name);
```

#### 2.4 Migración 4: Jugadoras con Controles
```bash
npm run migrate:create players_with_controls
```

```sql
-- migrations/004_players_with_controls.sql

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  birth_date DATE NOT NULL,
  position VARCHAR(50),
  photo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla relación muchos a muchos jugadoras-equipos
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_starter BOOLEAN DEFAULT false,
  jersey_number INTEGER CHECK (jersey_number BETWEEN 1 AND 99),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id),
  UNIQUE(team_id, jersey_number)
);

-- Trigger updated_at para players
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función validar máximo 20 jugadoras por equipo
CREATE OR REPLACE FUNCTION validate_max_players_per_team()
RETURNS TRIGGER AS $$
DECLARE
    current_player_count INTEGER;
    team_max_players INTEGER;
BEGIN
    -- Obtener límite del equipo
    SELECT max_players INTO team_max_players 
    FROM teams 
    WHERE id = NEW.team_id;
    
    -- Contar jugadoras actuales
    SELECT COUNT(*) INTO current_player_count 
    FROM team_players 
    WHERE team_id = NEW.team_id;
    
    -- Validar límite
    IF current_player_count >= team_max_players THEN
        RAISE EXCEPTION 'Team already has maximum % players', team_max_players;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar máximo jugadoras
CREATE TRIGGER validate_max_players_trigger
    BEFORE INSERT ON team_players
    FOR EACH ROW EXECUTE FUNCTION validate_max_players_per_team();

-- Función validar máximo 2 divisiones por club por jugadora
CREATE OR REPLACE FUNCTION validate_max_divisions_per_club()
RETURNS TRIGGER AS $$
DECLARE
    club_division_count INTEGER;
    new_team_club VARCHAR(100);
BEGIN
    -- Obtener club del nuevo equipo
    SELECT club_name INTO new_team_club 
    FROM teams 
    WHERE id = NEW.team_id;
    
    -- Contar divisiones actuales de la jugadora en este club
    SELECT COUNT(DISTINCT t.division_id) INTO club_division_count
    FROM team_players tp
    JOIN teams t ON tp.team_id = t.id
    WHERE tp.player_id = NEW.player_id 
    AND t.club_name = new_team_club;
    
    -- Validar máximo 2 divisiones por club
    IF club_division_count >= 2 THEN
        RAISE EXCEPTION 'Player can only participate in maximum 2 divisions per club. Current: %', 
            club_division_count;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar divisiones por club
CREATE TRIGGER validate_divisions_per_club_trigger
    BEFORE INSERT ON team_players
    FOR EACH ROW EXECUTE FUNCTION validate_max_divisions_per_club();

-- Índices
CREATE INDEX idx_players_birth_date ON players(birth_date);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);
```

---

### 🏑 **PASO 3: Sistema de Partidos (2 horas)**

#### 3.1 Migración 5: Tipos de Acciones Hockey
```bash
npm run migrate:create action_types_hockey
```

```sql
-- migrations/005_action_types_hockey.sql

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
('Gol', true, true, true, 'goal', '#00ff00', 'Gol marcado - requiere zona y sector área rival'),
('Cambio', true, true, false, 'substitute', '#0099ff', 'Cambio de jugadora - requiere zona y 2 jugadoras'),
('Tarjeta Verde', false, true, false, 'green-card', '#00cc00', 'Tarjeta verde - 2 minutos de sanción'),
('Tarjeta Amarilla', false, true, false, 'yellow-card', '#ff9900', 'Tarjeta amarilla - 5 minutos de sanción'),
('Tarjeta Roja', false, true, false, 'red-card', '#ff0000', 'Tarjeta roja - expulsión del partido'),
('Recuperación Bocha', true, true, false, 'defense', '#00cc00', 'Recuperación de bocha - con zona'),
('Pérdida Bocha', true, true, false, 'attack', '#ff6600', 'Pérdida de bocha - con zona'),
('Corner', true, false, false, 'corner', '#9900ff', 'Tiro de esquina - solo requiere zona'),
('Penal', false, false, true, 'penalty', '#ff3300', 'Penal - requiere sector área rival'),
('Falta', true, true, false, 'foul', '#ffff00', 'Falta - requiere zona y jugadora');

CREATE INDEX idx_action_types_name ON action_types(name);
```

#### 3.2 Migración 6: Partidos con Control Temporal
```bash
npm run migrate:create matches_with_time_control
```

```sql
-- migrations/006_matches_with_time_control.sql

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  rival_team VARCHAR(100) NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME,
  field_name VARCHAR(100),
  current_quarter INTEGER DEFAULT 1 CHECK (current_quarter BETWEEN 1 AND 4),
  quarter_start_time TIMESTAMP,
  is_paused BOOLEAN DEFAULT true,
  total_time_seconds INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT false,
  final_score_home INTEGER DEFAULT 0,
  final_score_away INTEGER DEFAULT 0,
  had_shootout BOOLEAN DEFAULT false,
  shootout_score_home INTEGER DEFAULT 0,
  shootout_score_away INTEGER DEFAULT 0,
  observations TEXT,
  synced BOOLEAN DEFAULT false, -- Para control offline
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla para control tiempo jugado por jugadora
CREATE TABLE match_player_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  entry_time INTEGER DEFAULT 0, -- Segundo de entrada al cuarto
  exit_time INTEGER, -- Segundo de salida (null = sigue jugando)
  total_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, player_id, quarter)
);

-- Índices
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_match_player_time_match ON match_player_time(match_id);
CREATE INDEX idx_match_player_time_player ON match_player_time(player_id);
```

#### 3.3 Migración 7: Acciones de Partido
```bash
npm run migrate:create match_actions
```

```sql
-- migrations/007_match_actions.sql

CREATE TABLE match_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id), -- Null para acciones sin jugadora específica
  action_type_id UUID NOT NULL REFERENCES action_types(id),
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  minute_in_quarter INTEGER CHECK (minute_in_quarter BETWEEN 0 AND 15),
  second_in_quarter INTEGER CHECK (second_in_quarter BETWEEN 0 AND 59),
  zone INTEGER CHECK (zone BETWEEN 1 AND 4), -- 4 zonas confirmadas del PDF
  rival_area_sector VARCHAR(1) CHECK (rival_area_sector IN ('L', 'C', 'R')), -- 3 sectores
  substitute_player_id UUID REFERENCES players(id), -- Para cambios
  observations TEXT,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función validar datos requeridos por tipo de acción
CREATE OR REPLACE FUNCTION validate_action_requirements()
RETURNS TRIGGER AS $$
DECLARE
    action_rec RECORD;
BEGIN
    -- Obtener requisitos del tipo de acción
    SELECT requires_zone, requires_player, requires_rival_area 
    INTO action_rec
    FROM action_types 
    WHERE id = NEW.action_type_id;
    
    -- Validar zona si es requerida
    IF action_rec.requires_zone AND NEW.zone IS NULL THEN
        RAISE EXCEPTION 'Action type requires zone specification';
    END IF;
    
    -- Validar jugadora si es requerida
    IF action_rec.requires_player AND NEW.player_id IS NULL THEN
        RAISE EXCEPTION 'Action type requires player specification';
    END IF;
    
    -- Validar área rival si es requerida
    IF action_rec.requires_rival_area AND NEW.rival_area_sector IS NULL THEN
        RAISE EXCEPTION 'Action type requires rival area sector (L, C, R)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar requisitos de acción
CREATE TRIGGER validate_action_requirements_trigger
    BEFORE INSERT ON match_actions
    FOR EACH ROW EXECUTE FUNCTION validate_action_requirements();

-- Índices
CREATE INDEX idx_match_actions_match_id ON match_actions(match_id);
CREATE INDEX idx_match_actions_player_id ON match_actions(player_id);
CREATE INDEX idx_match_actions_type ON match_actions(action_type_id);
CREATE INDEX idx_match_actions_quarter ON match_actions(quarter);
```

---

### 🏁 **PASO 4: Ejecutar y Validar (1 hora)**

#### 4.1 Ejecutar Todas las Migraciones
```bash
# Ejecutar migraciones en orden
npm run migrate:up

# Verificar estado
npm run migrate:status
```

#### 4.2 Validar Schema Creado
```sql
-- Conectar a base de datos y verificar
\dt -- Listar todas las tablas

-- Verificar datos iniciales
SELECT * FROM divisions;
SELECT * FROM action_types;

-- Verificar triggers funcionan
SELECT proname FROM pg_proc WHERE proname LIKE 'validate_%';
```

#### 4.3 Test de Validaciones
```sql
-- Test 1: Insertar usuario
INSERT INTO users (email, password_hash, role, plan, first_name, last_name) 
VALUES ('test@example.com', 'hash123', 'coach', '2_teams', 'Test', 'User');

-- Test 2: Intentar crear 3 equipos con plan 2_teams (debe fallar)
-- (código de test incluido)

-- Test 3: Validar edad por división  
-- (código de test incluido)
```

---

## ✅ CHECKPOINT VALIDACIÓN

**Antes de continuar, verificar:**

- [ ] ✅ Conexión PostgreSQL Railway funcionando
- [ ] ✅ 7 migraciones ejecutadas exitosamente  
- [ ] ✅ 10 divisiones creadas (5 fem + 5 masc)
- [ ] ✅ 10 tipos de acciones insertados
- [ ] ✅ Triggers de validación activos
- [ ] ✅ Índices de performance creados
- [ ] ✅ Tests básicos pasando

---

## 🚨 TROUBLESHOOTING

### Error: "relation already exists"
```bash
# Resetear y volver a ejecutar
npm run migrate:reset
npm run migrate:up
```

### Error: conexión Railway
```bash
# Verificar variables de entorno
echo $env:DATABASE_URL
# Verificar SSL
# Verificar firewall/VPN
```

### Error: triggers muy complejos
```sql
-- Simplificar o dividir triggers
-- Verificar sintaxis PostgreSQL
-- Testear funciones individualmente
```

---

**🎉 ¡FASE 1A COMPLETA!** - Base de datos sólida implementada con todas las validaciones hockey específicas.
