import { Request, Response } from 'express';
import { PaymentService } from '../../../core/services/PaymentService.js';

export class PaymentController {
  constructor(private service: PaymentService) {}

  async create(req: Request, res: Response) {
    const payment = await this.service.create(req.body);
    res.json(payment);
  }

  async getById(req: Request, res: Response) {
    const payment = await this.service.getById(req.params.id);
    res.json(payment);
  }

  async getAll(req: Request, res: Response) {
    const payments = await this.service.getAll();
    res.json(payments);
  }
}
