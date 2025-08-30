import { Request, Response } from 'express';
import { TeamService } from '../../../core/services/TeamService.js';

const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error desconocido';
};

export class TeamController {
  constructor(private teamService: TeamService) {}

  async create(req: Request, res: Response) {
    try {
      const team = await this.teamService.createTeam(req.body);
      res.status(201).json(team);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || '';
      const team = await this.teamService.getTeamById(req.params.id, userId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
      res.json(team);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || '';
      const teams = await this.teamService.getTeamsByUser(userId);
      res.json(teams);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || '';
      const team = await this.teamService.updateTeam(req.params.id, req.body, userId);
      res.json(team);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || '';
      await this.teamService.deleteTeam(req.params.id, userId);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }
}
