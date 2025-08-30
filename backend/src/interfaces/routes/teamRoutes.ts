/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Rutas de Equipos  // POST /api/teams/:id/players - Agregar jugador al equipo
  router.post('/teams/:id/players',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.addPlayerToTeam.bind(teamController)
  );
  
  // DELETE /api/teams/:id/players/:playerId - Quitar jugador del equipo
  router.delete('/teams/:id/players/:playerId',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.removePlayerFromTeam.bind(teamController)
  );ición de todas las rutas para operaciones CRUD de equipos
 * con middleware de autenticación y autorización básico
 */

import { Router } from 'express';
import { TeamController } from '../controllers/TeamController.js';
import { AuthMiddleware } from '../../infrastructure/middleware/AuthMiddleware.js';
import { apiRateLimit } from '../../infrastructure/middleware/SecurityMiddleware.js';

/**
 * Configurar rutas de equipos con middleware completo
 */
export function configureTeamRoutes(
  teamController: TeamController,
  authMiddleware: AuthMiddleware
): Router {
  
  const router = Router();
  
  // Aplicar rate limiting general a todas las rutas de equipos
  router.use(apiRateLimit);
  
  // POST /api/teams - Crear nuevo equipo
  router.post('/teams',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.canCreateTeam(),
    teamController.createTeam.bind(teamController)
  );
  
  // GET /api/teams - Obtener equipos del usuario
  router.get('/teams',
    authMiddleware.requireAuth(),
    teamController.getTeams.bind(teamController)
  );
  
  // GET /api/teams/validation-info - Información de validación
  router.get('/teams/validation-info',
    authMiddleware.requireAuth(),
    teamController.getValidationInfo.bind(teamController)
  );
  
  // GET /api/teams/search - Buscar equipos con filtros
  router.get('/teams/search',
    authMiddleware.requireAuth(),
    teamController.searchTeams.bind(teamController)
  );
  
  // GET /api/teams/:id - Obtener equipo específico
  router.get('/teams/:id',
    authMiddleware.requireAuth(),
    teamController.getTeamById.bind(teamController)
  );
  
  // PUT /api/teams/:id - Actualizar equipo
  router.put('/teams/:id',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.updateTeam.bind(teamController)
  );
  
  // DELETE /api/teams/:id - Eliminar equipo
  router.delete('/teams/:id',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.deleteTeam.bind(teamController)
  );
  
  // GET /api/teams/:id/players - Obtener equipo con jugadoras
  router.get('/teams/:id/players',
    authMiddleware.requireAuth(),
    teamController.getTeamWithPlayers.bind(teamController)
  );
  
  // POST /api/teams/:id/players - Agregar jugadora a equipo
  router.post('/teams/:id/players',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.addPlayer.bind(teamController)
  );
  
  // DELETE /api/teams/:id/players/:playerId - Remover jugadora de equipo
  router.delete('/teams/:id/players/:playerId',
    authMiddleware.requireAuth(),
    authMiddleware.requireRole(['admin', 'coach']),
    authMiddleware.requireOwnership(),
    teamController.removePlayer.bind(teamController)
  );
  
  return router;
}

/**
 * Crear instancia de rutas de equipos configuradas
 */
export function createTeamRoutes(
  teamController: TeamController,
  authMiddleware: AuthMiddleware
): Router {
  return configureTeamRoutes(teamController, authMiddleware);
}
