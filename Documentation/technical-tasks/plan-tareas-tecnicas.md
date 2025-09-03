# PLAN DE TAREAS TÉCNICAS
## Sistema de Gestión de Jugadores de Hockey

**Fecha:** 22 de agosto de 2025  
**Versión:** 1.0  
**Estado:** En desarrollo activo

---

## 🎯 METODOLOGÍA DE DESARROLLO

### Enfoque: **Desarrollo Incremental por Módulos**
- ✅ **Arquitectura Hexagonal:** Mantenida y respetada
- 🔄 **Backend First:** Completar API antes que frontend
- 📱 **Mobile Responsive:** Diseño mobile-first
- 🔌 **Offline First:** Capacidades offline robustas
- 🧪 **Testing Continuo:** Tests unitarios e integración

---

## 📋 FASE 1: FUNDACIÓN TÉCNICA (Semanas 1-3)

### 🗄️ TASK 1.1: Esquema de Base de Datos Completo
**Prioridad:** 🔥 CRÍTICA  
**Estimación:** 2-3 días  
**Estado:** ⏳ Pendiente

#### Subtareas:
```sql
-- 1.1.1 Migración sistema usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'coach', -- 'admin', 'coach'
  plan VARCHAR(20) NOT NULL DEFAULT '2_teams', -- '2_teams', '3_teams', '5_teams'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  club_name VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.2 Migración equipos
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  division VARCHAR(50) NOT NULL, -- 'Sub14', 'Sub16', 'Sub19', 'Inter', 'Primera'
  category VARCHAR(20) NOT NULL, -- 'femenino', 'masculino'
  season VARCHAR(20) NOT NULL,
  max_players INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.3 Migración relación players-teams
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  position VARCHAR(50), -- 'Arquera', 'Defensora', 'Volante', 'Delantera'
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id),
  UNIQUE(team_id, jersey_number)
);

-- 1.1.4 Migración asistencias
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'present', 'late', 'absent'
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id, date)
);

-- 1.1.5 Migración formaciones
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  rival_team VARCHAR(200),
  match_date DATE,
  match_time TIME,
  venue VARCHAR(300),
  presentation_time TIME,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.6 Migración jugadores en formación
CREATE TABLE formation_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  position_x DECIMAL(5,2), -- Coordenada X en cancha
  position_y DECIMAL(5,2), -- Coordenada Y en cancha
  is_starter BOOLEAN DEFAULT true,
  position_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.7 Migración partidos
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID REFERENCES formations(id),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  rival_team VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  venue VARCHAR(300),
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'finished'
  quarter INTEGER DEFAULT 1, -- 1, 2, 3, 4
  time_elapsed INTEGER DEFAULT 0, -- Segundos transcurridos
  is_paused BOOLEAN DEFAULT false,
  offline_data JSONB, -- Para datos offline
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.8 Migración tipos de acciones configurables
CREATE TABLE action_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  requires_player BOOLEAN DEFAULT true,
  requires_zone BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.9 Migración acciones de partido
CREATE TABLE match_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  action_type_id UUID REFERENCES action_types(id),
  player_id UUID REFERENCES players(id),
  quarter INTEGER NOT NULL,
  time_in_quarter INTEGER NOT NULL, -- Segundos en el cuarto
  zone VARCHAR(20), -- 'zone_1', 'zone_2', 'zone_3', 'zone_4', 'area_central', 'area_left', 'area_right'
  observations TEXT,
  synced BOOLEAN DEFAULT false, -- Para control offline
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1.10 Migración control tiempo jugado
CREATE TABLE match_player_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL,
  entry_time INTEGER DEFAULT 0, -- Segundo de entrada al cuarto
  exit_time INTEGER, -- Segundo de salida (null = sigue jugando)
  total_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Criterios de aceptación:
- [ ] Todas las tablas creadas sin errores
- [ ] Relaciones FK funcionando correctamente
- [ ] Índices de performance creados
- [ ] Scripts de migración versionados

---

### 🔐 TASK 1.2: Sistema de Autenticación Completo
**Prioridad:** 🔥 CRÍTICA  
**Estimación:** 3-4 días  
**Estado:** ⏳ Pendiente

#### 1.2.1 Backend Authentication
```typescript
// src/core/entities/User.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  firstName: string;
  lastName: string;
  clubName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// src/core/services/AuthService.ts
