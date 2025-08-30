import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { ReportService } from '../../../core/services/ReportService.js';
import { ReportRepository } from '../../../core/repositories/ReportRepository.js';

const router = Router();
const repo: ReportRepository = {
  async create(report) { return report; },
  async findById(id) { return null; },
  async findAll() { return []; }
};
const service = new ReportService(repo);
const controller = new ReportController(service);

router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

export default router;
