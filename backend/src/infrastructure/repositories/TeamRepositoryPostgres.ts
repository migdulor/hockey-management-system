/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Repositorio de Equipos PostgreSQL
 * 
 * Implementación del repositorio de equipos para PostgreSQL
 * con queries optimizadas y manejo de transacciones
 */

import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../../core/entities/Team.js';
import { 
  CreateTeamDTO, 
  UpdateTeamDTO, 
  TeamFiltersDTO,
  PaginatedTeamsDTO,
  TeamResponseDTO
} from '../../core/dtos/TeamDTO.js';
import { TeamRepository } from '../../core/services/TeamService.js';

/**
 * Implementación PostgreSQL del repositorio de equipos
 */
export class TeamRepositoryPostgres implements TeamRepository {
  
  constructor(private pool: Pool) {}
  
  /**
   * Crea un nuevo equipo en la base de datos
   */
  async create(teamData: CreateTeamDTO): Promise<Team> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const id = uuidv4();
      const now = new Date();
      
      const query = `
        INSERT INTO teams (
          id, name, club_name, division_id, user_id, max_players, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        id,
        teamData.name,
        teamData.clubName,
        teamData.divisionId,
        teamData.userId,
        teamData.maxPlayers || 20,
        now,
        now
      ];
      
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      
      return this.mapRowToTeam(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error creating team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Busca un equipo por su ID
   */
  async findById(id: string): Promise<Team | null> {
    try {
      const query = 'SELECT * FROM teams WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToTeam(result.rows[0]);
      
    } catch (error) {
      throw new Error(`Error finding team by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca todos los equipos de un usuario
   */
  async findByUserId(userId: string): Promise<Team[]> {
    try {
      const query = `
        SELECT t.*, d.name as division_name, d.gender as division_gender
        FROM teams t
        INNER JOIN divisions d ON t.division_id = d.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
      `;
      
      const result = await this.pool.query(query, [userId]);
      
      return result.rows.map(row => this.mapRowToTeam(row));
      
    } catch (error) {
      throw new Error(`Error finding teams by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Actualiza un equipo existente
   */
  async update(id: string, data: UpdateTeamDTO): Promise<Team> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Construir query dinámica con solo campos que se actualizan
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (data.name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        values.push(data.name);
      }
      
      if (data.clubName !== undefined) {
        updateFields.push(`club_name = $${paramCount++}`);
        values.push(data.clubName);
      }
      
      if (data.divisionId !== undefined) {
        updateFields.push(`division_id = $${paramCount++}`);
        values.push(data.divisionId);
      }
      
      if (data.maxPlayers !== undefined) {
        updateFields.push(`max_players = $${paramCount++}`);
        values.push(data.maxPlayers);
      }
      
      // Siempre actualizar updated_at
      updateFields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());
      
      // Agregar ID para WHERE clause
      values.push(id);
      
      const query = `
        UPDATE teams 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Team not found for update');
      }
      
      await client.query('COMMIT');
      
      return this.mapRowToTeam(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error updating team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Elimina un equipo
   */
  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Primero eliminar todas las relaciones de jugadoras con el equipo
      await client.query('DELETE FROM team_players WHERE team_id = $1', [id]);
      
      // Luego eliminar el equipo
      const result = await client.query('DELETE FROM teams WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        throw new Error('Team not found for deletion');
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error deleting team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Cuenta los equipos de un usuario
   */
  async countTeamsByUser(userId: string): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) as count FROM teams WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);
      
      return parseInt(result.rows[0].count, 10);
      
    } catch (error) {
      throw new Error(`Error counting user teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca equipos por club y división
   */
  async findByClubAndDivision(clubName: string, divisionId: string): Promise<Team[]> {
    try {
      const query = `
        SELECT * FROM teams 
        WHERE club_name = $1 AND division_id = $2
      `;
      
      const result = await this.pool.query(query, [clubName, divisionId]);
      
      return result.rows.map(row => this.mapRowToTeam(row));
      
    } catch (error) {
      throw new Error(`Error finding teams by club and division: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca equipos con filtros y paginación
   */
  async findWithFilters(filters: TeamFiltersDTO): Promise<PaginatedTeamsDTO> {
    try {
      // Construir WHERE clause dinámicamente
      const whereConditions: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (filters.teamName) {
        whereConditions.push(`t.name ILIKE $${paramCount++}`);
        values.push(`%${filters.teamName}%`);
      }
      
      if (filters.clubName) {
        whereConditions.push(`t.club_name ILIKE $${paramCount++}`);
        values.push(`%${filters.clubName}%`);
      }
      
      if (filters.divisionId) {
        whereConditions.push(`t.division_id = $${paramCount++}`);
        values.push(filters.divisionId);
      }
      
      if (filters.gender) {
        whereConditions.push(`d.gender = $${paramCount++}`);
        values.push(filters.gender);
      }
      
      if (filters.hasAvailableSpots) {
        whereConditions.push(`
          (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.id) < t.max_players
        `);
      }
      
      // Construir ORDER BY
      let orderBy = 'ORDER BY t.created_at DESC';
      if (filters.sortBy) {
        const sortField = filters.sortBy === 'name' ? 't.name' 
                        : filters.sortBy === 'clubName' ? 't.club_name'
                        : filters.sortBy === 'playerCount' ? 'player_count'
                        : 't.created_at';
        
        const sortDirection = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        orderBy = `ORDER BY ${sortField} ${sortDirection}`;
      }
      
      // Paginación
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      // Query principal con información completa
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const mainQuery = `
        SELECT 
          t.*,
          d.name as division_name,
          d.gender as division_gender,
          d.allows_shootout as division_allows_shootout,
          (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.id) as player_count
        FROM teams t
        INNER JOIN divisions d ON t.division_id = d.id
        ${whereClause}
        ${orderBy}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;
      
      values.push(limit, offset);
      
      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM teams t
        INNER JOIN divisions d ON t.division_id = d.id
        ${whereClause}
      `;
      
      // Ejecutar ambas queries
      const [mainResult, countResult] = await Promise.all([
        this.pool.query(mainQuery, values),
        this.pool.query(countQuery, values.slice(0, -2)) // Excluir limit y offset del count
      ]);
      
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(totalCount / limit);
      
      const teams: TeamResponseDTO[] = mainResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        clubName: row.club_name,
        division: {
          id: row.division_id,
          name: row.division_name,
          gender: row.division_gender,
          allowsShootout: row.division_allows_shootout
        },
        playerCount: parseInt(row.player_count, 10),
        maxPlayers: row.max_players,
        canAddPlayers: parseInt(row.player_count, 10) < row.max_players,
        canEdit: false, // Se determina en el servicio basado en el usuario
        canDelete: false, // Se determina en el servicio basado en el usuario
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      return {
        teams,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
      
    } catch (error) {
      throw new Error(`Error searching teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Agrega una jugadora a un equipo
   */
  async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar que la jugadora no esté ya en el equipo
      const existingQuery = 'SELECT 1 FROM team_players WHERE team_id = $1 AND player_id = $2';
      const existingResult = await client.query(existingQuery, [teamId, playerId]);
      
      if (existingResult.rows.length > 0) {
        throw new Error('Player is already in the team');
      }
      
      // Agregar la jugadora al equipo
      const insertQuery = `
        INSERT INTO team_players (team_id, player_id, joined_at)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(insertQuery, [teamId, playerId, new Date()]);
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error adding player to team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Remueve una jugadora de un equipo
   */
  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'DELETE FROM team_players WHERE team_id = $1 AND player_id = $2',
        [teamId, playerId]
      );
      
      if (result.rowCount === 0) {
        throw new Error('Player not found in team');
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error removing player from team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Obtiene la cantidad de jugadoras de un equipo
   */
  async getTeamPlayerCount(teamId: string): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) as count FROM team_players WHERE team_id = $1';
      const result = await this.pool.query(query, [teamId]);
      
      return parseInt(result.rows[0].count, 10);
      
    } catch (error) {
      throw new Error(`Error getting team player count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // --- Métodos auxiliares privados ---
  
  /**
   * Convierte una fila de la BD a objeto Team
   */
  private mapRowToTeam(row: any): Team {
    return {
      id: row.id,
      name: row.name,
      clubName: row.club_name,
      divisionId: row.division_id,
      userId: row.user_id,
      maxPlayers: row.max_players,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
