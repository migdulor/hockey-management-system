/**
 * Rutas para operaciones de divisiones
 * Incluye endpoints para obtener divisiones, estadísticas y validaciones
 */

import { Router } from 'express';
import { AuthMiddleware } from '../../infrastructure/middleware/AuthMiddleware.js';
import { DivisionController } from '../controllers/DivisionController.js';

export function createDivisionRoutes(
  authMiddleware: AuthMiddleware,
  divisionController: DivisionController
): Router {
  const router = Router();

  // GET /api/divisions - Obtener todas las divisiones
  router.get('/divisions',
    authMiddleware.requireAuth(),
    divisionController.getAllDivisions.bind(divisionController)
  );

  // GET /api/divisions/:id - Obtener división específica
  router.get('/divisions/:id',
    authMiddleware.requireAuth(),
    divisionController.getDivisionById.bind(divisionController)
  );

  // GET /api/divisions/:id/stats - Obtener estadísticas de división
  router.get('/divisions/:id/stats',
    authMiddleware.requireAuth(),
    divisionController.getDivisionStats.bind(divisionController)
  );

  return router;
}
