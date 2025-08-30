import { Formation, FormationPosition } from '../entities/models.js';

export interface FormationRepository {
  create(formation: Formation): Promise<Formation>;
  findById(id: string): Promise<Formation | null>;
  findAll(options?: { 
    teamId?: string; 
    isTemplate?: boolean;
    templateCategory?: string;
    matchId?: string;
  }): Promise<Formation[]>;
  
  update(id: string, formation: Partial<Formation>): Promise<Formation>;
  delete(id: string): Promise<void>;
  
  // Métodos específicos para formaciones (US006, US007, US008)
  findByTeamId(teamId: string): Promise<Formation[]>;
  findTemplates(category?: string): Promise<Formation[]>;
  findByMatch(matchId: string): Promise<Formation | null>;
  
  // US006: Plantillas reutilizables
  cloneFormation(sourceFormationId: string, newName: string, targetTeamId?: string): Promise<string>;
  markAsTemplate(formationId: string, category: string): Promise<Formation>;
  
  // Incrementar contador de uso
  incrementUsageCount(formationId: string): Promise<void>;
  
  // Obtener formaciones con detalles completos
  findWithDetails(formationId: string): Promise<Formation & {
    positions: FormationPosition[];
    startersCount: number;
    substitutesCount: number;
  }>;
}

// Repositorio para posiciones en formaciones
export interface FormationPositionRepository {
  create(position: FormationPosition): Promise<FormationPosition>;
  findById(id: string): Promise<FormationPosition | null>;
  findByFormation(formationId: string): Promise<FormationPosition[]>;
  findByPlayer(playerId: string): Promise<FormationPosition[]>;
  
  update(id: string, position: Partial<FormationPosition>): Promise<FormationPosition>;
  delete(id: string): Promise<void>;
  
  // US006: Métodos específicos para drag & drop
  updatePosition(id: string, x: number, y: number): Promise<FormationPosition>;
  updatePositions(positions: Array<{ id: string; x: number; y: number }>): Promise<FormationPosition[]>;
  
  // Validaciones
  getStartersCount(formationId: string): Promise<number>;
  getSubstitutesCount(formationId: string): Promise<number>;
  
  // Obtener posiciones ordenadas
  findStartersByPosition(formationId: string): Promise<FormationPosition[]>;
  findSubstitutesByPosition(formationId: string): Promise<FormationPosition[]>;
  
  // Intercambiar posiciones
  swapPositions(positionId1: string, positionId2: string): Promise<[FormationPosition, FormationPosition]>;
}
