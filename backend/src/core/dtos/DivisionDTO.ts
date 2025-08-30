/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - DTOs para Divisions
 * 
 * Data Transfer Objects para operaciones con divisiones
 * y validaciones específicas de hockey
 */

/**
 * DTO de respuesta básica para divisiones
 */
export interface DivisionResponseDTO {
  /** ID único de la división */
  id: string;
  
  /** Nombre de la división */
  name: string;
  
  /** Género de la división */
  gender: 'male' | 'female';
  
  /** Si permite shootout */
  allowsShootout: boolean;
  
  /** Descripción de la división */
  description: string;
  
  /** Rango de edad representado como string */
  ageRange: string;
  
  /** Si está activa */
  isActive: boolean;
}

/**
 * DTO detallado de división con reglas y estadísticas
 */
export interface DivisionDetailDTO extends DivisionResponseDTO {
  /** Año mínimo de nacimiento */
  minBirthYear?: number;
  
  /** Año máximo de nacimiento */
  maxBirthYear?: number;
  
  /** Cantidad de equipos en esta división */
  teamCount: number;
  
  /** Cantidad total de jugadoras */
  totalPlayers: number;
  
  /** Promedio de jugadoras por equipo */
  averagePlayersPerTeam: number;
  
  /** Reglas específicas */
  rules: {
    maxPlayersPerTeam: number;
    allowsShootout: boolean;
    canPlayInHigherDivisions: boolean;
  };
  
  /** Fecha de creación */
  createdAt: Date;
}

/**
 * DTO para validación de edad en división
 */
export interface AgeValidationDTO {
  /** Si la edad es válida para la división */
  isValid: boolean;
  
  /** Fecha de nacimiento evaluada */
  birthDate: Date;
  
  /** Edad calculada */
  age: number;
  
  /** ID de la división evaluada */
  divisionId: string;
  
  /** Mensaje de error si no es válida */
  errorMessage?: string;
  
  /** Divisiones alternativas sugeridas */
  suggestedDivisions?: DivisionResponseDTO[];
}

/**
 * DTO para reglas de división específica
 */
export interface DivisionRulesDTO {
  /** ID de la división */
  divisionId: string;
  
  /** Nombre de la división */
  divisionName: string;
  
  /** Reglas de edad */
  ageRules: {
    hasMinAge: boolean;
    hasMaxAge: boolean;
    minBirthYear?: number;
    maxBirthYear?: number;
    description: string;
  };
  
  /** Reglas de juego */
  gameRules: {
    allowsShootout: boolean;
    maxPlayersPerTeam: number;
    substitutions: number;
  };
  
  /** Reglas de participación */
  participationRules: {
    canPlayInHigherDivisions: boolean;
    maxDivisionsPerClub: number;
    requiresParentalConsent: boolean;
  };
}

/**
 * DTO para filtros de división
 */
export interface DivisionFiltersDTO {
  /** Filtrar por género */
  gender?: 'male' | 'female';
  
  /** Filtrar solo divisiones activas */
  activeOnly?: boolean;
  
  /** Filtrar por permiso de shootout */
  allowsShootout?: boolean;
  
  /** Ordenar por nombre o fecha */
  sortBy?: 'name' | 'createdAt' | 'teamCount';
  
  /** Dirección de ordenamiento */
  sortOrder?: 'asc' | 'desc';
}
