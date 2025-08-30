import { Request, Response } from 'express';
import { AttendanceService } from '../../../core/services/AttendanceService.js';

const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Error desconocido';
};

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  async create(req: Request, res: Response) {
    try {
      const attendance = await this.attendanceService.createAttendance(req.body);
      res.status(201).json(attendance);
    } catch (err) {
      res.status(400).json({ error: getErrorMessage(err) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const attendance = await this.attendanceService.getAttendance(req.params.id);
      if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const attendances = await this.attendanceService.getAttendances(req.query);
      res.json(attendances);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const attendance = await this.attendanceService.updateAttendance(req.params.id, req.body);
      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.attendanceService.deleteAttendance(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }
}
