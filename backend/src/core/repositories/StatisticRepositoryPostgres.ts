import { Statistic } from '../entities/statistics/Statistic.js';
import { StatisticRepository } from './StatisticRepository.js';

export class StatisticRepositoryPostgres implements StatisticRepository {
  async create(stat: Statistic): Promise<Statistic> {
    // TODO: Implement DB logic
    return stat;
  }
  async findById(id: string): Promise<Statistic | null> {
    // TODO: Implement DB logic
    return null;
  }
  async findAll(): Promise<Statistic[]> {
    // TODO: Implement DB logic
    return [];
  }
}
