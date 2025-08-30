/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Entidad Team
 * 
 * Entidad principal para representar equipos de hockey
 * con validaciones específicas del deporte y límites de plan
 */

export interface Team {
  /** Identificador único del equipo */
  id: string;
  
  /** Nombre del equipo */
  name: string;
  
  /** Nombre del club al que pertenece */
  clubName: string;
  
  /** ID de la división en la que compite */
  divisionId: string;
  
  /** ID del usuario propietario del equipo */
  userId: string;
  
  /** Máximo de jugadoras permitidas (default: 20) */
  maxPlayers: number;
  
  /** Fecha de creación */
  createdAt: Date;
  
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Entidad extendida para incluir información de la división
 * Utilizada en respuestas que necesitan datos completos
 */
export interface TeamWithDivision extends Team {
  division: {
    id: string;
    name: string;
    gender: 'male' | 'female';
    allowsShootout: boolean;
  };
}

/**
 * Entidad completa para incluir jugadoras
 * Utilizada para vistas detalladas del equipo
 */
export interface TeamWithPlayers extends TeamWithDivision {
  players: Array<{
    id: string;
    name: string;
    birthDate: Date;
    position: string;
    isActive: boolean;
  }>;
  playerCount: number;
  canAddPlayers: boolean;
}

/**
 * Resumen de equipo para listas
 * Optimizado para rendimiento en consultas masivas
 */
export interface TeamSummary {
  id: string;
  name: string;
  clubName: string;
  divisionName: string;
  playerCount: number;
  maxPlayers: number;
  canAddPlayers: boolean;
}
