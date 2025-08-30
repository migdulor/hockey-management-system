import { Attendance } from '../entities/models.js';

export interface AttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findById(id: string): Promise<Attendance | null>;
  findAll(options?: { playerId?: string; teamId?: string; date?: Date }): Promise<Attendance[]>;
  update(id: string, attendance: Partial<Attendance>): Promise<Attendance>;
  delete(id: string): Promise<void>;
  // Add more business logic methods as needed
}