export class AuthService {
  async login(email: string, password: string): Promise<AuthResult>
  async register(userData: CreateUserDto): Promise<User>
  async validateToken(token: string): Promise<User>
  async refreshToken(token: string): Promise<string>
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  async resetPassword(email: string): Promise<void>
}

// src/interfaces/http/controllers/AuthController.ts
export class AuthController {
  async login(req: Request, res: Response): Promise<void>
  async register(req: Request, res: Response): Promise<void>
  async logout(req: Request, res: Response): Promise<void>
  async refreshToken(req: Request, res: Response): Promise<void>
  async profile(req: Request, res: Response): Promise<void>
  async changePassword(req: Request, res: Response): Promise<void>
}
```

#### 1.2.2 Middlewares de Autorización
```typescript
// src/interfaces/http/middlewares/auth.ts
export const authenticateToken = async (req: Request, res: Response, next: NextFunction)
export const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction)
export const requirePlan = (plans: string[]) => (req: Request, res: Response, next: NextFunction)
export const requireOwnership = (resource: string) => (req: Request, res: Response, next: NextFunction)
```

#### 1.2.3 Gestión de Sesiones y JWT
```typescript
// src/infrastructure/security/JwtService.ts
export class JwtService {
  generateAccessToken(user: User): string
  generateRefreshToken(user: User): string
  verifyAccessToken(token: string): UserPayload
  verifyRefreshToken(token: string): UserPayload
}

// src/infrastructure/security/PasswordService.ts
export class PasswordService {
  async hashPassword(password: string): Promise<string>
  async verifyPassword(password: string, hash: string): Promise<boolean>
  generateSecurePassword(): string
}
```

#### Criterios de aceptación:
- [ ] Login/logout funcionando
- [ ] Registro de usuarios restringido a admin
- [ ] JWT tokens con refresh
- [ ] Middleware de autorización por roles
- [ ] Validación de planes de usuario
- [ ] Encriptación segura de contraseñas
- [ ] Endpoints protegidos funcionando

---

### 👥 TASK 1.3: CRUD Completo de Equipos
**Prioridad:** 🔥 CRÍTICA  
**Estimación:** 3-4 días  
**Estado:** ⏳ Pendiente

#### 1.3.1 Entidades y Servicios
```typescript
// src/core/entities/Team.ts
export interface Team {
  id: string;
  coachId: string;
  name: string;
  division: Division;
  category: 'femenino' | 'masculino';
  season: string;
  maxPlayers: number;
  players?: TeamPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamPlayer {
  id: string;
  teamId: string;
  playerId: string;
  position: Position;
  jerseyNumber: number;
  isActive: boolean;
  joinedAt: Date;
  player?: Player;
}

export type Division = 'Sub14' | 'Sub16' | 'Sub19' | 'Inter' | 'Primera';
export type Position = 'Arquera' | 'Defensora' | 'Volante' | 'Delantera';

// src/core/services/TeamService.ts
export class TeamService {
  async createTeam(coachId: string, teamData: CreateTeamDto): Promise<Team>
  async getTeamsByCoach(coachId: string): Promise<Team[]>
  async getTeamById(id: string, coachId: string): Promise<Team>
  async updateTeam(id: string, coachId: string, updates: UpdateTeamDto): Promise<Team>
  async deleteTeam(id: string, coachId: string): Promise<void>
  
  // Gestión de jugadores en equipo
  async addPlayerToTeam(teamId: string, playerId: string, coachId: string): Promise<TeamPlayer>
  async removePlayerFromTeam(teamId: string, playerId: string, coachId: string): Promise<void>
  async updatePlayerInTeam(teamId: string, playerId: string, coachId: string, updates: UpdateTeamPlayerDto): Promise<TeamPlayer>
  
  // Validaciones de negocio
  async validateTeamLimits(coachId: string): Promise<boolean>
  async validatePlayerDivisionLimits(playerId: string, teamId: string): Promise<boolean>
}
```

#### 1.3.2 Controladores HTTP
```typescript
// src/interfaces/http/controllers/TeamController.ts
export class TeamController {
  // CRUD equipos
  async createTeam(req: Request, res: Response): Promise<void>
  async getTeams(req: Request, res: Response): Promise<void>
  async getTeamById(req: Request, res: Response): Promise<void>
  async updateTeam(req: Request, res: Response): Promise<void>
  async deleteTeam(req: Request, res: Response): Promise<void>
  
