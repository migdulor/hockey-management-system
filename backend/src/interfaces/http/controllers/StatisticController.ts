import { Request, Response } from 'express';
import { StatisticService } from '../../../core/services/StatisticService.js';

export class StatisticController {
  constructor(private service: StatisticService) {}

  async create(req: Request, res: Response) {
    const stat = await this.service.create(req.body);
    res.json(stat);
  }

  async getById(req: Request, res: Response) {
    const stat = await this.service.getById(req.params.id);
    res.json(stat);
  }

  async getAll(req: Request, res: Response) {
    const stats = await this.service.getAll();
    res.json(stats);
  }
}
