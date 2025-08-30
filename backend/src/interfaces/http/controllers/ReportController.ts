import { Request, Response } from 'express';
import { ReportService } from '../../../core/services/ReportService.js';

export class ReportController {
  constructor(private service: ReportService) {}

  async create(req: Request, res: Response) {
    const report = await this.service.create(req.body);
    res.json(report);
  }

  async getById(req: Request, res: Response) {
    const report = await this.service.getById(req.params.id);
    res.json(report);
  }

  async getAll(req: Request, res: Response) {
    const reports = await this.service.getAll();
    res.json(reports);
  }
}
