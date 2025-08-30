import { Router } from 'express';
import { MatchController } from '../controllers/MatchController.js';
import { MatchService } from '../../../core/services/MatchService.js';
import { MatchRepositoryPostgres } from '../../../core/repositories/MatchRepositoryPostgres.js';

const router = Router();
const matchRepo = new MatchRepositoryPostgres();
const matchService = new MatchService(matchRepo);
const matchController = new MatchController(matchService);

router.post('/', (req, res) => matchController.create(req, res));
router.get('/', (req, res) => matchController.getAll(req, res));
router.get('/:id', (req, res) => matchController.getById(req, res));
router.put('/:id', (req, res) => matchController.update(req, res));
router.delete('/:id', (req, res) => matchController.delete(req, res));

export default router;
