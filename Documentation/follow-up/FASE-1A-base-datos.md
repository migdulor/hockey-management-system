# 🗄️ FASE 1A: IMPLEMENTACIÓN BASE DE DATOS
**Duración estimada:** 2-3 días  
**Prioridad:** 🔥 CRÍTICA  
**Estado:** ✅ COMPLETADA

---

## 🎯 OBJETIVO DE LA FASE
Implementar el esquema completo de base de datos con todas las tablas, relaciones, validaciones y triggers necesarios para el sistema de hockey, basado en las especificaciones técnicas confirmadas del PDF.

---

## 📋 LISTADO DE TAREAS

### 🔧 **GRUPO 1: Configuración y Conexión BD**

- [✅] **T1.1** Configurar conexión PostgreSQL Railway
  - [✅] Verificar credenciales de conexión 
  - [✅] Configurar SSL y variables de entorno
  - [✅] Testear conectividad básica
  - **Tiempo estimado:** 30 min

- [✅] **T1.2** Setup herramientas de migración
  - [✅] Instalar/configurar herramienta de migraciones
  - [✅] Crear estructura de carpetas para migrations
  - [✅] Configurar scripts npm para migraciones
  - **Tiempo estimado:** 1 hora

### 🏗️ **GRUPO 2: Tablas Core del Sistema**

- [✅] **T1.3** Migración 1: Usuarios y Autenticación
  ```sql
  -- ✅ COMPLETADA: Tabla users con roles y planes
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'coach')),
    plan VARCHAR(15) CHECK (plan IN ('2_teams', '3_teams', '5_teams')),
    -- ... resto campos + triggers y validaciones
  );
  ```
  - **Tiempo estimado:** 45 min ✅

- [✅] **T1.4** Migración 2: Divisiones y Configuración Hockey
  ```sql
  -- ✅ COMPLETADA: Divisiones con edades exactas y shootout
  CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('female', 'male')),
    min_birth_year INTEGER,
    max_birth_year INTEGER,
    allows_shootout BOOLEAN DEFAULT true
    -- ... + todas las edades específicas insertadas
  );
  ```
  - **Tiempo estimado:** 1 hora ✅

- [✅] **T1.5** Migración 3: Equipos con Validaciones
  ```sql
  -- ✅ COMPLETADA: Tabla teams con límites por plan
  CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    club_name VARCHAR(100) NOT NULL,
    division_id UUID REFERENCES divisions(id),
    user_id UUID REFERENCES users(id),
    -- ... + triggers validación automática implementados
  );
  ```  
  - **Tiempo estimado:** 1 hora ✅

- [✅] **T1.6** Migración 4: Jugadoras con Controles División
  ```sql
  -- ✅ COMPLETADA: Tabla players con validaciones edad y límites
  CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    birth_date DATE NOT NULL,
    position VARCHAR(50),
    photo_url VARCHAR(255)
    -- ... + tabla team_players con todas las validaciones
  );
  ```
  - **Tiempo estimado:** 1 hora ✅

### 🎯 **GRUPO 3: Sistema de Partidos y Acciones**

- [✅] **T1.7** Migración 5: Tipos de Acciones Hockey
  ```sql
  -- ✅ COMPLETADA: 10 acciones específicas insertadas
  INSERT INTO action_types (name, requires_zone, requires_player, icon) VALUES
  ('Gol', true, true, 'goal'),
  ('Cambio', true, true, 'substitute'),
  ('Tarjeta Verde', false, true, 'green-card'),
  ('Tarjeta Amarilla', false, true, 'yellow-card'),
  ('Tarjeta Roja', false, true, 'red-card'),
  ('Recuperación Bocha', true, true, 'defense'),
  ('Pérdida Bocha', true, true, 'attack'),
  ('Corner', true, false, 'corner'),
  ('Penal', false, false, 'penalty'),
  ('Falta', true, true, 'foul');
  ```
  - **Tiempo estimado:** 45 min ✅

