/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - DTOs para Teams
 * 
 * Data Transfer Objects para operaciones con equipos
 * Separación entre datos de entrada, salida y validaciones
 */

import { DivisionSummary } from '../entities/Division.js';

/**
 * DTO para crear un nuevo equipo
 */
export interface CreateTeamDTO {
  /** Nombre del equipo (requerido) */
  name: string;
  
  /** Nombre del club al que pertenece (requerido) */
  clubName: string;
  
  /** ID de la división en la que va a competir (requerido) */
  divisionId: string;
  
  /** ID del usuario propietario (se obtiene del token JWT) */
  userId: string;
  
  /** Máximo de jugadoras (opcional, default: 20) */
  maxPlayers?: number;
}

/**
 * DTO para actualizar un equipo existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface UpdateTeamDTO {
  /** Nuevo nombre del equipo */
  name?: string;
  
  /** Nuevo nombre del club */
  clubName?: string;
  
  /** Nueva división (con validaciones de elegibilidad) */
  divisionId?: string;
  
  /** Nuevo límite de jugadoras */
  maxPlayers?: number;
}

/**
 * DTO de respuesta para operaciones con equipos
 * Incluye información calculada y de contexto
 */
export interface TeamResponseDTO {
  /** ID único del equipo */
  id: string;
  
  /** Nombre del equipo */
  name: string;
  
  /** Nombre del club */
  clubName: string;
  
  /** Información de la división */
  division: DivisionSummary;
  
  /** Cantidad actual de jugadoras */
  playerCount: number;
  
  /** Máximo de jugadoras permitidas */
  maxPlayers: number;
  
  /** Si se pueden agregar más jugadoras */
  canAddPlayers: boolean;
  
  /** Si el usuario actual puede editar este equipo */
  canEdit: boolean;
  
  /** Si el usuario actual puede eliminar este equipo */
  canDelete: boolean;
  
  /** Fecha de creación */
  createdAt: Date;
  
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * DTO para respuesta detallada de equipo con jugadoras
 */
export interface TeamWithPlayersDTO extends TeamResponseDTO {
  /** Lista de jugadoras del equipo */
  players: PlayerSummaryDTO[];
  
  /** Posiciones disponibles/ocupadas */
  positionsSummary: {
    goalkeepers: number;
    defenders: number;
    midfielders: number;
    forwards: number;
    total: number;
  };
  
  /** Estadísticas adicionales del equipo */
  stats?: {
    averageAge: number;
    activePlayersCount: number;
    inactivePlayersCount: number;
  };
}

/**
 * DTO simplificado para jugadoras en contexto de equipo
 */
export interface PlayerSummaryDTO {
  id: string;
  name: string;
  birthDate: Date;
  age: number;
  position: string;
  isActive: boolean;
  joinedAt: Date;
}

/**
 * DTO para validación de creación de equipo
 * Incluye información sobre límites y restricciones
 */
export interface TeamValidationDTO {
  /** Si el usuario puede crear más equipos */
  canCreate: boolean;
  
  /** Equipos actuales del usuario */
  currentTeamCount: number;
  
  /** Límite máximo según el plan */
  maxTeamsAllowed: number;
  
  /** Equipos restantes que puede crear */
  remainingTeams: number;
  
  /** Plan actual del usuario */
  userPlan: string;
  
  /** Divisiones disponibles para crear equipos */
  availableDivisions: DivisionSummary[];
}

/**
 * DTO para filtros de búsqueda de equipos
 */
export interface TeamFiltersDTO {
  /** Filtrar por nombre de equipo */
  teamName?: string;
  
  /** Filtrar por club */
  clubName?: string;
  
  /** Filtrar por división */
  divisionId?: string;
  
  /** Filtrar por género de división */
  gender?: 'male' | 'female';
  
  /** Solo equipos con lugares disponibles */
  hasAvailableSpots?: boolean;
  
  /** Ordenar por campo específico */
  sortBy?: 'name' | 'clubName' | 'createdAt' | 'playerCount';
  
  /** Dirección del ordenamiento */
  sortOrder?: 'asc' | 'desc';
  
  /** Paginación */
  page?: number;
  
  /** Cantidad por página */
  limit?: number;
}

/**
 * DTO para respuesta paginada de equipos
 */
export interface PaginatedTeamsDTO {
  teams: TeamResponseDTO[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
