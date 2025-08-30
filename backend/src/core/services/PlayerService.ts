import { Player } from '../entities/models.js';
import { PlayerRepository } from '../repositories/PlayerRepository.js';

export class PlayerService {
  constructor(private playerRepo: PlayerRepository) {}

  async createPlayer(data: Player) {
    // Add business validations here
    return this.playerRepo.create(data);
  }

  async getPlayer(id: string) {
    return this.playerRepo.findById(id);
  }

  async getPlayers(options?: { teamId?: string; active?: boolean }) {
    return this.playerRepo.findAll(options);
  }

  async updatePlayer(id: string, data: Partial<Player>) {
    return this.playerRepo.update(id, data);
  }

  async deletePlayer(id: string) {
    return this.playerRepo.delete(id);
  }
}
