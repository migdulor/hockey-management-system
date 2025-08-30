import { Player } from '../entities/models.js';
import { PlayerRepository } from './PlayerRepository.js';
import { getDbPool } from '../../infrastructure/database/connection.js';

export class PlayerRepositoryPostgres implements PlayerRepository {
  async create(player: Player): Promise<Player> {
    const pool = getDbPool();
    const query = `
      INSERT INTO players (id, first_name, last_name, birth_date, position, team_id, nickname)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      player.id,
      player.firstName,
      player.lastName,
      player.birthDate,
      player.position,
      player.teamId,
      player.nickname || null
    ];

    const result = await pool.query(query, values);
    return this.mapRowToPlayer(result.rows[0]);
  }

  async findById(id: string): Promise<Player | null> {
    const pool = getDbPool();
    const query = 'SELECT * FROM players WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPlayer(result.rows[0]) : null;
  }

  async findAll(options?: { teamId?: string; active?: boolean }): Promise<Player[]> {
    const pool = getDbPool();
    let query = 'SELECT * FROM players';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (options?.teamId) {
      conditions.push(`team_id = $${paramCount++}`);
      values.push(options.teamId);
    }
    if (options?.active !== undefined) {
      conditions.push(`active = $${paramCount++}`);
      values.push(options.active);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY first_name, last_name';

    const result = await pool.query(query, values);
    return result.rows.map((row: any) => this.mapRowToPlayer(row));
  }

  async update(id: string, player: Partial<Player>): Promise<Player> {
    const pool = getDbPool();
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (player.firstName) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(player.firstName);
    }
    if (player.lastName) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(player.lastName);
    }
    if (player.birthDate) {
      fields.push(`birth_date = $${paramCount++}`);
      values.push(player.birthDate);
    }
    if (player.position) {
      fields.push(`position = $${paramCount++}`);
      values.push(player.position);
    }
    if (player.teamId !== undefined) {
      fields.push(`team_id = $${paramCount++}`);
      values.push(player.teamId);
    }
    if (player.nickname !== undefined) {
      fields.push(`nickname = $${paramCount++}`);
      values.push(player.nickname);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as Player;
    }

    values.push(id);
    const query = `UPDATE players SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return this.mapRowToPlayer(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const pool = getDbPool();
    const query = 'DELETE FROM players WHERE id = $1';
    await pool.query(query, [id]);
  }

  async getTeamsForPlayer(playerId: string): Promise<{ teamId: string; clubId: string }[]> {
    const pool = getDbPool();
    const query = `
      SELECT t.id as team_id, t.id as club_id 
      FROM teams t 
      JOIN players p ON t.id = p.team_id 
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [playerId]);
    return result.rows.map((row: any) => ({
      teamId: row.team_id,
      clubId: row.club_id
    }));
  }

  private mapRowToPlayer(row: any): Player {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      birthDate: new Date(row.birth_date),
      position: row.position,
      teamId: row.team_id,
      nickname: row.nickname
    };
  }
}
