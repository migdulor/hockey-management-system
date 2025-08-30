import { sql } from '@vercel/postgres';
import { FormationPosition } from '../entities/models.js';
import { FormationPositionRepository } from './FormationRepository.js';

export class FormationPositionRepositoryPostgres implements FormationPositionRepository {
  
  async create(position: FormationPosition): Promise<FormationPosition> {
    const result = await sql`
      INSERT INTO formation_positions (
        id, formation_id, player_id, position_type, position_number,
        field_position_x, field_position_y, position_name, tactical_role,
        position_zone, jersey_number, captain, vice_captain, special_instructions
      )
      VALUES (
        ${position.id}, ${position.formationId}, ${position.playerId},
        ${position.positionType}, ${position.positionNumber},
        ${position.fieldPositionX}, ${position.fieldPositionY},
        ${position.positionName || null}, ${position.tacticalRole || null},
        ${position.positionZone}, ${position.jerseyNumber || null},
        ${position.captain}, ${position.viceCaptain}, ${position.specialInstructions || null}
      )
      RETURNING *
    `;
    
    return this.mapRowToFormationPosition(result.rows[0]);
  }

  async findById(id: string): Promise<FormationPosition | null> {
    const result = await sql`
      SELECT * FROM formation_positions WHERE id = ${id}
    `;
    
    return result.rows[0] ? this.mapRowToFormationPosition(result.rows[0]) : null;
  }

  async findByFormation(formationId: string): Promise<FormationPosition[]> {
    const result = await sql`
      SELECT fp.*, p.name as player_name
      FROM formation_positions fp
      LEFT JOIN players p ON fp.player_id = p.id
      WHERE fp.formation_id = ${formationId}
      ORDER BY fp.position_type, fp.position_number
    `;
    
    return result.rows.map(row => this.mapRowToFormationPosition(row));
  }

  async findByPlayer(playerId: string): Promise<FormationPosition[]> {
    const result = await sql`
      SELECT fp.*, f.name as formation_name
      FROM formation_positions fp
      JOIN formations f ON fp.formation_id = f.id
      WHERE fp.player_id = ${playerId}
      ORDER BY f.created_at DESC
    `;
    
    return result.rows.map(row => this.mapRowToFormationPosition(row));
  }

  async update(id: string, position: Partial<FormationPosition>): Promise<FormationPosition> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (position.playerId !== undefined) {
      fields.push(`player_id = $${paramCount++}`);
      values.push(position.playerId);
    }
    if (position.positionType !== undefined) {
      fields.push(`position_type = $${paramCount++}`);
      values.push(position.positionType);
    }
    if (position.positionNumber !== undefined) {
      fields.push(`position_number = $${paramCount++}`);
      values.push(position.positionNumber);
    }
    if (position.fieldPositionX !== undefined) {
      fields.push(`field_position_x = $${paramCount++}`);
      values.push(position.fieldPositionX);
    }
    if (position.fieldPositionY !== undefined) {
      fields.push(`field_position_y = $${paramCount++}`);
      values.push(position.fieldPositionY);
    }
    if (position.positionName !== undefined) {
      fields.push(`position_name = $${paramCount++}`);
      values.push(position.positionName);
    }
    if (position.tacticalRole !== undefined) {
      fields.push(`tactical_role = $${paramCount++}`);
      values.push(position.tacticalRole);
    }
    if (position.positionZone !== undefined) {
      fields.push(`position_zone = $${paramCount++}`);
      values.push(position.positionZone);
    }
    if (position.jerseyNumber !== undefined) {
      fields.push(`jersey_number = $${paramCount++}`);
      values.push(position.jerseyNumber);
    }
    if (position.captain !== undefined) {
      fields.push(`captain = $${paramCount++}`);
      values.push(position.captain);
    }
    if (position.viceCaptain !== undefined) {
      fields.push(`vice_captain = $${paramCount++}`);
      values.push(position.viceCaptain);
    }
    if (position.specialInstructions !== undefined) {
      fields.push(`special_instructions = $${paramCount++}`);
      values.push(position.specialInstructions);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as FormationPosition;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE formation_positions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql.query(query, values);
    
    return this.mapRowToFormationPosition(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM formation_positions WHERE id = ${id}`;
  }

  // US006: Métodos específicos para drag & drop
  async updatePosition(id: string, x: number, y: number): Promise<FormationPosition> {
    const result = await sql`
      UPDATE formation_positions 
      SET field_position_x = ${x}, field_position_y = ${y}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return this.mapRowToFormationPosition(result.rows[0]);
  }

  async updatePositions(positions: Array<{ id: string; x: number; y: number }>): Promise<FormationPosition[]> {
    const results: FormationPosition[] = [];
    
    for (const pos of positions) {
      const updated = await this.updatePosition(pos.id, pos.x, pos.y);
      results.push(updated);
    }
    
    return results;
  }

  // Validaciones
  async getStartersCount(formationId: string): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM formation_positions 
      WHERE formation_id = ${formationId} AND position_type = 'starter'
    `;
    
    return parseInt(result.rows[0].count);
  }

  async getSubstitutesCount(formationId: string): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM formation_positions 
      WHERE formation_id = ${formationId} AND position_type = 'substitute'
    `;
    
    return parseInt(result.rows[0].count);
  }

