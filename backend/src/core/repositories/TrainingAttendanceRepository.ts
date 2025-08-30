import { TrainingAttendance } from '../entities/models.js';

export interface TrainingAttendanceRepository {
  create(attendance: TrainingAttendance): Promise<TrainingAttendance>;
  findById(id: string): Promise<TrainingAttendance | null>;
  findAll(options?: { 
    playerId?: string; 
    trainingSessionId?: string; 
    teamId?: string; 
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<TrainingAttendance[]>;
  
  update(id: string, attendance: Partial<TrainingAttendance>): Promise<TrainingAttendance>;
  delete(id: string): Promise<void>;
  
  // Métodos específicos para asistencias (US005)
  findByTrainingSession(trainingSessionId: string): Promise<TrainingAttendance[]>;
  findByPlayer(playerId: string, options?: { startDate?: Date; endDate?: Date }): Promise<TrainingAttendance[]>;
  
  // Estadísticas de asistencia
  getPlayerAttendanceStats(playerId: string, startDate?: Date, endDate?: Date): Promise<{
    totalTrainings: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    attendancePercentage: number;
    punctualityPercentage: number;
  }>;
  
  getTrainingAttendanceSummary(trainingSessionId: string): Promise<{
    totalPlayers: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    attendanceRate: number;
  }>;
  
  // Marcar asistencia masiva
  markBulkAttendance(attendances: Partial<TrainingAttendance>[]): Promise<TrainingAttendance[]>;
}
