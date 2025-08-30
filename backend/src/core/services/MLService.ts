import { Prediction } from '../entities/ml/Prediction.js';
import { MLRepository } from '../repositories/MLRepository.js';

export class MLService {
  constructor(private repo: MLRepository) {}

  async predict(input: any) {
    return this.repo.predict(input);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getAll() {
    return this.repo.findAll();
  }
}
