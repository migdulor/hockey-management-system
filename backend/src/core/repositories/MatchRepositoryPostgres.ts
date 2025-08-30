import { Match } from '../entities/models.js';
import { MatchRepository } from './MatchRepository.js';
import pool from '../db/postgres.js';

export class MatchRepositoryPostgres implements MatchRepository {
  async create(match: Match): Promise<Match> {
    const query = `
      INSERT INTO matches (id, home_team_id, away_team_id, date, location, state, score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      match.id,
      match.homeTeamId,
      match.awayTeamId,
      match.date,
      match.location,
      match.state,
      match.score
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToMatch(result.rows[0]);
  }

  async findById(id: string): Promise<Match | null> {
    const query = 'SELECT * FROM matches WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToMatch(result.rows[0]) : null;
  }

  async findAll(options?: { teamId?: string; state?: string }): Promise<Match[]> {
    let query = 'SELECT * FROM matches';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (options?.teamId) {
      conditions.push(`(home_team_id = $${paramCount} OR away_team_id = $${paramCount})`);
      values.push(options.teamId);
      paramCount++;
    }
    if (options?.state) {
      conditions.push(`status = $${paramCount++}`);
      values.push(options.state);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY date DESC';

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToMatch(row));
  }

  async update(id: string, match: Partial<Match>): Promise<Match> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (match.homeTeamId) {
      fields.push(`home_team_id = $${paramCount++}`);
      values.push(match.homeTeamId);
    }
    if (match.awayTeamId) {
      fields.push(`away_team_id = $${paramCount++}`);
      values.push(match.awayTeamId);
    }
    if (match.date) {
      fields.push(`date = $${paramCount++}`);
      values.push(match.date);
    }
    if (match.location) {
      fields.push(`location = $${paramCount++}`);
      values.push(match.location);
    }
    if (match.state) {
      fields.push(`state = $${paramCount++}`);
      values.push(match.state);
    }
    if (match.score !== undefined) {
      fields.push(`score = $${paramCount++}`);
      values.push(match.score);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as Match;
    }

    values.push(id);
    const query = `UPDATE matches SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return this.mapRowToMatch(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM matches WHERE id = $1';
    await pool.query(query, [id]);
  }

  private mapRowToMatch(row: any): Match {
    return {
      id: row.id,
      homeTeamId: row.home_team_id,
      awayTeamId: row.away_team_id,
      date: new Date(row.date),
      location: row.location,
      state: row.state,
      score: row.score
    };
  }
}
