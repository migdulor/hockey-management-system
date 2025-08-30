import { Prediction } from '../entities/ml/Prediction.js';

export interface MLRepository {
  predict(input: any): Promise<Prediction>;
  findById(id: string): Promise<Prediction | null>;
  findAll(): Promise<Prediction[]>;
}
