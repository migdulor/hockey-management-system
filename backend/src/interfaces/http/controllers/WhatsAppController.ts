import { Request, Response } from 'express';
import { WhatsAppService } from '../../../core/services/WhatsAppService.js';

export class WhatsAppController {
  constructor(private service: WhatsAppService) {}

  async send(req: Request, res: Response) {
    const msg = await this.service.send(req.body);
    res.json(msg);
  }

  async getById(req: Request, res: Response) {
    const msg = await this.service.getById(req.params.id);
    res.json(msg);
  }

  async getAll(req: Request, res: Response) {
    const msgs = await this.service.getAll();
    res.json(msgs);
  }
}
