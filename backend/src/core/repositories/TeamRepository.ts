import { Team } from '../entities/models.js';

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findAll(options?: { clubId?: string; active?: boolean }): Promise<Team[]>;
  update(id: string, team: Partial<Team>): Promise<Team>;
  delete(id: string): Promise<void>;
  // Add more business logic methods as needed
}
