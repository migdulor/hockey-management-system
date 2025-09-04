import { Formation, FormationPosition } from '../entities/models.js';
import { FormationRepository, FormationPositionRepository } from '../repositories/FormationRepository.js';

export class FormationService {
  constructor(
    private formationRepo: FormationRepository,
    private positionRepo: FormationPositionRepository
  ) {}

  async createFormation(data: Formation) {
    return this.formationRepo.create(data);
  }

  async getFormation(id: string) {
    return this.formationRepo.findById(id);
  }

  async getFormations(options?: { teamId?: string; matchId?: string }) {
    return this.formationRepo.findAll(options);
  }

  async updateFormation(id: string, data: Partial<Formation>) {
    return this.formationRepo.update(id, data);
  }

  async deleteFormation(id: string) {
    return this.formationRepo.delete(id);
  }

  // Métodos para gestionar posiciones
  async addPositionToFormation(formationId: string, positionData: Omit<FormationPosition, 'id' | 'formationId' | 'createdAt' | 'updatedAt'>): Promise<FormationPosition> {
    const formation = await this.formationRepo.findById(formationId);
    if (!formation) {
      throw new Error('Formation not found');
    }

    // Aquí se pueden añadir validaciones, como el número máximo de titulares/suplentes
    const starters = await this.positionRepo.getStartersCount(formationId);
    if (positionData.positionType === 'starter' && starters >= 11) {
        throw new Error('Cannot add more than 11 starters');
    }

    const newPosition: FormationPosition = {
      id: `pos_${Date.now()}`,
      formationId,
      ...positionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.positionRepo.create(newPosition);
  }

  async getPositionsForFormation(formationId: string): Promise<FormationPosition[]> {
    return this.positionRepo.findByFormation(formationId);
  }

  async updatePositionInFormation(positionId: string, updates: Partial<FormationPosition>): Promise<FormationPosition> {
    return this.positionRepo.update(positionId, updates);
  }

  async removePositionFromFormation(positionId: string): Promise<void> {
    return this.positionRepo.delete(positionId);
  }

  async getFormationWithDetails(formationId: string) {
    return this.formationRepo.findWithDetails(formationId);
  }
}
