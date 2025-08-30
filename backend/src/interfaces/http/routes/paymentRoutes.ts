import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { PaymentService } from '../../../core/services/PaymentService.js';
import { PaymentRepository } from '../../../core/repositories/PaymentRepository.js';

const router = Router();
const repo: PaymentRepository = {
  async create(payment) { return payment; },
  async findById(id) { return null; },
  async findAll() { return []; }
};
const service = new PaymentService(repo);
const controller = new PaymentController(service);

router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

export default router;
