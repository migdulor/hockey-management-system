import { Router } from 'express';
import { FormationController } from '../controllers/FormationController.js';
import { FormationService } from '../../../core/services/FormationService.js';
import { FormationRepositoryPostgres } from '../../../core/repositories/FormationRepositoryPostgres.js';

const router = Router();
const formationRepo = new FormationRepositoryPostgres();
const formationService = new FormationService(formationRepo);
const formationController = new FormationController(formationService);

router.post('/', (req, res) => formationController.create(req, res));
router.get('/', (req, res) => formationController.getAll(req, res));
router.get('/:id', (req, res) => formationController.getById(req, res));
router.put('/:id', (req, res) => formationController.update(req, res));
router.delete('/:id', (req, res) => formationController.delete(req, res));

export default router;
