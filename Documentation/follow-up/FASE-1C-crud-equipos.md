# 🏑 FASE 1C: CRUD EQUIPOS COMPLETO
**Duración estimada:** 3-4 días  
**Prioridad:** 🔥 CRÍTICA  
**Estado:** ⏳ Pendiente (después de 1A y 1B)

---

## 🎯 OBJETIVO DE LA FASE
Implementar CRUD completo de equipos con todas las validaciones específicas de hockey: límites por plan de usuario, validaciones de edad por división, máximo 2 divisiones por club por jugadora, límite 20 jugadoras por equipo, y reglas de shootout según división.

---

## 📋 LISTADO DE TAREAS

### 🏗️ **GRUPO 1: Entidades y DTOs Core**

- [ ] **T3.1** Entidades de Dominio
  ```typescript
  // src/core/entities/Team.ts
  export interface Team {
    id: string;
    name: string;
    clubName: string;
    divisionId: string;
    userId: string;
    maxPlayers: number; // Default: 20
    createdAt: Date;
    updatedAt: Date;
  }
  
  // src/core/entities/Division.ts
  export interface Division {
    id: string;
    name: string; // 'Sub14', 'Sub16', 'Sub19', 'Inter', 'Primera'
    gender: 'male' | 'female';
    minBirthYear?: number;
    maxBirthYear?: number;
    allowsShootout: boolean;
  }
  ```
  - **Tiempo estimado:** 1 hora

- [ ] **T3.2** DTOs de Transferencia  
  ```typescript
  // src/core/dtos/TeamDTO.ts
  export interface CreateTeamDTO {
    name: string;
    clubName: string;
    divisionId: string;
    userId: string;
  }
  
  export interface UpdateTeamDTO {
    name?: string;
    clubName?: string;
    divisionId?: string;
  }
  
  export interface TeamResponseDTO {
    id: string;
    name: string;
    clubName: string;
    division: DivisionSummaryDTO;
    playerCount: number;
    maxPlayers: number;
    canAddPlayers: boolean;
  }
  ```
  - **Tiempo estimado:** 45 min

### 🔧 **GRUPO 2: Servicios de Validación**

- [ ] **T3.3** Servicio de Validación de Divisiones
  ```typescript
  // src/core/services/DivisionValidationService.ts
  export class DivisionValidationService {
    async validatePlayerAgeForDivision(birthDate: Date, divisionId: string): Promise<boolean>
    async validatePlayerDivisionLimits(playerId: string, clubName: string): Promise<boolean>
    async canPlayerJoinDivision(playerId: string, divisionId: string, clubName: string): Promise<ValidationResult>
    getDivisionShootoutRule(divisionId: string): Promise<boolean>
  }
  ```
  - **Tiempo estimado:** 2.5 horas

- [ ] **T3.4** Servicio de Validación de Planes  
  ```typescript
  // src/core/services/PlanValidationService.ts
  export class PlanValidationService {
    async validateTeamLimitForUser(userId: string): Promise<boolean>
    async getMaxTeamsForPlan(plan: Plan): number
    async getCurrentTeamCount(userId: string): Promise<number>
    async canUserCreateTeam(userId: string): Promise<ValidationResult>
  }
  ```
  - **Tiempo estimado:** 1.5 horas

- [ ] **T3.5** Servicio Principal de Teams
  ```typescript  
  // src/core/services/TeamService.ts
  export class TeamService {
    async createTeam(teamData: CreateTeamDTO): Promise<Team>
    async updateTeam(id: string, updateData: UpdateTeamDTO): Promise<Team>
    async deleteTeam(id: string, userId: string): Promise<void>
    async getTeamsByUser(userId: string): Promise<Team[]>
    async addPlayerToTeam(teamId: string, playerId: string): Promise<void>
    async removePlayerFromTeam(teamId: string, playerId: string): Promise<void>
    async getTeamWithPlayers(id: string): Promise<TeamWithPlayersDTO>
  }
  ```
  - **Tiempo estimado:** 4 horas

### 🗄️ **GRUPO 3: Repositorios**

- [ ] **T3.6** Repositorio de Equipos  
  ```typescript
  // src/infrastructure/repositories/TeamRepositoryPostgres.ts
  export class TeamRepositoryPostgres implements TeamRepository {
    async create(team: CreateTeamDTO): Promise<Team>
    async findById(id: string): Promise<Team | null>
    async findByUserId(userId: string): Promise<Team[]>
    async update(id: string, data: UpdateTeamDTO): Promise<Team>
    async delete(id: string): Promise<void>
    async countTeamsByUser(userId: string): Promise<number>
    async findByClubAndDivision(clubName: string, divisionId: string): Promise<Team[]>
  }
  ```
  - **Tiempo estimado:** 3 horas

- [ ] **T3.7** Repositorio de Divisiones
  ```typescript
  // src/infrastructure/repositories/DivisionRepositoryPostgres.ts
  export class DivisionRepositoryPostgres implements DivisionRepository {
    async findAll(): Promise<Division[]>
    async findById(id: string): Promise<Division | null>
    async findByGender(gender: string): Promise<Division[]>
    async validateAgeForDivision(birthDate: Date, divisionId: string): Promise<boolean>
  }
  ```
  - **Tiempo estimado:** 2 horas

### 🎮 **GRUPO 4: Controladores y Rutas**

