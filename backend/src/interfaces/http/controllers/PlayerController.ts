import { Request, Response } from 'express';
import { PlayerService } from '../../../core/services/PlayerService.js';

const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error desconocido';
};

export class PlayerController {
  constructor(private playerService: PlayerService) {}

  async create(req: Request, res: Response) {
    try {
      const player = await this.playerService.createPlayer(req.body);
      res.status(201).json(player);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      res.status(400).json({ error: errorMessage });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const player = await this.playerService.getPlayer(req.params.id);
      if (!player) return res.status(404).json({ error: 'Player not found' });
      res.json(player);
    } catch (err) {
      res.status(400).json({ error: getErrorMessage(err) });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const players = await this.playerService.getPlayers(req.query);
      res.json(players);
    } catch (err) {
      res.status(400).json({ error: getErrorMessage(err) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const player = await this.playerService.updatePlayer(req.params.id, req.body);
      res.json(player);
    } catch (err) {
      res.status(400).json({ error: getErrorMessage(err) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.playerService.deletePlayer(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: getErrorMessage(err) });
    }
  }
}
