import { Statistic } from '../entities/statistics/Statistic.js';

export interface StatisticRepository {
  create(stat: Statistic): Promise<Statistic>;
  findById(id: string): Promise<Statistic | null>;
  findAll(): Promise<Statistic[]>;
}
