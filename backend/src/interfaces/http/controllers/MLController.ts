import { Request, Response } from 'express';
import { MLService } from '../../../core/services/MLService.js';

export class MLController {
  constructor(private service: MLService) {}

  async predict(req: Request, res: Response) {
    const prediction = await this.service.predict(req.body.input);
    res.json(prediction);
  }

  async getById(req: Request, res: Response) {
    const prediction = await this.service.getById(req.params.id);
    res.json(prediction);
  }

  async getAll(req: Request, res: Response) {
    const predictions = await this.service.getAll();
    res.json(predictions);
  }
}
