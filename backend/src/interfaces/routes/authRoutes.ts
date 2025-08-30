import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { AuthMiddleware } from '../../infrastructure/middleware/AuthMiddleware.js';
import { 
  loginRateLimit, 
  registerRateLimit, 
  validateInput, 
  validationSchemas,
  securityHeaders,
  sanitizeInput
} from '../../infrastructure/middleware/SecurityMiddleware.js';

export class AuthRoutes {
  public router: Router;

  constructor(
    private authController: AuthController,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Aplicar middlewares de seguridad globalmente
    this.router.use(securityHeaders);
    this.router.use(sanitizeInput);

    // POST /api/auth/login - Iniciar sesión
    this.router.post('/login', 
      loginRateLimit,
      validateInput(validationSchemas.login),
      this.authController.login.bind(this.authController)
    );

    // POST /api/auth/register - Registrar usuario
    this.router.post('/register', 
      registerRateLimit,
      validateInput(validationSchemas.register),
      this.authController.register.bind(this.authController)
    );

    // POST /api/auth/refresh - Renovar token
    this.router.post('/refresh', 
      validateInput(validationSchemas.refreshToken),
      this.authController.refresh.bind(this.authController)
    );

    // POST /api/auth/logout - Cerrar sesión (requiere autenticación)
    this.router.post('/logout', 
      this.authMiddleware.requireAuth(),
      this.authController.logout.bind(this.authController)
    );

    // GET /api/auth/me - Perfil del usuario autenticado
    this.router.get('/me', 
      this.authMiddleware.requireAuth(),
      this.authController.getProfile.bind(this.authController)
    );

    // POST /api/auth/change-password - Cambiar contraseña
    this.router.post('/change-password', 
      this.authMiddleware.requireAuth(),
      validateInput(validationSchemas.changePassword),
      this.authController.changePassword.bind(this.authController)
    );

    // GET /api/auth/check-team-limit - Verificar límite de equipos
    this.router.get('/check-team-limit', 
      this.authMiddleware.requireAuth(),
      this.authController.checkTeamLimit.bind(this.authController)
    );

    // POST /api/auth/validate-token - Validar token
    this.router.post('/validate-token', 
      this.authMiddleware.requireAuth(),
      this.authController.validateToken.bind(this.authController)
    );
  }

  /**
   * Obtener el router configurado
   */
  public getRouter(): Router {
    return this.router;
  }
}

/**
 * Factory function para crear las rutas con dependencias inyectadas
 */
export const createAuthRoutes = (
  authController: AuthController,
  authMiddleware: AuthMiddleware
): AuthRoutes => {
  return new AuthRoutes(authController, authMiddleware);
};