  // Gestión jugadores
  async addPlayer(req: Request, res: Response): Promise<void>
  async removePlayer(req: Request, res: Response): Promise<void>
  async updatePlayerInTeam(req: Request, res: Response): Promise<void>
  async getTeamPlayers(req: Request, res: Response): Promise<void>
  
  // Utilidades
  async getAvailablePlayers(req: Request, res: Response): Promise<void>
  async validateTeamLimits(req: Request, res: Response): Promise<void>
}
```

#### 1.3.3 Validaciones de Negocio
```typescript
// src/core/services/ValidationService.ts
export class ValidationService {
  // Validar límites por plan
  async validateCoachTeamLimit(coachId: string, plan: string): Promise<ValidationResult>
  
  // Validar jugadora en máximo 2 divisiones
  async validatePlayerDivisionLimit(playerId: string, newTeamId: string): Promise<ValidationResult>
  
  // Validar máximo 20 jugadoras por equipo
  async validateTeamPlayerLimit(teamId: string): Promise<ValidationResult>
  
  // Validar número de camiseta único
  async validateJerseyNumber(teamId: string, jerseyNumber: number, excludePlayerId?: string): Promise<ValidationResult>
}
```

#### Criterios de aceptación:
- [ ] CRUD completo de equipos funcionando
- [ ] Validación de límites por plan de usuario
- [ ] Asignación/desasignación de jugadoras
- [ ] Validación máximo 2 divisiones por jugadora
- [ ] Validación máximo 20 jugadoras por equipo
- [ ] Números de camiseta únicos por equipo
- [ ] Filtros por división y categoría
- [ ] Paginación en listados

---

## 📋 FASE 2: FUNCIONALIDADES CORE (Semanas 4-7)

### 📊 TASK 2.1: Sistema de Asistencias
**Prioridad:** 🟡 ALTA  
**Estimación:** 2-3 días  
**Estado:** ⏳ Pendiente

#### 2.1.1 Backend Asistencias
```typescript
// src/core/entities/Attendance.ts
export interface Attendance {
  id: string;
  teamId: string;
  playerId: string;
  date: Date;
  status: 'present' | 'late' | 'absent';
  observations?: string;
  createdAt: Date;
}

// src/core/services/AttendanceService.ts
export class AttendanceService {
  async recordAttendance(teamId: string, date: Date, attendances: AttendanceRecord[]): Promise<Attendance[]>
  async getAttendanceByTeamAndDate(teamId: string, date: Date): Promise<Attendance[]>
  async getAttendanceHistory(teamId: string, startDate: Date, endDate: Date): Promise<Attendance[]>
  async getPlayerAttendanceStats(playerId: string, teamId: string): Promise<AttendanceStats>
  async getTeamAttendanceReport(teamId: string, month: number, year: number): Promise<AttendanceReport>
}
```

### 🏗️ TASK 2.2: Sistema de Formaciones Básico
**Prioridad:** 🟡 ALTA  
**Estimación:** 4-5 días  
**Estado:** ⏳ Pendiente

#### 2.2.1 Backend Formaciones
```typescript
// src/core/entities/Formation.ts
export interface Formation {
  id: string;
  teamId: string;
  name: string;
  rivalTeam?: string;
  matchDate?: Date;
  matchTime?: string;
  venue?: string;
  presentationTime?: string;
  isTemplate: boolean;
  players: FormationPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FormationPlayer {
  id: string;
  formationId: string;
  playerId: string;
  positionX: number;
  positionY: number;
  isStarter: boolean;
  positionName: string;
  player?: Player;
}

// src/core/services/FormationService.ts
export class FormationService {
  async createFormation(teamId: string, coachId: string, formationData: CreateFormationDto): Promise<Formation>
  async getFormationsByTeam(teamId: string, coachId: string): Promise<Formation[]>
  async getFormationById(id: string, coachId: string): Promise<Formation>
  async updateFormation(id: string, coachId: string, updates: UpdateFormationDto): Promise<Formation>
  async deleteFormation(id: string, coachId: string): Promise<void>
  async cloneFormation(id: string, coachId: string, newMatchData: MatchData): Promise<Formation>
  async exportFormationAsImage(id: string, coachId: string): Promise<Buffer>
}
```

### 🏑 TASK 2.3: Sistema de Partidos Offline
**Prioridad:** 🔥 CRÍTICA  
**Estimación:** 5-6 días  
**Estado:** ⏳ Pendiente

#### 2.3.1 Backend Partidos
```typescript
// src/core/entities/Match.ts
export interface Match {
  id: string;
  formationId: string;
  teamId: string;
  rivalTeam: string;
  date: Date;
  venue?: string;
  status: 'scheduled' | 'in_progress' | 'finished';
  quarter: number;
  timeElapsed: number;
  isPaused: boolean;
  offlineData?: any;
  actions: MatchAction[];
  playerTimes: MatchPlayerTime[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchAction {
  id: string;
  matchId: string;
  actionTypeId: string;
  playerId?: string;
  quarter: number;
  timeInQuarter: number;
  zone?: string;
  observations?: string;
  synced: boolean;
  actionType?: ActionType;
  player?: Player;
  createdAt: Date;
}

// src/core/services/MatchService.ts
export class MatchService {
  // Control de partido
  async startMatch(formationId: string, coachId: string): Promise<Match>
  async pauseMatch(matchId: string, coachId: string): Promise<Match>
  async resumeMatch(matchId: string, coachId: string): Promise<Match>
  async nextQuarter(matchId: string, coachId: string): Promise<Match>
  async finishMatch(matchId: string, coachId: string): Promise<Match>
  
  // Registro de acciones
  async addAction(matchId: string, actionData: CreateMatchActionDto): Promise<MatchAction>
  async removeAction(actionId: string, coachId: string): Promise<void>
  async getMatchActions(matchId: string, coachId: string): Promise<MatchAction[]>
  
  // Control de cambios
  async recordSubstitution(matchId: string, playerOut: string, playerIn: string, zone: string): Promise<void>
  async getPlayerTime(matchId: string, playerId: string): Promise<MatchPlayerTime[]>
  
  // Sincronización offline
  async syncOfflineData(matchId: string, offlineActions: OfflineAction[]): Promise<SyncResult>
}
```

---

## 📋 FASE 3: INTERFACES USUARIO (Semanas 8-10)

### 🎨 TASK 3.1: Frontend Base con Autenticación
**Prioridad:** 🟡 ALTA  
**Estimación:** 3-4 días  
**Estado:** ⏳ Pendiente

#### 3.1.1 Componentes de Autenticación
```typescript
// frontend/src/components/auth/LoginForm.tsx
export const LoginForm: React.FC = () => {
  // Formulario de login con validación
}

// frontend/src/components/auth/AuthProvider.tsx
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Context provider para autenticación global
}

// frontend/src/hooks/useAuth.ts
export const useAuth = () => {
  // Hook personalizado para gestión de autenticación
}
```

### 👥 TASK 3.2: Interfaces de Gestión de Equipos
**Prioridad:** 🟡 ALTA  
**Estimación:** 4-5 días  
**Estado:** ⏳ Pendiente

#### 3.2.1 Componentes de Equipos
```typescript
// frontend/src/components/teams/TeamList.tsx
export const TeamList: React.FC = () => {
  // Lista de equipos del entrenador
}

// frontend/src/components/teams/TeamForm.tsx
export const TeamForm: React.FC<TeamFormProps> = ({ team, onSave }) => {
  // Formulario crear/editar equipo
}

// frontend/src/components/teams/PlayerAssignment.tsx
export const PlayerAssignment: React.FC<PlayerAssignmentProps> = ({ teamId }) => {
  // Asignación de jugadores a equipo
}
```

### 📋 TASK 3.3: Interfaces de Asistencias
**Prioridad:** 🟡 MEDIA  
**Estimación:** 2-3 días  
**Estado:** ⏳ Pendiente

---

## 📋 FASE 4: FUNCIONALIDADES AVANZADAS (Semanas 11-13)

### 🏗️ TASK 4.1: Formaciones Tácticas Visuales
**Prioridad:** 🟡 ALTA  
**Estimación:** 5-6 días  
**Estado:** ⏳ Pendiente

#### 4.1.1 Componente Cancha Interactiva
```typescript
// frontend/src/components/formations/TacticalField.tsx
export const TacticalField: React.FC<TacticalFieldProps> = ({ formation, onPlayerMove }) => {
  // Cancha visual con drag & drop
  // Representación gráfica posiciones
  // Fotos de jugadoras
}

// frontend/src/components/formations/FormationExport.tsx
export const FormationExport: React.FC<FormationExportProps> = ({ formation }) => {
  // Export a imagen/PDF
}
```

### 📊 TASK 4.2: Sistema de Reportes y Descargas
**Prioridad:** 🟡 ALTA  
**Estimación:** 4-5 días  
**Estado:** ⏳ Pendiente

#### 4.2.1 Generación de Reportes para Descarga
```typescript
// backend/src/services/ReportService.ts
export class ReportService {
  async generateFormationImage(teamId: string, matchInfo: MatchInfo): Promise<Buffer>
  async generateMatchReportPDF(matchId: string, options: ReportOptions): Promise<Buffer>
  async generateHeatMapPNG(matchId: string, filters: HeatMapFilters): Promise<Buffer>
  async exportMatchDataCSV(matchId: string): Promise<string>
}

// frontend/src/components/reports/DownloadCenter.tsx
export const DownloadCenter: React.FC<DownloadCenterProps> = ({ match }) => {
  // Botones descarga por tipo
  // Vista previa documentos
  // Historial descargas
  // Formatos: PNG (1080x1350px), PDF, CSV, JSON
}
```

#### 4.2.2 Mapas de Calor Descargables
```typescript
// frontend/src/components/reports/HeatMap.tsx
export const HeatMap: React.FC<HeatMapProps> = ({ matchData, actionType }) => {
  // Visualización mapas de calor
  // Cancha dividida en zonas
  // Intensidad por frecuencia
  // Export PNG para descarga
}

// frontend/src/components/reports/StatisticsPanel.tsx
export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ match }) => {
  // Panel estadísticas detalladas
  // Botón "Generar PDF"
  // Sin envío automático WhatsApp
}
```

### 🏑 TASK 4.3: Sistema de Partidos Tiempo Real
**Prioridad:** 🔥 CRÍTICA  
**Estimación:** 6-7 días  
**Estado:** ⏳ Pendiente

#### 4.3.1 Interfaz Tiempo Real
```typescript
// frontend/src/components/match/MatchController.tsx
export const MatchController: React.FC<MatchControllerProps> = ({ match }) => {
  // Cronómetro por cuartos
  // Control play/pause
  // Registro acciones en tiempo real
}

// frontend/src/components/match/ActionRecorder.tsx
export const ActionRecorder: React.FC<ActionRecorderProps> = ({ match }) => {
  // Botones acciones rápidas
  // Selección jugadora/zona
  // Funcionalidad offline
}
```

---

## 📋 FASE 5: OPTIMIZACIÓN Y DEPLOY (Semanas 14-15)

### 🔌 TASK 5.1: Optimización Offline
**Prioridad:** 🟡 ALTA  
**Estimación:** 3-4 días  
**Estado:** ⏳ Pendiente

### 📱 TASK 5.2: Optimización Mobile
**Prioridad:** 🟡 ALTA  
**Estimación:** 2-3 días  
**Estado:** ⏳ Pendiente

### 🚀 TASK 5.3: Deploy Producción
**Prioridad:** 🟡 ALTA  
**Estimación:** 2-3 días  
**Estado:** ⏳ Pendiente

---

## 🎯 RESUMEN DE PRIORIDADES

### 🔥 CRÍTICAS (Semana 1-3):
1. Esquema base de datos completo
2. Sistema autenticación
3. CRUD equipos completo

### 🟡 ALTAS (Semana 4-10):
4. Sistema asistencias
5. Formaciones básicas
6. Partidos offline
7. Frontend básico

### 🔵 MEDIAS (Semana 11-15):
8. Formaciones visuales
9. Reportes avanzados
10. Optimización mobile
11. Deploy producción

---

**Total estimado:** 15 semanas de desarrollo  
**Estado actual:** Fase 1 iniciada (15% completado)  
**Próximo milestone:** Base de datos completa + Autenticación funcionando
