import { Router } from 'express';
import { StatisticController } from '../controllers/StatisticController.js';
import { StatisticService } from '../../../core/services/StatisticService.js';
import { StatisticRepository } from '../../../core/repositories/StatisticRepository.js';

const router = Router();
const repo: StatisticRepository = {
  async create(stat) { return stat; },
  async findById(id) { return null; },
  async findAll() { return []; }
};
const service = new StatisticService(repo);
const controller = new StatisticController(service);

router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

export default router;