- [ ] **T3.8** Controlador de Equipos
  ```typescript
  // src/interfaces/controllers/TeamController.ts
  export class TeamController {
    async createTeam(req: Request, res: Response): Promise<void>
    async getTeams(req: Request, res: Response): Promise<void>
    async getTeamById(req: Request, res: Response): Promise<void>  
    async updateTeam(req: Request, res: Response): Promise<void>
    async deleteTeam(req: Request, res: Response): Promise<void>
    async addPlayer(req: Request, res: Response): Promise<void>
    async removePlayer(req: Request, res: Response): Promise<void>
  }
  ```
  - **Tiempo estimado:** 2.5 horas

- [ ] **T3.9** Controlador de Divisiones
  ```typescript
  // src/interfaces/controllers/DivisionController.ts
  export class DivisionController {
    async getAllDivisions(req: Request, res: Response): Promise<void>
    async getDivisionsByGender(req: Request, res: Response): Promise<void>
    async getDivisionRules(req: Request, res: Response): Promise<void>
  }
  ```
  - **Tiempo estimado:** 1 hora

- [ ] **T3.10** Rutas con Middleware de Autorización
  ```typescript
  // src/interfaces/routes/teamRoutes.ts
  router.post('/teams', 
    requireAuth, 
    requireRole(['admin', 'coach']),
    validateCreateTeam,
    teamController.createTeam
  );
  
  router.get('/teams', 
    requireAuth, 
    teamController.getTeams
  );
  
  router.delete('/teams/:id', 
    requireAuth, 
    requireOwnership('team'),
    teamController.deleteTeam
  );
  ```
  - **Tiempo estimado:** 1.5 horas

---

## 🔧 VALIDACIONES ESPECÍFICAS DE HOCKEY

### � **Reglas de División por Edad:**
```typescript
const DIVISION_RULES = {
  'Sub14': { minBirthYear: 2011, maxBirthYear: null, allowsShootout: false },
  'Sub16': { minBirthYear: 2009, maxBirthYear: 2010, allowsShootout: true },
  'Sub19': { minBirthYear: 2006, maxBirthYear: 2008, allowsShootout: true },
  'Inter': { minBirthYear: 2000, maxBirthYear: 2005, allowsShootout: true },
  'Primera': { minBirthYear: null, maxBirthYear: 1999, allowsShootout: true }
};
```

### 📊 **Límites por Plan:**
```typescript
const PLAN_LIMITS = {
  '2_teams': { maxTeams: 2, maxPlayersPerTeam: 20 },
  '3_teams': { maxTeams: 3, maxPlayersPerTeam: 20 },
  '5_teams': { maxTeams: 5, maxPlayersPerTeam: 20 }
};
```

### 🏑 **Reglas de Participación:**
- Máximo **2 divisiones por club** por jugadora
- Solo divisiones **iguales o inferiores** (Sub19 puede jugar Inter, pero no Primera)
- **20 jugadoras máximo** por equipo (11 titulares + 9 suplentes)

---

## ✅ CRITERIOS DE ACEPTACIÓN

### 🎯 **Funcionales:**
- [ ] Crear equipo validando límite plan usuario
- [ ] Validar edad jugadora según división seleccionada  
- [ ] Impedir más de 2 divisiones por club por jugadora
- [ ] Limitar 20 jugadoras por equipo
- [ ] Aplicar reglas shootout según división
- [ ] Solo propietario puede editar/eliminar equipo

### 🔧 **Técnicos:**
- [ ] Validaciones en capa de dominio (no solo BD)
- [ ] Transacciones para operaciones multi-tabla
- [ ] Middleware de autorización funcionando
- [ ] Mensajes de error descriptivos
- [ ] Logs de auditoría para cambios críticos

### 🧪 **Testing:**
- [ ] Test crear equipo con plan básico (max 2)
- [ ] Test validación edad Sub14 vs Primera
- [ ] Test límite 2 divisiones por club
- [ ] Test límite 20 jugadoras por equipo
- [ ] Test autorización solo propietario

---

## 🔗 INTEGRACIÓN CON OTRAS FASES

### 📤 **Salidas de esta fase:**
- CRUD equipos completamente funcional
- Validaciones hockey implementadas
- API endpoints documentados y probados
- Base sólida para sistema de asistencias

### 📥 **Entradas necesarias:**
- ✅ Sistema de autenticación funcionando (Fase 1B)
- ✅ Tabla usuarios, teams, divisions pobladas (Fase 1A)
- ✅ Middleware de autorización disponible

---

## 🚨 POSIBLES BLOQUEADORES

1. **Validaciones muy complejas** → Dividir en validaciones más simples
2. **Performance queries múltiples** → Optimizar con joins e índices  
3. **Conflictos concurrencia** → Implementar transacciones adecuadas
4. **UI necesita datos no previstos** → Ajustar DTOs según frontend

---

## 📊 PROGRESO ACTUAL

```
📊 Progreso: 0/10 tareas completadas (0%)
⏱️ Tiempo invertido: 0 horas
📅 Inicio: [Después de completar Fases 1A y 1B]  
🎯 Fin estimado: [Fecha inicio + 3-4 días]
```

---

## 📝 NOTAS Y OBSERVACIONES

```
[Espacio para notas durante implementación]

- Validaciones adicionales encontradas:
- Optimizaciones de queries:
- Cambios en reglas de negocio:
- Feedback de testing:
```

---

**🏑 HOCKEY RULES!** - La base sólida del sistema de gestión deportiva.
