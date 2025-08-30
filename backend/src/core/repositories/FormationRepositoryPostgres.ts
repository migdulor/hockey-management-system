import { Formation, FormationPosition } from '../entities/models.js';
import { FormationRepository } from './FormationRepository.js';
import { sql } from '@vercel/postgres';

export class FormationRepositoryPostgres implements FormationRepository {
  async create(formation: Formation): Promise<Formation> {
    const createdAt = new Date().toISOString().replace('T', ' ').replace('Z', '');
    
    const result = await sql`
      INSERT INTO formations (
        id, team_id, name, description, match_id, rival_team_name,
        match_date, match_time, match_location, tactical_system,
        formation_type, field_dimensions, color_scheme, is_template,
        template_category, export_settings, version, usage_count,
        last_used_at, created_at, updated_at
      )
      VALUES (
        ${formation.id}, ${formation.teamId}, ${formation.name}, 
        ${formation.description || null}, ${formation.matchId || null},
        ${formation.rivalTeamName || null}, 
        ${formation.matchDate ? formation.matchDate.toISOString().split('T')[0] : null},
        ${formation.matchTime || null}, ${formation.matchLocation || null},
        ${formation.tacticalSystem}, ${formation.formationType},
        ${JSON.stringify(formation.fieldDimensions || {})},
        ${JSON.stringify(formation.colorScheme || {})},
        ${formation.isTemplate}, ${formation.templateCategory || null},
        ${JSON.stringify(formation.exportSettings)}, ${formation.version || 1},
        ${formation.usageCount || 0}, ${formation.lastUsedAt ? formation.lastUsedAt.toISOString().replace('T', ' ').replace('Z', '') : null},
        ${createdAt}, ${createdAt}
      )
      RETURNING *
    `;
    
    return this.mapRowToFormation(result.rows[0]);
  }

