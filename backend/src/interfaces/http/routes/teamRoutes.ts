import { Router } from 'express';
import { TeamController } from '../controllers/TeamController.js';
import { createTeamService } from '../../../config/teamServiceFactory.js';
import { Pool } from 'pg';

// Pool temporal - en producción debe venir de configuración central
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const router = Router();
const teamService = createTeamService(pool);
const teamController = new TeamController(teamService);

router.post('/', (req, res) => teamController.create(req, res));
router.get('/', (req, res) => teamController.getAll(req, res));
router.get('/:id', (req, res) => teamController.getById(req, res));
router.put('/:id', (req, res) => teamController.update(req, res));
router.delete('/:id', (req, res) => teamController.delete(req, res));

export default router;
