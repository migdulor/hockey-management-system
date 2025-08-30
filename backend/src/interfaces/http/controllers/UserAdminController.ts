import { Request, Response } from 'express';
import { AuthService, RegisterDTO } from '../../../core/services/AuthService.js';
import { UserRepositoryPostgres } from '../../../infrastructure/repositories/UserRepositoryPostgres.js';
import { PasswordService } from '../../../core/services/PasswordService.js';
import { TokenService } from '../../../core/services/TokenService.js';
import { sql } from '@vercel/postgres';
import { Pool } from 'pg';

export class UserAdminController {
  private authService: AuthService;
  private userRepository: UserRepositoryPostgres;

  constructor() {
    // Crear mock pool para compatibilidad (usamos sql de Vercel directamente)
    const mockPool = {} as Pool;
    this.userRepository = new UserRepositoryPostgres(mockPool);
    
    const passwordService = new PasswordService();
    const tokenService = new TokenService();
    this.authService = new AuthService(this.userRepository, passwordService, tokenService);
  }

  /**
   * Listar todos los usuarios (solo admins)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const result = await sql`
        SELECT id, email, first_name, last_name, role, plan, is_active, 
               last_login, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `;

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nuevo usuario (entrenador/admin)
   */
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, role, plan, first_name, last_name } = req.body;

      // Validaciones
      if (!email || !password || !role || !plan || !first_name || !last_name) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        });
      }

      if (!['admin', 'coach'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol debe ser admin o coach'
        });
      }

      if (!['2_teams', '3_teams', '5_teams'].includes(plan)) {
        return res.status(400).json({
          success: false,
          error: 'Plan debe ser 2_teams, 3_teams o 5_teams'
        });
      }

      // Verificar que el email no exista
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }

      // Crear usuario usando el AuthService
      const registerData: RegisterDTO = {
        email,
        password,
        role: role as 'admin' | 'coach',
        plan: plan as '2_teams' | '3_teams' | '5_teams',
        first_name,
        last_name
      };

      const result = await this.authService.register(registerData);

      if (result.success && result.user) {
        res.status(201).json({
          success: true,
          data: result.user,
          message: 'Usuario creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message || 'Error creando usuario',
          errors: result.errors
        });
      }

    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await sql`
        SELECT id, email, first_name, last_name, role, plan, is_active,
               last_login, created_at, updated_at
        FROM users 
        WHERE id = ${id}
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { first_name, last_name, role, plan, is_active } = req.body;

      // Validaciones
      if (role && !['admin', 'coach'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol debe ser admin o coach'
        });
      }

      if (plan && !['2_teams', '3_teams', '5_teams'].includes(plan)) {
        return res.status(400).json({
          success: false,
          error: 'Plan debe ser 2_teams, 3_teams o 5_teams'
        });
      }

      // Verificar que el usuario existe
      const existingUser = await sql`
        SELECT id FROM users WHERE id = ${id}
      `;

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Actualizar usuario
      const result = await sql`
        UPDATE users 
        SET 
          first_name = COALESCE(${first_name}, first_name),
          last_name = COALESCE(${last_name}, last_name),
          role = COALESCE(${role}, role),
          plan = COALESCE(${plan}, plan),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, email, first_name, last_name, role, plan, is_active,
                 last_login, created_at, updated_at
      `;

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Usuario actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await sql`
        UPDATE users 
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, email, first_name, last_name, role, plan, is_active
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      const user = result.rows[0];
      res.json({
        success: true,
        data: user,
        message: `Usuario ${user.is_active ? 'activado' : 'desactivado'} exitosamente`
      });

    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Resetear contraseña de usuario
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      if (!new_password || new_password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Hash de la nueva contraseña
      const passwordService = new PasswordService();
      const hashedPassword = await passwordService.hashPassword(new_password);

      const result = await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, email, first_name, last_name
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await sql`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
          COUNT(*) FILTER (WHERE role = 'coach') as total_coaches,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE plan = '2_teams') as plan_2_teams,
          COUNT(*) FILTER (WHERE plan = '3_teams') as plan_3_teams,
          COUNT(*) FILTER (WHERE plan = '5_teams') as plan_5_teams,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as users_last_30_days
        FROM users
      `;

      res.json({
        success: true,
        data: stats.rows[0]
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
