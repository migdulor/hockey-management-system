import { Attendance } from '../entities/models.js';
import { AttendanceRepository } from '../repositories/AttendanceRepository.js';

export class AttendanceService {
  constructor(private attendanceRepo: AttendanceRepository) {}

  async createAttendance(data: Attendance) {
    return this.attendanceRepo.create(data);
  }

  async getAttendance(id: string) {
    return this.attendanceRepo.findById(id);
  }

  async getAttendances(options?: { playerId?: string; teamId?: string; date?: Date }) {
    return this.attendanceRepo.findAll(options);
  }

  async updateAttendance(id: string, data: Partial<Attendance>) {
    return this.attendanceRepo.update(id, data);
  }

  async deleteAttendance(id: string) {
    return this.attendanceRepo.delete(id);
  }
}
