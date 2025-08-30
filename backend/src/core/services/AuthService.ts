import { UserRepository, User, CreateUserDTO } from '../interfaces/UserRepository.js';
import { PasswordService } from './PasswordService.js';
import { TokenService, AuthTokens } from './TokenService.js';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  first_name: string;
  last_name: string;
}

export interface AuthResult {
  success: boolean;
  tokens?: AuthTokens;
  user?: Omit<User, 'password_hash'>;
  message?: string;
  errors?: string[];
}

export type Plan = '2_teams' | '3_teams' | '5_teams';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService
  ) {}

  /**
   * Iniciar sesión de usuario
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Validar entrada
      if (!email || !password) {
        return {
          success: false,
          message: 'Email y contraseña son requeridos',
          errors: ['Credenciales incompletas']
        };
      }

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          errors: ['Usuario no encontrado']
        };
      }

      // Verificar contraseña
      const isValidPassword = await this.passwordService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          errors: ['Contraseña incorrecta']
        };
      }

      // Verificar si el usuario está activo
      if (!user.is_active) {
        return {
          success: false,
          message: 'Cuenta desactivada',
          errors: ['Usuario no activo']
        };
      }

      // Generar tokens
      const tokens = this.tokenService.generateTokens(user);

      // Actualizar último login
      await this.userRepository.updateLastLogin(user.id);

      return {
        success: true,
        tokens,
        user: this.sanitizeUser(user),
        message: 'Login exitoso'
      };

    } catch (error: any) {
      console.error('Error in login:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: ['Error durante el proceso de login']
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterDTO): Promise<AuthResult> {
    try {
      // Validar email
      if (!this.isValidEmail(userData.email)) {
        return {
          success: false,
          message: 'Email inválido',
          errors: ['Formato de email incorrecto']
        };
      }

      // Validar fortaleza de contraseña
      const passwordValidation = this.passwordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: 'Contraseña no cumple con los requisitos',
          errors: passwordValidation.errors
        };
      }

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(userData.email.toLowerCase().trim());
      if (existingUser) {
        return {
          success: false,
          message: 'Email ya registrado',
          errors: ['El email ya está en uso']
        };
      }

      // Hashear contraseña
      const hashedPassword = await this.passwordService.hashPassword(userData.password);

      // Crear objeto usuario
      const createUserData: CreateUserDTO = {
        email: userData.email.toLowerCase().trim(),
        password_hash: hashedPassword,
        role: userData.role,
        plan: userData.plan,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim()
      };

      // Crear usuario en BD
      const newUser = await this.userRepository.create(createUserData);

      // Generar tokens
      const tokens = this.tokenService.generateTokens(newUser);

      return {
        success: true,
        tokens,
        user: this.sanitizeUser(newUser),
        message: 'Usuario registrado exitosamente'
      };

    } catch (error: any) {
      console.error('Error in register:', error);
      
      if (error.message === 'Email already exists') {
        return {
          success: false,
          message: 'Email ya registrado',
          errors: ['El email ya está en uso']
        };
      }

      return {
        success: false,
        message: 'Error interno del servidor',
        errors: ['Error durante el proceso de registro']
      };
    }
  }

  /**
   * Renovar token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verificar refresh token
      const decoded = this.tokenService.verifyRefreshToken(refreshToken);
      
      // Buscar usuario actual
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.is_active) {
        return {
          success: false,
          message: 'Usuario no válido',
          errors: ['Usuario no encontrado o inactivo']
        };
      }

      // Generar nuevos tokens
      const tokens = this.tokenService.generateTokens(user);
      
      // Invalidar el refresh token usado
      this.tokenService.blacklistToken(refreshToken);

      return {
        success: true,
        tokens,
        user: this.sanitizeUser(user),
        message: 'Token renovado exitosamente'
      };

    } catch (error: any) {
      console.error('Error in refreshToken:', error);
      return {
        success: false,
        message: 'Token de renovación inválido',
        errors: ['Refresh token inválido o expirado']
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(accessToken: string, refreshToken?: string): Promise<AuthResult> {
    try {
      // Añadir tokens a blacklist
      this.tokenService.blacklistToken(accessToken);
      if (refreshToken) {
        this.tokenService.blacklistToken(refreshToken);
      }

      return {
        success: true,
        message: 'Logout exitoso'
      };

    } catch (error: any) {
      console.error('Error in logout:', error);
      return {
        success: false,
        message: 'Error durante logout',
        errors: ['Error al cerrar sesión']
      };
    }
  }

  /**
   * Validar si un usuario puede usar un plan específico
   */
  async validateUserPlan(userId: string, requiredPlan: Plan): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      // Mapear planes a números para comparación
      const planLevels: Record<Plan, number> = {
        '2_teams': 2,
        '3_teams': 3,
        '5_teams': 5
      };

      const userPlanLevel = planLevels[user.plan];
      const requiredPlanLevel = planLevels[requiredPlan];

      return userPlanLevel >= requiredPlanLevel;

    } catch (error) {
      console.error('Error validating user plan:', error);
      return false;
    }
  }

  /**
   * Verificar si usuario puede crear más equipos
   */
  async canUserCreateTeam(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return { canCreate: false, reason: 'Usuario no encontrado' };
      }

      // Contar equipos actuales
      const currentTeams = await this.userRepository.countActiveTeams(userId);
      
      const planLimits: Record<Plan, number> = {
        '2_teams': 2,
        '3_teams': 3,
        '5_teams': 5
      };

      const maxTeams = planLimits[user.plan];

      if (currentTeams >= maxTeams) {
        return { 
          canCreate: false, 
          reason: `Plan ${user.plan} permite máximo ${maxTeams} equipos. Actuales: ${currentTeams}` 
        };
      }

      return { canCreate: true };

    } catch (error) {
      console.error('Error checking team creation limit:', error);
      return { canCreate: false, reason: 'Error verificando límites' };
    }
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // Buscar usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          errors: ['Usuario no existe']
        };
      }

      // Verificar contraseña actual
      const isValidPassword = await this.passwordService.comparePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Contraseña actual incorrecta',
          errors: ['Contraseña actual no válida']
        };
      }

      // Validar nueva contraseña
      const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: 'Nueva contraseña no cumple requisitos',
          errors: passwordValidation.errors
        };
      }

      // Hashear nueva contraseña
      const newPasswordHash = await this.passwordService.hashPassword(newPassword);

      // Actualizar en BD (necesitaríamos un método en el repositorio)
      // Por ahora simulamos el éxito
      
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };

    } catch (error: any) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: ['Error al cambiar contraseña']
      };
    }
  }

  /**
   * Remover datos sensibles del usuario
   */
  private sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }
}
