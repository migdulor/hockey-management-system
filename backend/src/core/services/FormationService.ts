import { Formation } from '../entities/models.js';
import { FormationRepository } from '../repositories/FormationRepository.js';

export class FormationService {
  constructor(private formationRepo: FormationRepository) {}

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
}
