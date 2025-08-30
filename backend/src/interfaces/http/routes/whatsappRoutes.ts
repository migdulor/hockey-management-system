import { Router } from 'express';
import { WhatsAppController } from '../controllers/WhatsAppController.js';
import { WhatsAppService } from '../../../core/services/WhatsAppService.js';
import { WhatsAppRepository } from '../../../core/repositories/WhatsAppRepository.js';

const router = Router();
const repo: WhatsAppRepository = {
  async sendMessage(msg) { return msg; },
  async findById(id) { return null; },
  async findAll() { return []; }
};
const service = new WhatsAppService(repo);
const controller = new WhatsAppController(service);

router.post('/send', (req, res) => controller.send(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

export default router;
