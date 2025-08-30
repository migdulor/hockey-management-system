/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Repositorio de Divisiones PostgreSQL
 * 
 * Implementación del repositorio de divisiones para PostgreSQL
 * con consultas optimizadas para validaciones de hockey
 */

import { Pool } from 'pg';
import { Division, DIVISION_CONFIG } from '../../core/entities/Division.js';
import { DivisionResponseDTO, DivisionDetailDTO } from '../../core/dtos/DivisionDTO.js';
import { DivisionRepository } from '../../core/services/TeamService.js';

/**
 * Implementación PostgreSQL del repositorio de divisiones
 */
export class DivisionRepositoryPostgres implements DivisionRepository {
  
  constructor(private pool: Pool) {}
  
  /**
   * Obtiene todas las divisiones
   */
  async findAll(): Promise<Division[]> {
    try {
      const query = `
        SELECT * FROM divisions 
        WHERE is_active = true
        ORDER BY 
          CASE name
            WHEN 'Sub14' THEN 1
            WHEN 'Sub16' THEN 2
            WHEN 'Sub19' THEN 3
            WHEN 'Inter' THEN 4
            WHEN 'Primera' THEN 5
            ELSE 6
          END
      `;
      
      const result = await this.pool.query(query);
      
      return result.rows.map(row => this.mapRowToDivision(row));
      
    } catch (error) {
      throw new Error(`Error finding all divisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca una división por su ID
   */
  async findById(id: string): Promise<Division | null> {
    try {
      const query = 'SELECT * FROM divisions WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToDivision(result.rows[0]);
      
    } catch (error) {
      throw new Error(`Error finding division by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca divisiones por género
   */
  async findByGender(gender: string): Promise<Division[]> {
    try {
      const query = `
        SELECT * FROM divisions 
        WHERE gender = $1 AND is_active = true
        ORDER BY 
          CASE name
            WHEN 'Sub14' THEN 1
            WHEN 'Sub16' THEN 2
            WHEN 'Sub19' THEN 3
            WHEN 'Inter' THEN 4
            WHEN 'Primera' THEN 5
            ELSE 6
          END
      `;
      
      const result = await this.pool.query(query, [gender]);
      
      return result.rows.map(row => this.mapRowToDivision(row));
      
    } catch (error) {
      throw new Error(`Error finding divisions by gender: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Valida si una fecha de nacimiento es elegible para una división
   */
  async validateAgeForDivision(birthDate: Date, divisionId: string): Promise<boolean> {
    try {
      const division = await this.findById(divisionId);
      if (!division) return false;
      
      const birthYear = birthDate.getFullYear();
      
      // Verificar límite mínimo (año máximo de nacimiento)
      if (division.maxBirthYear && birthYear > division.maxBirthYear) {
        return false;
      }
      
      // Verificar límite máximo (año mínimo de nacimiento)
      if (division.minBirthYear && birthYear < division.minBirthYear) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      throw new Error(`Error validating age for division: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene divisiones con información detallada y estadísticas
   */
  async findAllWithStats(): Promise<DivisionDetailDTO[]> {
    try {
      const query = `
        SELECT 
          d.*,
          COUNT(DISTINCT t.id) as team_count,
          COUNT(DISTINCT tp.player_id) as total_players,
          CASE 
            WHEN COUNT(DISTINCT t.id) > 0 
            THEN CAST(COUNT(DISTINCT tp.player_id) AS FLOAT) / COUNT(DISTINCT t.id)
            ELSE 0 
          END as avg_players_per_team
        FROM divisions d
        LEFT JOIN teams t ON d.id = t.division_id
        LEFT JOIN team_players tp ON t.id = tp.team_id
        WHERE d.is_active = true
        GROUP BY d.id, d.name, d.gender, d.min_birth_year, d.max_birth_year, 
                 d.allows_shootout, d.description, d.is_active, d.created_at, d.updated_at
        ORDER BY 
          CASE d.name
            WHEN 'Sub14' THEN 1
            WHEN 'Sub16' THEN 2
            WHEN 'Sub19' THEN 3
            WHEN 'Inter' THEN 4
            WHEN 'Primera' THEN 5
            ELSE 6
          END
      `;
      
      const result = await this.pool.query(query);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        gender: row.gender,
        allowsShootout: row.allows_shootout,
        description: row.description,
        ageRange: this.formatAgeRange(row.min_birth_year, row.max_birth_year),
        isActive: row.is_active,
        minBirthYear: row.min_birth_year,
        maxBirthYear: row.max_birth_year,
        teamCount: parseInt(row.team_count, 10),
        totalPlayers: parseInt(row.total_players, 10),
        averagePlayersPerTeam: parseFloat(row.avg_players_per_team) || 0,
        rules: {
          maxPlayersPerTeam: 20,
          allowsShootout: row.allows_shootout,
          canPlayInHigherDivisions: this.canPlayInHigherDivisions(row.name)
        },
        createdAt: row.created_at
      }));
      
    } catch (error) {
      throw new Error(`Error finding divisions with stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca divisiones apropiadas para una fecha de nacimiento
   */
  async findSuitableForBirthDate(birthDate: Date): Promise<Division[]> {
    try {
      const birthYear = birthDate.getFullYear();
      
      const query = `
        SELECT * FROM divisions 
        WHERE is_active = true
          AND (min_birth_year IS NULL OR $1 >= min_birth_year)
          AND (max_birth_year IS NULL OR $1 <= max_birth_year)
        ORDER BY 
          CASE name
            WHEN 'Sub14' THEN 1
            WHEN 'Sub16' THEN 2
            WHEN 'Sub19' THEN 3
            WHEN 'Inter' THEN 4
            WHEN 'Primera' THEN 5
            ELSE 6
          END
      `;
      
      const result = await this.pool.query(query, [birthYear]);
      
      return result.rows.map(row => this.mapRowToDivision(row));
      
    } catch (error) {
      throw new Error(`Error finding suitable divisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene el conteo de equipos por división
   */
  async getTeamCountByDivision(divisionId: string): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) as count FROM teams WHERE division_id = $1';
      const result = await this.pool.query(query, [divisionId]);
      
      return parseInt(result.rows[0].count, 10);
      
    } catch (error) {
      throw new Error(`Error getting team count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Inicializa las divisiones por defecto si no existen
   */
  async initializeDefaultDivisions(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar si ya existen divisiones
      const countQuery = 'SELECT COUNT(*) as count FROM divisions';
      const countResult = await client.query(countQuery);
      
      if (parseInt(countResult.rows[0].count, 10) > 0) {
        await client.query('ROLLBACK');
        return; // Ya existen divisiones
      }
      
      // Insertar divisiones por defecto
      for (const [key, config] of Object.entries(DIVISION_CONFIG)) {
        const insertQuery = `
          INSERT INTO divisions (
            id, name, gender, min_birth_year, max_birth_year, 
            allows_shootout, description, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        
        const values = [
          key.toLowerCase(),
          config.name,
          config.gender,
          config.minBirthYear,
          config.maxBirthYear,
          config.allowsShootout,
          config.description,
          config.isActive,
          new Date(),
          new Date()
        ];
        
        await client.query(insertQuery, values);
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error initializing default divisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
  
  // --- Métodos auxiliares privados ---
  
  /**
   * Convierte una fila de la BD a objeto Division
   */
  private mapRowToDivision(row: any): Division {
    return {
      id: row.id,
      name: row.name,
      gender: row.gender,
      minBirthYear: row.min_birth_year,
      maxBirthYear: row.max_birth_year,
      allowsShootout: row.allows_shootout,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Formatea el rango de edad como string
   */
  private formatAgeRange(minBirthYear?: number, maxBirthYear?: number): string {
    if (minBirthYear && maxBirthYear) {
      return `${maxBirthYear}-${minBirthYear}`;
    } else if (minBirthYear) {
      return `${minBirthYear} o antes`;
    } else if (maxBirthYear) {
      return `${maxBirthYear} o después`;
    }
    return 'Sin restricciones';
  }
  
  /**
   * Determina si una división puede jugar en divisiones superiores
   */
  private canPlayInHigherDivisions(divisionName: string): boolean {
    const hierarchyOrder = ['Sub14', 'Sub16', 'Sub19', 'Inter', 'Primera'];
    const currentIndex = hierarchyOrder.indexOf(divisionName);
    
    // Las jugadoras pueden jugar en divisiones iguales o superiores
    return currentIndex >= 0 && currentIndex < hierarchyOrder.length - 1;
  }
}
