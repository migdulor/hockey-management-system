import { Request, Response, NextFunction } from 'express';
import { TokenService, TokenPayload } from '../../core/services/TokenService.js';
import { UserRepository } from '../../core/interfaces/UserRepository.js';
import { AuthService, Plan } from '../../core/services/AuthService.js';

// Extender tipos de Express para incluir user y token
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      token?: string;
    }
  }
}

export interface AuthMiddlewareOptions {
  optional?: boolean; // Si true, no falla si no hay token
}

export type Role = 'admin' | 'coach';

export class AuthMiddleware {
  constructor(
    private tokenService: TokenService,
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  /**
   * Middleware principal de autenticación
   * Verifica token JWT y añade datos de usuario al request
   */
  requireAuth = (options: AuthMiddlewareOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        const token = this.tokenService.extractTokenFromHeader(authHeader);

        if (!token) {
          if (options.optional) {
            return next();
          }
          return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido',
            error: 'MISSING_TOKEN'
          });
        }

        // Verificar token
        let decoded: TokenPayload;
        try {
          decoded = this.tokenService.verifyToken(token);
        } catch (error: any) {
          if (options.optional) {
            return next();
          }
          
          let errorCode = 'INVALID_TOKEN';
          let message = 'Token inválido';
          
          if (error.message === 'Token has expired') {
            errorCode = 'TOKEN_EXPIRED';
            message = 'Token expirado';
          } else if (error.message === 'Token has been blacklisted') {
            errorCode = 'TOKEN_BLACKLISTED';
            message = 'Token revocado';
          }

          return res.status(401).json({
            success: false,
            message,
            error: errorCode
          });
        }

        // Verificar que el usuario aún existe y está activo
        const user = await this.userRepository.findById(decoded.userId);
        if (!user || !user.is_active) {
          return res.status(401).json({
            success: false,
            message: 'Usuario no válido',
            error: 'INVALID_USER'
          });
        }

        // Añadir datos al request
        req.user = decoded;
        req.token = token;

        next();

      } catch (error: any) {
        console.error('Error in auth middleware:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_ERROR'
        });
      }
    };
  };

  /**
   * Middleware que requiere roles específicos
   * Debe usarse después de requireAuth
   */
  requireRole = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          error: 'NOT_AUTHENTICATED'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
          error: 'INSUFFICIENT_ROLE',
          required: allowedRoles,
          current: req.user.role
        });
      }

      next();
    };
  };

  /**
   * Middleware que requiere plan mínimo
   * Debe usarse después de requireAuth
   */
  requirePlan = (minPlan: Plan) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          error: 'NOT_AUTHENTICATED'
        });
      }

      try {
        const hasValidPlan = await this.authService.validateUserPlan(req.user.userId, minPlan);
        
        if (!hasValidPlan) {
          return res.status(403).json({
            success: false,
            message: `Plan insuficiente. Se requiere: ${minPlan}`,
            error: 'INSUFFICIENT_PLAN',
            required: minPlan,
            current: req.user.plan
          });
        }

        next();

      } catch (error: any) {
        console.error('Error checking user plan:', error);
        return res.status(500).json({
          success: false,
          message: 'Error verificando plan de usuario',
          error: 'PLAN_CHECK_ERROR'
        });
      }
    };
  };

  /**
   * Middleware solo para administradores
   */
  requireAdmin = () => {
    return this.requireRole(['admin']);
  };

  /**
   * Middleware solo para coaches
   */
  requireCoach = () => {
    return this.requireRole(['coach']);
  };

  /**
   * Middleware que permite admin o coach
   */
  requireAnyRole = () => {
    return this.requireRole(['admin', 'coach']);
  };

  /**
   * Middleware que verifica que el usuario puede crear equipos
   */
  canCreateTeam = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          error: 'NOT_AUTHENTICATED'
        });
      }

      try {
        const canCreate = await this.authService.canUserCreateTeam(req.user.userId);
        
        if (!canCreate.canCreate) {
          return res.status(403).json({
            success: false,
            message: canCreate.reason || 'No puede crear más equipos',
            error: 'TEAM_LIMIT_EXCEEDED'
          });
        }

        next();

      } catch (error: any) {
        console.error('Error checking team creation limit:', error);
        return res.status(500).json({
          success: false,
          message: 'Error verificando límites de equipo',
          error: 'TEAM_LIMIT_CHECK_ERROR'
        });
      }
    };
  };

  /**
   * Middleware que verifica ownership del recurso
   * Verifica que req.user.userId === req.params.userId
   */
  requireOwnership = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          error: 'NOT_AUTHENTICATED'
        });
      }

      // Los admins pueden acceder a cualquier recurso
      if (req.user.role === 'admin') {
        return next();
      }

      // Para coaches, verificar ownership
      const resourceUserId = req.params.userId || req.body.userId;
      
      if (req.user.userId !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes acceder a tus propios recursos',
          error: 'ACCESS_DENIED'
        });
      }

      next();
    };
  };

  /**
   * Middleware para verificar token próximo a expirar y sugerir renovación
   */
  checkTokenExpiration = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.token || !req.user) {
        return next();
      }

      try {
        if (this.tokenService.isTokenNearExpiration(req.token)) {
          res.setHeader('X-Token-Refresh-Needed', 'true');
        }
      } catch (error) {
        // Ignorar errores en esta verificación
      }

      next();
    };
  };
}

// Helper para crear middlewares con dependencias inyectadas
export const createAuthMiddleware = (
  tokenService: TokenService,
  userRepository: UserRepository,
  authService: AuthService
): AuthMiddleware => {
  return new AuthMiddleware(tokenService, userRepository, authService);
};