  // Obtener posiciones ordenadas
  async findStartersByPosition(formationId: string): Promise<FormationPosition[]> {
    const result = await sql`
      SELECT fp.*, p.name as player_name
      FROM formation_positions fp
      LEFT JOIN players p ON fp.player_id = p.id
      WHERE fp.formation_id = ${formationId} AND fp.position_type = 'starter'
      ORDER BY fp.position_number
    `;
    
    return result.rows.map(row => this.mapRowToFormationPosition(row));
  }

  async findSubstitutesByPosition(formationId: string): Promise<FormationPosition[]> {
    const result = await sql`
      SELECT fp.*, p.name as player_name
      FROM formation_positions fp
      LEFT JOIN players p ON fp.player_id = p.id
      WHERE fp.formation_id = ${formationId} AND fp.position_type = 'substitute'
      ORDER BY fp.position_number
    `;
    
    return result.rows.map(row => this.mapRowToFormationPosition(row));
  }

  // Intercambiar posiciones
  async swapPositions(positionId1: string, positionId2: string): Promise<[FormationPosition, FormationPosition]> {
    // Obtener ambas posiciones
    const pos1 = await this.findById(positionId1);
    const pos2 = await this.findById(positionId2);
    
    if (!pos1 || !pos2) {
      throw new Error('One or both positions not found');
    }
    
    // Intercambiar coordenadas y datos relevantes
    const updatedPos1 = await this.update(positionId1, {
      fieldPositionX: pos2.fieldPositionX,
      fieldPositionY: pos2.fieldPositionY,
      positionNumber: pos2.positionNumber,
      positionName: pos2.positionName,
      tacticalRole: pos2.tacticalRole,
      positionZone: pos2.positionZone
    });
    
    const updatedPos2 = await this.update(positionId2, {
      fieldPositionX: pos1.fieldPositionX,
      fieldPositionY: pos1.fieldPositionY,
      positionNumber: pos1.positionNumber,
      positionName: pos1.positionName,
      tacticalRole: pos1.tacticalRole,
      positionZone: pos1.positionZone
    });
    
    return [updatedPos1, updatedPos2];
  }

  private mapRowToFormationPosition(row: any): FormationPosition {
    return {
      id: row.id,
      formationId: row.formation_id,
      playerId: row.player_id,
      positionType: row.position_type as 'starter' | 'substitute',
      positionNumber: row.position_number,
      fieldPositionX: parseFloat(row.field_position_x),
      fieldPositionY: parseFloat(row.field_position_y),
      positionName: row.position_name,
      tacticalRole: row.tactical_role,
      positionZone: row.position_zone as 'defensive' | 'midfield' | 'offensive',
      jerseyNumber: row.jersey_number,
      captain: row.captain,
      viceCaptain: row.vice_captain,
      specialInstructions: row.special_instructions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
