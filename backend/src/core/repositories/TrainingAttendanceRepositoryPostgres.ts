import { sql } from '@vercel/postgres';
import { TrainingAttendance } from '../entities/models.js';
import { TrainingAttendanceRepository } from './TrainingAttendanceRepository.js';

export class TrainingAttendanceRepositoryPostgres implements TrainingAttendanceRepository {
  
  async create(attendance: TrainingAttendance): Promise<TrainingAttendance> {
    const result = await sql`
      INSERT INTO training_attendances (
        id, player_id, training_session_id, status, arrival_time, departure_time,
        excuse_reason, participation_level, performance_notes, marked_by, marked_at
      )
      VALUES (
        ${attendance.id}, ${attendance.playerId}, ${attendance.trainingSessionId},
        ${attendance.status}, ${attendance.arrivalTime || null}, ${attendance.departureTime || null},
        ${attendance.excuseReason || null}, ${attendance.participationLevel || null}, 
        ${attendance.performanceNotes || null}, ${attendance.markedBy}, 
        ${attendance.markedAt.toISOString()}
      )
      RETURNING *
    `;
    
    return this.mapRowToTrainingAttendance(result.rows[0]);
  }

  async findById(id: string): Promise<TrainingAttendance | null> {
    const result = await sql`
      SELECT * FROM training_attendances WHERE id = ${id}
    `;
    
    return result.rows[0] ? this.mapRowToTrainingAttendance(result.rows[0]) : null;
  }

