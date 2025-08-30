import { Prediction } from '../entities/ml/Prediction.js';
import { MLRepository } from './MLRepository.js';

export class MLRepositoryPostgres implements MLRepository {
  async predict(input: any): Promise<Prediction> {
    // TODO: Implement ML logic or DB integration
    return { id: '1', model: 'stub', input, output: {}, createdAt: new Date() };
  }
  async findById(id: string): Promise<Prediction | null> {
    // TODO: Implement DB logic
    return null;
  }
  async findAll(): Promise<Prediction[]> {
    // TODO: Implement DB logic
    return [];
  }
}
