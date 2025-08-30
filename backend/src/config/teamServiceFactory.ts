/**
 * Configuración simplificada de dependencias para el sistema de equipos
 * Usado temporalmente hasta tener un sistema de DI completo
 */

import { Pool } from 'pg';
import { TeamService } from '../core/services/TeamService.js';
import { TeamRepositoryPostgres } from '../infrastructure/repositories/TeamRepositoryPostgres.js';
import { DivisionRepositoryPostgres } from '../infrastructure/repositories/DivisionRepositoryPostgres.js';
import { DivisionValidationService } from '../core/services/DivisionValidationService.js';
import { PlanValidationService } from '../core/services/PlanValidationService.js';

/**
 * Factory para crear una instancia completamente configurada del TeamService
 */
export function createTeamService(pool: Pool): TeamService {
  // Repositorios
  const teamRepository = new TeamRepositoryPostgres(pool);
  const divisionRepository = new DivisionRepositoryPostgres(pool);
  
  // Servicios de validación
  const divisionValidationService = new DivisionValidationService();
  const planValidationService = new PlanValidationService();
  
  // Servicio principal
  return new TeamService(
    teamRepository,
    divisionRepository,
    divisionValidationService,
    planValidationService
  );
}
