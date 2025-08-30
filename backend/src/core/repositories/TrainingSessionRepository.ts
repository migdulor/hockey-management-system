import { TrainingSession } from '../entities/models.js';

export interface TrainingSessionRepository {
  create(trainingSession: TrainingSession): Promise<TrainingSession>;
  findById(id: string): Promise<TrainingSession | null>;
  findAll(options?: { 
    teamId?: string; 
    startDate?: Date; 
    endDate?: Date; 
    type?: string;
    includeCancelled?: boolean;
  }): Promise<TrainingSession[]>;
  findByTeamId(teamId: string): Promise<TrainingSession[]>;
  update(id: string, trainingSession: Partial<TrainingSession>): Promise<TrainingSession>;
  delete(id: string): Promise<void>;
  
  // Métodos específicos para entrenamientos
  findUpcoming(teamId: string, limit?: number): Promise<TrainingSession[]>;
  findByDateRange(teamId: string, startDate: Date, endDate: Date): Promise<TrainingSession[]>;
  markAsCancelled(id: string, reason?: string): Promise<TrainingSession>;
}
