import { Player } from '../entities/models.js';

export interface PlayerRepository {
  create(player: Player): Promise<Player>;
  findById(id: string): Promise<Player | null>;
  findAll(options?: { teamId?: string; active?: boolean }): Promise<Player[]>;
  update(id: string, player: Partial<Player>): Promise<Player>;
  delete(id: string): Promise<void>;
  // Restriction: max 2 teams per player per club
  getTeamsForPlayer(playerId: string): Promise<{ teamId: string; clubId: string }[]>;
  // Add more business logic methods as needed
}