  async findById(id: string): Promise<Formation | null> {
    const result = await sql`
      SELECT * FROM formations WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToFormation(result.rows[0]);
  }

  async findAll(options?: { 
    teamId?: string; 
    isTemplate?: boolean;
    templateCategory?: string;
    matchId?: string;
  }): Promise<Formation[]> {
    let whereConditions = [];
    let params: any[] = [];

    if (options?.teamId) {
      whereConditions.push(`team_id = $${params.length + 1}`);
      params.push(options.teamId);
    }
    if (options?.isTemplate !== undefined) {
      whereConditions.push(`is_template = $${params.length + 1}`);
      params.push(options.isTemplate);
    }
    if (options?.templateCategory) {
      whereConditions.push(`template_category = $${params.length + 1}`);
      params.push(options.templateCategory);
    }
    if (options?.matchId) {
      whereConditions.push(`match_id = $${params.length + 1}`);
      params.push(options.matchId);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM formations 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await sql.query(query, params);
    return result.rows.map(row => this.mapRowToFormation(row));
  }

  async findByTeamId(teamId: string): Promise<Formation[]> {
    return this.findAll({ teamId });
  }

  async findTemplates(category?: string): Promise<Formation[]> {
    return this.findAll({ isTemplate: true, templateCategory: category });
  }

  async findByMatch(matchId: string): Promise<Formation | null> {
    const results = await this.findAll({ matchId });
    return results.length > 0 ? results[0] : null;
  }

  async update(id: string, formation: Partial<Formation>): Promise<Formation> {
    const updatedAt = new Date().toISOString().replace('T', ' ').replace('Z', '');
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (formation.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(formation.name);
    }
    if (formation.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(formation.description);
    }
    if (formation.tacticalSystem) {
      fields.push(`tactical_system = $${paramCount++}`);
      values.push(formation.tacticalSystem);
    }
    if (formation.formationType) {
      fields.push(`formation_type = $${paramCount++}`);
      values.push(formation.formationType);
    }
    if (formation.isTemplate !== undefined) {
      fields.push(`is_template = $${paramCount++}`);
      values.push(formation.isTemplate);
    }
    if (formation.templateCategory !== undefined) {
      fields.push(`template_category = $${paramCount++}`);
      values.push(formation.templateCategory);
    }
    if (formation.exportSettings) {
      fields.push(`export_settings = $${paramCount++}`);
      values.push(JSON.stringify(formation.exportSettings));
    }
    if (formation.fieldDimensions) {
      fields.push(`field_dimensions = $${paramCount++}`);
      values.push(JSON.stringify(formation.fieldDimensions));
    }
    if (formation.colorScheme) {
      fields.push(`color_scheme = $${paramCount++}`);
      values.push(JSON.stringify(formation.colorScheme));
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing as Formation;
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(updatedAt);
    values.push(id);

    const query = `
      UPDATE formations 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await sql.query(query, values);
    return this.mapRowToFormation(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    // Delete formation positions first due to foreign key constraint
    await sql`DELETE FROM formation_positions WHERE formation_id = ${id}`;
    await sql`DELETE FROM formations WHERE id = ${id}`;
  }

  async cloneFormation(sourceFormationId: string, newName: string, targetTeamId?: string): Promise<string> {
    const originalFormation = await this.findById(sourceFormationId);
    if (!originalFormation) {
      throw new Error('Formation not found');
    }

    const newFormationId = `formation_${Date.now()}`;
    const newFormation: Formation = {
      ...originalFormation,
      id: newFormationId,
      name: newName,
      teamId: targetTeamId || originalFormation.teamId,
      isTemplate: false,
      matchId: undefined,
      rivalTeamName: undefined,
      matchDate: undefined,
      matchTime: undefined,
      matchLocation: undefined,
      version: 1,
      usageCount: 0,
      lastUsedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.create(newFormation);
    
    // Copy positions if they exist
    const positions = await sql`
      SELECT * FROM formation_positions WHERE formation_id = ${sourceFormationId}
    `;
    
    for (const position of positions.rows) {
      await sql`
        INSERT INTO formation_positions (
          id, formation_id, player_id, position_type, position_number,
          field_position_x, field_position_y, position_name, tactical_role,
          position_zone, jersey_number, captain, vice_captain, special_instructions
        )
        VALUES (
          ${`pos_${Date.now()}_${Math.random()}`}, ${newFormationId},
          ${position.player_id}, ${position.position_type}, ${position.position_number},
          ${position.field_position_x}, ${position.field_position_y}, 
          ${position.position_name}, ${position.tactical_role}, ${position.position_zone},
          ${position.jersey_number}, ${position.captain}, ${position.vice_captain},
          ${position.special_instructions}
        )
      `;
    }

    return newFormationId;
  }

  async markAsTemplate(formationId: string, category: string): Promise<Formation> {
    return this.update(formationId, { 
      isTemplate: true, 
      templateCategory: category 
    });
  }

  async incrementUsageCount(formationId: string): Promise<void> {
    const formation = await this.findById(formationId);
    if (formation) {
      await this.update(formationId, {
        usageCount: (formation.usageCount || 0) + 1,
        lastUsedAt: new Date()
      });
    }
  }

  async findWithDetails(formationId: string): Promise<Formation & {
    positions: FormationPosition[];
    startersCount: number;
    substitutesCount: number;
  }> {
    const formation = await this.findById(formationId);
    if (!formation) {
      throw new Error('Formation not found');
    }

    const positionsResult = await sql`
      SELECT fp.*, p.first_name, p.last_name
      FROM formation_positions fp
      LEFT JOIN players p ON fp.player_id = p.id
      WHERE fp.formation_id = ${formationId}
      ORDER BY fp.position_number
    `;

    const positions: FormationPosition[] = positionsResult.rows.map(row => ({
      id: row.id,
      formationId: row.formation_id,
      playerId: row.player_id,
      positionType: row.position_type,
      positionNumber: row.position_number,
      fieldPositionX: row.field_position_x,
      fieldPositionY: row.field_position_y,
      positionName: row.position_name,
      tacticalRole: row.tactical_role,
      positionZone: row.position_zone,
      jerseyNumber: row.jersey_number,
      captain: row.captain,
      viceCaptain: row.vice_captain,
      specialInstructions: row.special_instructions,
      createdAt: new Date(row.created_at || Date.now()),
      updatedAt: new Date(row.updated_at || Date.now())
    }));

    const startersCount = positions.filter(p => p.positionType === 'starter').length;
    const substitutesCount = positions.filter(p => p.positionType === 'substitute').length;

    return {
      ...formation,
      positions,
      startersCount,
      substitutesCount
    };
  }

  private mapRowToFormation(row: any): Formation {
    return {
      id: row.id,
      teamId: row.team_id,
      name: row.name,
      description: row.description,
      matchId: row.match_id,
      rivalTeamName: row.rival_team_name,
      matchDate: row.match_date ? new Date(row.match_date) : undefined,
      matchTime: row.match_time,
      matchLocation: row.match_location,
      tacticalSystem: row.tactical_system,
      formationType: row.formation_type,
      fieldDimensions: row.field_dimensions ? JSON.parse(row.field_dimensions) : undefined,
      colorScheme: row.color_scheme ? JSON.parse(row.color_scheme) : undefined,
      isTemplate: row.is_template,
      templateCategory: row.template_category,
      exportSettings: JSON.parse(row.export_settings),
      version: row.version,
      usageCount: row.usage_count,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
