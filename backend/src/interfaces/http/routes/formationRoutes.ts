import { Router } from 'express';
import { FormationController } from '../controllers/FormationController.js';
import { FormationService } from '../../../core/services/FormationService.js';
import { FormationRepositoryPostgres } from '../../../core/repositories/FormationRepositoryPostgres.js';
import { FormationPositionRepositoryPostgres } from '../../../core/repositories/FormationPositionRepositoryPostgres.js';

const router = Router();
const formationRepo = new FormationRepositoryPostgres();
const positionRepo = new FormationPositionRepositoryPostgres();
const formationService = new FormationService(formationRepo, positionRepo);
const formationController = new FormationController(formationService);

// Rutas para Formaciones
router.post('/', (req, res) => formationController.create(req, res));
router.get('/', (req, res) => formationController.getAll(req, res));
router.get('/:id', (req, res) => formationController.getById(req, res));
router.put('/:id', (req, res) => formationController.update(req, res));
router.delete('/:id', (req, res) => formationController.delete(req, res));

// Ruta para obtener detalles completos de la formación (incluyendo jugadores)
router.get('/:id/details', (req, res) => formationController.getFormationWithDetails(req, res));

// Rutas para Posiciones/Jugadores en una Formación
router.get('/:id/positions', (req, res) => formationController.getPositions(req, res));
router.post('/:id/positions', (req, res) => formationController.addPosition(req, res));
router.put('/:id/positions/:positionId', (req, res) => formationController.updatePosition(req, res));
router.delete('/:id/positions/:positionId', (req, res) => formationController.removePosition(req, res));

export default router;
