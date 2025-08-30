import { sql } from '@vercel/postgres';
import { TrainingSession } from '../entities/models.js';
import { TrainingSessionRepository } from './TrainingSessionRepository.js';

export class TrainingSessionRepositoryPostgres implements TrainingSessionRepository {
  
  async create(trainingSession: TrainingSession): Promise<TrainingSession> {
    const result = await sql`
      INSERT INTO training_sessions (
        id, team_id, name, date, time, location, duration_minutes, 
        type, notes, is_cancelled, weather_conditions
      )
      VALUES (
        ${trainingSession.id}, ${trainingSession.teamId}, ${trainingSession.name},
        ${trainingSession.date.toISOString().split('T')[0]}, ${trainingSession.time || null}, ${trainingSession.location || null},
        ${trainingSession.durationMinutes}, ${trainingSession.type}, ${trainingSession.notes || null},
        ${trainingSession.isCancelled}, ${trainingSession.weatherConditions || null}
      )
      RETURNING *
    `;
    
    return this.mapRowToTrainingSession(result.rows[0]);
  }

  async findById(id: string): Promise<TrainingSession | null> {
    const result = await sql`
      SELECT * FROM training_sessions WHERE id = ${id}
    `;
    
    return result.rows[0] ? this.mapRowToTrainingSession(result.rows[0]) : null;
  }

  async findAll(options?: { 
    teamId?: string; 
    startDate?: Date; 
    endDate?: Date; 
    type?: string;
    includeCancelled?: boolean;
  }): Promise<TrainingSession[]> {
    let query = `SELECT * FROM training_sessions WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 1;

    if (options?.teamId) {
      query += ` AND team_id = $${paramCount++}`;
      params.push(options.teamId);
    }

    if (options?.startDate) {
      query += ` AND date >= $${paramCount++}`;
      params.push(options.startDate.toISOString().split('T')[0]);
    }

    if (options?.endDate) {
      query += ` AND date <= $${paramCount++}`;
      params.push(options.endDate.toISOString().split('T')[0]);
    }

    if (options?.type) {
      query += ` AND type = $${paramCount++}`;
      params.push(options.type);
    }

    if (!options?.includeCancelled) {
      query += ` AND is_cancelled = false`;
    }

    query += ` ORDER BY date DESC, time DESC`;

    const result = await sql.query(query, params);
    return result.rows.map(row => this.mapRowToTrainingSession(row));
  }

  async findByTeamId(teamId: string): Promise<TrainingSession[]> {
    const result = await sql`
      SELECT * FROM training_sessions 
      WHERE team_id = ${teamId} AND is_cancelled = false
      ORDER BY date DESC, time DESC
    `;
    
    return result.rows.map(row => this.mapRowToTrainingSession(row));
  }

  async update(id: string, trainingSession: Partial<TrainingSession>): Promise<TrainingSession> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (trainingSession.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(trainingSession.name);
    }
    if (trainingSession.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(trainingSession.date.toISOString().split('T')[0]);
    }
    if (trainingSession.time !== undefined) {
      fields.push(`time = $${paramCount++}`);
      values.push(trainingSession.time);
    }
    if (trainingSession.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(trainingSession.location);
    }
    if (trainingSession.durationMinutes !== undefined) {
      fields.push(`duration_minutes = $${paramCount++}`);
      values.push(trainingSession.durationMinutes);
    }
    if (trainingSession.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(trainingSession.type);
    }
    if (trainingSession.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(trainingSession.notes);
    }
    if (trainingSession.isCancelled !== undefined) {
      fields.push(`is_cancelled = $${paramCount++}`);
      values.push(trainingSession.isCancelled);
    }
    if (trainingSession.weatherConditions !== undefined) {
      fields.push(`weather_conditions = $${paramCount++}`);
      values.push(trainingSession.weatherConditions);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as TrainingSession;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE training_sessions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql.query(query, values);
    
    return this.mapRowToTrainingSession(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM training_sessions WHERE id = ${id}`;
  }

  // Métodos específicos para entrenamientos

  async findUpcoming(teamId: string, limit: number = 10): Promise<TrainingSession[]> {
    const result = await sql`
      SELECT * FROM training_sessions 
      WHERE team_id = ${teamId} 
        AND date >= CURRENT_DATE 
        AND is_cancelled = false
      ORDER BY date ASC, time ASC
      LIMIT ${limit}
    `;
    
    return result.rows.map(row => this.mapRowToTrainingSession(row));
  }

  async findByDateRange(teamId: string, startDate: Date, endDate: Date): Promise<TrainingSession[]> {
    const result = await sql`
      SELECT * FROM training_sessions 
      WHERE team_id = ${teamId}
        AND date >= ${startDate.toISOString().split('T')[0]}
        AND date <= ${endDate.toISOString().split('T')[0]}
        AND is_cancelled = false
      ORDER BY date ASC, time ASC
    `;
    
    return result.rows.map(row => this.mapRowToTrainingSession(row));
  }

  async markAsCancelled(id: string, reason?: string): Promise<TrainingSession> {
    const notes = reason ? `CANCELADO: ${reason}` : 'CANCELADO';
    
    const result = await sql`
      UPDATE training_sessions 
      SET is_cancelled = true, 
          notes = COALESCE(notes || ' - ', '') || ${notes},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return this.mapRowToTrainingSession(result.rows[0]);
  }

  private mapRowToTrainingSession(row: any): TrainingSession {
    return {
      id: row.id,
      teamId: row.team_id,
      name: row.name,
      date: new Date(row.date),
      time: row.time,
      location: row.location,
      durationMinutes: row.duration_minutes,
      type: row.type as 'regular' | 'tactical' | 'physical' | 'recovery',
      notes: row.notes,
      isCancelled: row.is_cancelled,
      weatherConditions: row.weather_conditions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
