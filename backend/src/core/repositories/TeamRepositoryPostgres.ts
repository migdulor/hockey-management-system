import { Team } from '../entities/models.js';
import { TeamRepository } from './TeamRepository.js';
import pool from '../db/postgres.js';

export class TeamRepositoryPostgres implements TeamRepository {
  async create(team: Team): Promise<Team> {
    const query = `
      INSERT INTO teams (id, name, badge_url, founded)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [team.id, team.name, team.badgeUrl || null, team.founded];
    
    const result = await pool.query(query, values);
    return this.mapRowToTeam(result.rows[0]);
  }

  async findById(id: string): Promise<Team | null> {
    const query = 'SELECT * FROM teams WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToTeam(result.rows[0]) : null;
  }

  async findAll(options?: { clubId?: string; active?: boolean }): Promise<Team[]> {
    const query = 'SELECT * FROM teams ORDER BY name';
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToTeam(row));
  }

  async update(id: string, team: Partial<Team>): Promise<Team> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (team.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(team.name);
    }
    if (team.badgeUrl !== undefined) {
      fields.push(`badge_url = $${paramCount++}`);
      values.push(team.badgeUrl);
    }
    if (team.founded) {
      fields.push(`founded = $${paramCount++}`);
      values.push(team.founded);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as Team;
    }

    values.push(id);
    const query = `UPDATE teams SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return this.mapRowToTeam(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM teams WHERE id = $1';
    await pool.query(query, [id]);
  }

  private mapRowToTeam(row: any): Team {
    return {
      id: row.id,
      name: row.name,
      badgeUrl: row.badge_url,
      founded: row.founded
    };
  }
}
