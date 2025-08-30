import { Statistic } from '../entities/statistics/Statistic.js';
import { StatisticRepository } from '../repositories/StatisticRepository.js';

export class StatisticService {
  constructor(private repo: StatisticRepository) {}

  async create(stat: Statistic) {
    return this.repo.create(stat);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getAll() {
    return this.repo.findAll();
  }
}
