import { Request, Response } from 'express';
import { MatchService } from '../../../core/services/MatchService.js';

export class MatchController {
  constructor(private matchService: MatchService) {}

  async create(req: Request, res: Response) {
    try {
      const match = await this.matchService.createMatch(req.body);
      res.status(201).json(match);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const match = await this.matchService.getMatch(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const matches = await this.matchService.getMatches(req.query);
      res.json(matches);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const match = await this.matchService.updateMatch(req.params.id, req.body);
      res.json(match);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.matchService.deleteMatch(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }
}
