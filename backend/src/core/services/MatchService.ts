import { Match } from '../entities/models.js';
import { MatchRepository } from '../repositories/MatchRepository.js';

export class MatchService {
  constructor(private matchRepo: MatchRepository) {}

  async createMatch(data: Match) {
    return this.matchRepo.create(data);
  }

  async getMatch(id: string) {
    return this.matchRepo.findById(id);
  }

  async getMatches(options?: { teamId?: string; state?: string }) {
    return this.matchRepo.findAll(options);
  }

  async updateMatch(id: string, data: Partial<Match>) {
    return this.matchRepo.update(id, data);
  }

  async deleteMatch(id: string) {
    return this.matchRepo.delete(id);
  }
}