  async findAll(options?: { 
    playerId?: string; 
    trainingSessionId?: string; 
    teamId?: string; 
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<TrainingAttendance[]> {
    let query = `
      SELECT ta.*, ts.date as training_date, ts.name as training_name
      FROM training_attendances ta
      JOIN training_sessions ts ON ta.training_session_id = ts.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (options?.playerId) {
      query += ` AND ta.player_id = $${paramCount++}`;
      params.push(options.playerId);
    }

    if (options?.trainingSessionId) {
      query += ` AND ta.training_session_id = $${paramCount++}`;
      params.push(options.trainingSessionId);
    }

    if (options?.teamId) {
      query += ` AND ts.team_id = $${paramCount++}`;
      params.push(options.teamId);
    }

    if (options?.status) {
      query += ` AND ta.status = $${paramCount++}`;
      params.push(options.status);
    }

    if (options?.startDate) {
      query += ` AND ts.date >= $${paramCount++}`;
      params.push(options.startDate.toISOString().split('T')[0]);
    }

    if (options?.endDate) {
      query += ` AND ts.date <= $${paramCount++}`;
      params.push(options.endDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY ts.date DESC, ta.created_at DESC`;

    const result = await sql.query(query, params);
    return result.rows.map(row => this.mapRowToTrainingAttendance(row));
  }

  async update(id: string, attendance: Partial<TrainingAttendance>): Promise<TrainingAttendance> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (attendance.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(attendance.status);
    }
    if (attendance.arrivalTime !== undefined) {
      fields.push(`arrival_time = $${paramCount++}`);
      values.push(attendance.arrivalTime);
    }
    if (attendance.departureTime !== undefined) {
      fields.push(`departure_time = $${paramCount++}`);
      values.push(attendance.departureTime);
    }
    if (attendance.excuseReason !== undefined) {
      fields.push(`excuse_reason = $${paramCount++}`);
      values.push(attendance.excuseReason);
    }
    if (attendance.participationLevel !== undefined) {
      fields.push(`participation_level = $${paramCount++}`);
      values.push(attendance.participationLevel);
    }
    if (attendance.performanceNotes !== undefined) {
      fields.push(`performance_notes = $${paramCount++}`);
      values.push(attendance.performanceNotes);
    }
    if (attendance.markedBy !== undefined) {
      fields.push(`marked_by = $${paramCount++}`);
      values.push(attendance.markedBy);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as TrainingAttendance;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE training_attendances SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql.query(query, values);
    
    return this.mapRowToTrainingAttendance(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM training_attendances WHERE id = ${id}`;
  }

  // Métodos específicos para asistencias (US005)

  async findByTrainingSession(trainingSessionId: string): Promise<TrainingAttendance[]> {
    const result = await sql`
      SELECT ta.*, p.name as player_name
      FROM training_attendances ta
      JOIN players p ON ta.player_id = p.id
      WHERE ta.training_session_id = ${trainingSessionId}
      ORDER BY p.name ASC
    `;
    
    return result.rows.map(row => this.mapRowToTrainingAttendance(row));
  }

  async findByPlayer(playerId: string, options?: { startDate?: Date; endDate?: Date }): Promise<TrainingAttendance[]> {
    let query = `
      SELECT ta.*, ts.date as training_date, ts.name as training_name
      FROM training_attendances ta
      JOIN training_sessions ts ON ta.training_session_id = ts.id
      WHERE ta.player_id = $1
    `;
    const params: any[] = [playerId];
    let paramCount = 2;

    if (options?.startDate) {
      query += ` AND ts.date >= $${paramCount++}`;
      params.push(options.startDate.toISOString().split('T')[0]);
    }

    if (options?.endDate) {
      query += ` AND ts.date <= $${paramCount++}`;
      params.push(options.endDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY ts.date DESC`;

    const result = await sql.query(query, params);
    return result.rows.map(row => this.mapRowToTrainingAttendance(row));
  }

  // Estadísticas de asistencia usando función SQL creada en migración
  async getPlayerAttendanceStats(playerId: string, startDate?: Date, endDate?: Date): Promise<{
    totalTrainings: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    attendancePercentage: number;
    punctualityPercentage: number;
  }> {
    const result = await sql`
      SELECT * FROM get_player_attendance_stats(
        ${playerId}::UUID, 
        ${startDate?.toISOString().split('T')[0] || null}::DATE, 
        ${endDate?.toISOString().split('T')[0] || null}::DATE
      )
    `;
    
    const row = result.rows[0];
    return {
      totalTrainings: parseInt(row.total_trainings),
      presentCount: parseInt(row.present_count),
      lateCount: parseInt(row.late_count),
      absentCount: parseInt(row.absent_count),
      attendancePercentage: parseFloat(row.attendance_percentage),
      punctualityPercentage: parseFloat(row.punctuality_percentage)
    };
  }

  async getTrainingAttendanceSummary(trainingSessionId: string): Promise<{
    totalPlayers: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    attendanceRate: number;
  }> {
    const result = await sql`
      SELECT * FROM get_training_attendance_summary(${trainingSessionId}::UUID)
    `;
    
    const row = result.rows[0];
    return {
      totalPlayers: parseInt(row.total_players),
      presentCount: parseInt(row.present_count),
      lateCount: parseInt(row.late_count),
      absentCount: parseInt(row.absent_count),
      attendanceRate: parseFloat(row.attendance_rate)
    };
  }

  // Marcar asistencia masiva para un entrenamiento
  async markBulkAttendance(attendances: Partial<TrainingAttendance>[]): Promise<TrainingAttendance[]> {
    const results: TrainingAttendance[] = [];
    
    for (const attendance of attendances) {
      if (attendance.id) {
        // Actualizar existente
        const updated = await this.update(attendance.id, attendance);
        results.push(updated);
      } else if (attendance.playerId && attendance.trainingSessionId) {
        // Crear nuevo
        const newAttendance: TrainingAttendance = {
          id: crypto.randomUUID(),
          playerId: attendance.playerId,
          trainingSessionId: attendance.trainingSessionId,
          status: attendance.status || 'ausente',
          arrivalTime: attendance.arrivalTime,
          departureTime: attendance.departureTime,
          excuseReason: attendance.excuseReason,
          participationLevel: attendance.participationLevel,
          performanceNotes: attendance.performanceNotes,
          markedBy: attendance.markedBy || 'coach',
          markedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const created = await this.create(newAttendance);
        results.push(created);
      }
    }
    
    return results;
  }

  private mapRowToTrainingAttendance(row: any): TrainingAttendance {
    return {
      id: row.id,
      playerId: row.player_id,
      trainingSessionId: row.training_session_id,
      status: row.status as 'presente' | 'tarde' | 'ausente',
      arrivalTime: row.arrival_time,
      departureTime: row.departure_time,
      excuseReason: row.excuse_reason,
      participationLevel: row.participation_level,
      performanceNotes: row.performance_notes,
      markedBy: row.marked_by,
      markedAt: new Date(row.marked_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
