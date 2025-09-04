import { Request, Response } from 'express';
import { FormationService } from '../../../core/services/FormationService.js';

export class FormationController {
  constructor(private formationService: FormationService) {}

  async create(req: Request, res: Response) {
    try {
      const formation = await this.formationService.createFormation(req.body);
      res.status(201).json(formation);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const formation = await this.formationService.getFormation(req.params.id);
      if (!formation) return res.status(404).json({ error: 'Formation not found' });
      res.json(formation);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const formations = await this.formationService.getFormations(req.query);
      res.json(formations);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const formation = await this.formationService.updateFormation(req.params.id, req.body);
      res.json(formation);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.formationService.deleteFormation(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  // Métodos para posiciones de la formación
  async getFormationWithDetails(req: Request, res: Response) {
    try {
      const formationDetails = await this.formationService.getFormationWithDetails(req.params.id);
      if (!formationDetails) return res.status(404).json({ error: 'Formation not found' });
      res.json(formationDetails);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getPositions(req: Request, res: Response) {
    try {
      const positions = await this.formationService.getPositionsForFormation(req.params.id);
      res.json(positions);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async addPosition(req: Request, res: Response) {
    try {
      const position = await this.formationService.addPositionToFormation(req.params.id, req.body);
      res.status(201).json(position);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async updatePosition(req: Request, res: Response) {
    try {
      const { positionId } = req.params;
      const position = await this.formationService.updatePositionInFormation(positionId, req.body);
      res.json(position);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async removePosition(req: Request, res: Response) {
    try {
      const { positionId } = req.params;
      await this.formationService.removePositionFromFormation(positionId);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }
}
