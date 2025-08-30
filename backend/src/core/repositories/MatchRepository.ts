import { Match } from '../entities/models.js';

export interface MatchRepository {
  create(match: Match): Promise<Match>;
  findById(id: string): Promise<Match | null>;
  findAll(options?: { teamId?: string; state?: string }): Promise<Match[]>;
  update(id: string, match: Partial<Match>): Promise<Match>;
  delete(id: string): Promise<void>;
  // Add more business logic methods as needed
}
