import { Pool } from 'pg';
import { UserRepository, User, CreateUserDTO, UpdateUserDTO } from '../../core/interfaces/UserRepository.js';

export class UserRepositoryPostgres implements UserRepository {
  constructor(private db: Pool) {}

  /**
   * Crear nuevo usuario
   */
  async create(userData: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO users (
        email, password_hash, role, plan, first_name, last_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING *
    `;

    const values = [
      userData.email,
      userData.password_hash,
      userData.role,
      userData.plan,
      userData.first_name,
      userData.last_name
    ];

    try {
      const result = await this.db.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND is_active = true
    `;

    try {
      const result = await this.db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToUser(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND is_active = true
    `;

    try {
      const result = await this.db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToUser(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await this.db.query(query, [id]);
    } catch (error: any) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  /**
   * Actualizar datos de usuario
   */
  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    // Construir query dinámicamente basado en los campos a actualizar
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.first_name !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(data.first_name);
      paramCount++;
    }

    if (data.last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(data.last_name);
      paramCount++;
    }

    if (data.plan !== undefined) {
      updateFields.push(`plan = $${paramCount}`);
      values.push(data.plan);
      paramCount++;
    }

    if (data.is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      values.push(data.is_active);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    // Siempre actualizar updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id); // Para el WHERE

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToUser(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Obtener todos los usuarios activos
   */
  async findAll(): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.db.query(query);
      return result.rows.map(row => this.mapRowToUser(row));
    } catch (error: any) {
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }

  /**
   * Desactivar usuario (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET is_active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      const result = await this.db.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
    } catch (error: any) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  /**
   * Activar usuario
   */
  async activate(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET is_active = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      const result = await this.db.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
    } catch (error: any) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  /**
   * Mapear fila de base de datos a objeto User
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role,
      plan: row.plan,
      first_name: row.first_name,
      last_name: row.last_name,
      is_active: row.is_active,
      last_login_at: row.last_login_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Verificar si un email ya existe (para validaciones)
   */
  async emailExists(email: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM users 
      WHERE email = $1
      LIMIT 1
    `;

    try {
      const result = await this.db.query(query, [email]);
      return result.rows.length > 0;
    } catch (error: any) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }

  /**
   * Contar equipos activos de un usuario (para validación de planes)
   */
  async countActiveTeams(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM teams 
      WHERE user_id = $1 AND is_active = true
    `;

    try {
      const result = await this.db.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error: any) {
      throw new Error(`Failed to count user teams: ${error.message}`);
    }
  }
}
