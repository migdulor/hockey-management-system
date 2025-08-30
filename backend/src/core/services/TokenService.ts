import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  first_name: string;
  last_name: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password_hash'>;
}

export class TokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private blacklistedTokens: Set<string> = new Set();

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    
    if (this.jwtSecret === 'fallback-secret-key') {
      console.warn('⚠️ Using fallback JWT secret. Set JWT_SECRET in production!');
    }
  }

  /**
   * Generar token de acceso JWT
   * @param user Datos del usuario
   * @returns JWT token
   */
  generateAccessToken(user: User): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'hockey-management-system',
      audience: 'hockey-app-users'
    } as jwt.SignOptions);
  }

  /**
   * Generar token de refresh
   * @param user Datos del usuario
   * @returns Refresh token
   */
  generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'hockey-management-system',
      audience: 'hockey-app-users'
    } as jwt.SignOptions);
  }

  /**
   * Generar ambos tokens (access y refresh)
   * @param user Datos del usuario
   * @returns Objeto con ambos tokens y datos del usuario
   */
  generateTokens(user: User): AuthTokens {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Remover password_hash de los datos del usuario
    const { password_hash, ...userWithoutPassword } = user as any;
    
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Verificar y decodificar token JWT
   * @param token Token a verificar
   * @returns Payload del token decodificado
   */
  verifyToken(token: string): TokenPayload {
    try {
      // Verificar si el token está en la blacklist
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been blacklisted');
      }

      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'hockey-management-system',
        audience: 'hockey-app-users'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error(`Token verification failed: ${error}`);
      }
    }
  }

  /**
   * Verificar token de refresh
   * @param refreshToken Token de refresh
   * @returns Payload del refresh token
   */
  verifyRefreshToken(refreshToken: string): any {
    try {
      if (this.blacklistedTokens.has(refreshToken)) {
        throw new Error('Refresh token has been blacklisted');
      }

      const decoded = jwt.verify(refreshToken, this.jwtSecret, {
        issuer: 'hockey-management-system',
        audience: 'hockey-app-users'
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error(`Refresh token verification failed: ${error}`);
      }
    }
  }

  /**
   * Añadir token a la blacklist
   * @param token Token a invalidar
   */
  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Extraer token del header Authorization
   * @param authHeader Header Authorization
   * @returns Token limpio o null
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verificar si un token está próximo a expirar
   * @param token Token a verificar
   * @param thresholdMinutes Minutos antes de expiración (por defecto 30)
   * @returns true si está próximo a expirar
   */
  isTokenNearExpiration(token: string, thresholdMinutes: number = 30): boolean {
    try {
      const decoded = this.verifyToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - currentTime;
      const thresholdSeconds = thresholdMinutes * 60;

      return timeUntilExpiration <= thresholdSeconds;
    } catch {
      return true; // Si no se puede verificar, considerar que necesita renovación
    }
  }

  /**
   * Limpiar tokens expirados de la blacklist (para mantenimiento)
   */
  cleanupBlacklist(): void {
    // En una implementación real, esto debería usar una base de datos
    // Por ahora, limpiamos la blacklist completa periódicamente
    const tokensToRemove: string[] = [];
    
    for (const token of this.blacklistedTokens) {
      try {
        jwt.verify(token, this.jwtSecret);
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          tokensToRemove.push(token);
        }
      }
    }

    tokensToRemove.forEach(token => this.blacklistedTokens.delete(token));
    console.log(`🧹 Cleaned ${tokensToRemove.length} expired tokens from blacklist`);
  }
}
