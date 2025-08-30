import { Router } from 'express';
import { PlayerController } from '../controllers/PlayerController.js';
import { PlayerService } from '../../../core/services/PlayerService.js';
import { PlayerRepositoryPostgres } from '../../../core/repositories/PlayerRepositoryPostgres.js';

const router = Router();
const playerService = new PlayerService(new PlayerRepositoryPostgres());
const playerController = new PlayerController(playerService);

router.post('/', (req, res) => playerController.create(req, res));
router.get('/', (req, res) => playerController.getAll(req, res));
router.get('/:id', (req, res) => playerController.getById(req, res));
router.put('/:id', (req, res) => playerController.update(req, res));
router.delete('/:id', (req, res) => playerController.delete(req, res));

export default router;