- [✅] **T1.8** Migración 6: Partidos con Control Temporal  
  ```sql
  -- ✅ COMPLETADA: Tabla matches con cronómetro 4 cuartos + validaciones shootout
  CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    rival_team VARCHAR(100) NOT NULL,
    match_date DATE NOT NULL,
    current_quarter INTEGER CHECK (current_quarter BETWEEN 1 AND 4),
    -- ... + control completo tiempo por cuarto + validaciones
  );
  ```
  - **Tiempo estimado:** 1.5 horas ✅

- [✅] **T1.9** Migración 7: Acciones de Partido
  ```sql
  -- ✅ COMPLETADA: Tabla match_actions con todas las validaciones
  CREATE TABLE match_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id),
    player_id UUID REFERENCES players(id),
    action_type_id UUID REFERENCES action_types(id),
    zone INTEGER CHECK (zone BETWEEN 1 AND 4),
    rival_area_sector VARCHAR(1) CHECK (rival_area_sector IN ('L', 'C', 'R'))
    -- ... + validaciones automáticas por tipo acción
  );
  ```
  - **Tiempo estimado:** 1.5 horas ✅

### 🔒 **GRUPO 4: Validaciones y Triggers**

- [✅] **T1.10** Triggers de Validación División
  ```sql
  -- ✅ COMPLETADA: Validar edad jugadora según división + función reutilizable
  CREATE OR REPLACE FUNCTION validate_birth_date_for_division()
  CREATE OR REPLACE FUNCTION validate_player_age_for_team_division()
  -- ... + múltiples triggers de validación automática
  ```
  - **Tiempo estimado:** 2 horas ✅

- [✅] **T1.11** Triggers Límites por Plan
  ```sql
  -- ✅ COMPLETADA: Validar máximo equipos según plan usuario + jugadoras por equipo
  CREATE OR REPLACE FUNCTION validate_team_limit_by_plan()
  CREATE OR REPLACE FUNCTION validate_max_players_per_team()
  CREATE OR REPLACE FUNCTION validate_max_divisions_per_club()
  -- ... + triggers automáticos implementados
  ```
  - **Tiempo estimado:** 1.5 horas ✅

- [✅] **T1.12** Índices de Performance
  ```sql
  -- Crear índices críticos para consultas frecuentes
  CREATE INDEX idx_players_birth_date ON players(birth_date);
  CREATE INDEX idx_match_actions_match_player ON match_actions(match_id, player_id);
  -- ... más índices
  ```
  - **Tiempo estimado:** 30 min

---

## ✅ CRITERIOS DE ACEPTACIÓN

### 🎯 **Funcionales:**
- [x] Todas las 8 migraciones ejecutadas sin errores
- [x] Datos de prueba insertados (divisiones, action_types)
- [x] Validaciones automáticas funcionando (edad, límites)
- [x] Triggers de negocio operativos

### 🔧 **Técnicos:**  
- [x] Conexión Railway estable
- [x] Scripts de migración versionados
- [x] Rollback funcional para cada migración
- [x] Índices de performance creados

### 🧪 **Testing:**
- [x] Test inserción usuarios con diferentes planes
- [x] Test validación edades por división  
- [x] Test límites máximos (equipos, jugadoras)
- [x] Test integridad referencial

---

## 🚨 POSIBLES BLOQUEADORES

1. **Conexión Railway inestable** → Verificar VPN/firewall
2. **Errores sintaxis SQL** → Validar en cliente local primero  
3. **Conflictos FK** → Orden correcto de migraciones
4. **Triggers complejos** → Dividir en funciones más simples

---

## 📊 PROGRESO ACTUAL

```
📊 Progreso: 0/12 tareas completadas (0%)
⏱️ Tiempo invertido: 0 horas
📅 Inicio: [Pendiente]
🎯 Fin estimado: [Fecha inicio + 2-3 días]
```

---

## 📝 NOTAS Y OBSERVACIONES

```
[Espacio para notas durante implementación]

- Problemas encontrados:
- Decisiones tomadas:  
- Cambios al plan original:
- Próximos pasos:
```

---

**⚡ READY TO START!** - Esta fase es la base fundamental de todo el sistema.
