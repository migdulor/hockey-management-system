import { Attendance } from '../entities/models.js';
import { AttendanceRepository } from './AttendanceRepository.js';
import pool from '../db/postgres.js';

export class AttendanceRepositoryPostgres implements AttendanceRepository {
  async create(attendance: Attendance): Promise<Attendance> {
    const query = `
      INSERT INTO attendances (id, player_id, session_id, session_type, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      attendance.id,
      attendance.playerId,
      attendance.sessionId,
      attendance.sessionType,
      attendance.status,
      attendance.notes
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToAttendance(result.rows[0]);
  }

  async findById(id: string): Promise<Attendance | null> {
    const query = 'SELECT * FROM attendances WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToAttendance(result.rows[0]) : null;
  }

  async findAll(options?: { playerId?: string; teamId?: string; date?: Date }): Promise<Attendance[]> {
    let query = `
      SELECT a.*, p.name as player_name, m.date as match_date, m.location as match_location
      FROM attendances a
      JOIN players p ON a.player_id = p.id
      JOIN matches m ON a.match_id = m.id
    `;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (options?.playerId) {
      conditions.push(`a.player_id = $${paramCount++}`);
      values.push(options.playerId);
    }
    if (options?.teamId) {
      conditions.push(`p.team_id = $${paramCount++}`);
      values.push(options.teamId);
    }
    if (options?.date) {
      conditions.push(`DATE(m.date) = DATE($${paramCount++})`);
      values.push(options.date);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY m.date DESC';

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToAttendance(row));
  }

  async update(id: string, attendance: Partial<Attendance>): Promise<Attendance> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (attendance.playerId) {
      fields.push(`player_id = $${paramCount++}`);
      values.push(attendance.playerId);
    }
    if (attendance.sessionId) {
      fields.push(`session_id = $${paramCount++}`);
      values.push(attendance.sessionId);
    }
    if (attendance.sessionType) {
      fields.push(`session_type = $${paramCount++}`);
      values.push(attendance.sessionType);
    }
    if (attendance.status) {
      fields.push(`status = $${paramCount++}`);
      values.push(attendance.status);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as Attendance;
    }

    values.push(id);
    const query = `UPDATE attendances SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return this.mapRowToAttendance(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM attendances WHERE id = $1';
    await pool.query(query, [id]);
  }

  private mapRowToAttendance(row: any): Attendance {
    return {
      id: row.id,
      playerId: row.player_id,
      sessionId: row.session_id,
      sessionType: row.session_type,
      status: row.status,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
