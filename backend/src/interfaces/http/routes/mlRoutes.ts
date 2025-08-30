import { Router } from 'express';
import { MLController } from '../controllers/MLController.js';
import { MLService } from '../../../core/services/MLService.js';
import { MLRepository } from '../../../core/repositories/MLRepository.js';

const router = Router();
const repo: MLRepository = {
  async predict(input: any) { return { id: '1', model: 'stub', input, output: {}, createdAt: new Date() }; },
  async findById(id: string) { return null; },
  async findAll() { return []; }
};
const service = new MLService(repo);
const controller = new MLController(service);

router.post('/predict', (req, res) => controller.predict(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

export default router;
