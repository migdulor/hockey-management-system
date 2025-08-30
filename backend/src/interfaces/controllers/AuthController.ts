import { Request, Response } from 'express';
import { AuthService, LoginDTO, RegisterDTO } from '../../core/services/AuthService.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Iniciar sesión de usuario
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginDTO = req.body;

      // Validar entrada básica (Joi ya validó la estructura)
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
          error: 'MISSING_CREDENTIALS'
        });
        return;
      }

      // Procesar login
      const result = await this.authService.login(email, password);

      if (!result.success) {
        // Usar código 401 para credenciales inválidas
        const statusCode = result.message?.includes('Credenciales') ? 401 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: 'LOGIN_FAILED',
          errors: result.errors
        });
        return;
      }

      // Login exitoso
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });

    } catch (error: any) {
      console.error('Error in login controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterDTO = req.body;

      // Procesar registro
      const result = await this.authService.register(userData);

      if (!result.success) {
        // Determinar código de estado apropiado
        let statusCode = 400;
        if (result.message?.includes('Email ya registrado')) {
          statusCode = 409; // Conflict
        }

        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: 'REGISTRATION_FAILED',
          errors: result.errors
        });
        return;
      }

      // Registro exitoso
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });

    } catch (error: any) {
      console.error('Error in register controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar token de acceso usando refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token es requerido',
          error: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      // Procesar renovación de token
      const result = await this.authService.refreshToken(refreshToken);

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
          error: 'REFRESH_FAILED',
          errors: result.errors
        });
        return;
      }

      // Renovación exitosa
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });

    } catch (error: any) {
      console.error('Error in refresh controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Cerrar sesión (invalidar tokens)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Obtener tokens del request
      const accessToken = req.token; // Del middleware de autenticación
      const { refreshToken } = req.body;

      if (!accessToken) {
        res.status(400).json({
          success: false,
          message: 'Token de acceso es requerido',
          error: 'MISSING_ACCESS_TOKEN'
        });
        return;
      }

      // Procesar logout
      const result = await this.authService.logout(accessToken, refreshToken);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: 'LOGOUT_FAILED',
          errors: result.errors
        });
        return;
      }

      // Logout exitoso
      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error: any) {
      console.error('Error in logout controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtener información del usuario autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está disponible por el middleware de autenticación
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Obtener información completa del usuario desde la base de datos
      // (req.user solo tiene la información del token, podría estar desactualizada)
      const userRepository = (this.authService as any).userRepository;
      const fullUser = await userRepository.findById(req.user.userId);

      if (!fullUser) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        });
        return;
      }

      // Remover información sensible
      const { password_hash, ...userWithoutPassword } = fullUser;

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          user: userWithoutPassword
        }
      });

    } catch (error: any) {
      console.error('Error in getProfile controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas',
          error: 'MISSING_PASSWORDS'
        });
        return;
      }

      // Procesar cambio de contraseña
      const result = await this.authService.changePassword(req.user.userId, currentPassword, newPassword);

      if (!result.success) {
        const statusCode = result.message?.includes('actual incorrecta') ? 401 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message,
          error: 'PASSWORD_CHANGE_FAILED',
          errors: result.errors
        });
        return;
      }

      // Cambio exitoso
      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error: any) {
      console.error('Error in changePassword controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/auth/check-team-limit
   * Verificar si el usuario puede crear más equipos
   */
  async checkTeamLimit(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Verificar límite de equipos
      const canCreate = await this.authService.canUserCreateTeam(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Verificación de límite completada',
        data: {
          canCreate: canCreate.canCreate,
          reason: canCreate.reason,
          currentPlan: req.user.plan
        }
      });

    } catch (error: any) {
      console.error('Error in checkTeamLimit controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/auth/validate-token
   * Validar token de acceso (útil para frontend)
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      // Si llegó hasta aquí, el token es válido (gracias al middleware)
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user,
          isValid: true
        }
      });

    } catch (error: any) {
      console.error('Error in validateToken controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}
