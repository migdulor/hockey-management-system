import bcrypt from 'bcryptjs';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  }

  /**
   * Hash una contraseña usando bcrypt
   * @param password Contraseña en texto plano
   * @returns Contraseña hasheada
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Error hashing password: ${error}`);
    }
  }

  /**
   * Comparar contraseña con hash
   * @param password Contraseña en texto plano
   * @param hash Hash almacenado
   * @returns true si coinciden
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error comparing password: ${error}`);
    }
  }

  /**
   * Validar fortaleza de contraseña según requisitos del sistema
   * @param password Contraseña a validar
   * @returns Resultado de validación
   */
  validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];

    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Máximo 128 caracteres (seguridad)
    if (password.length > 128) {
      errors.push('La contraseña no puede exceder 128 caracteres');
    }

    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Al menos un número
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    // No debe contener espacios
    if (/\s/.test(password)) {
      errors.push('La contraseña no puede contener espacios');
    }

    // Validar patrones comunes inseguros
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /hockey/i,
      /admin/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('La contraseña no puede contener patrones comunes inseguros');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generar contraseña temporal segura
   * @param length Longitud de la contraseña (por defecto 12)
   * @returns Contraseña temporal
   */
  generateTemporaryPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + specialChars;
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Completar el resto de la longitud
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar caracteres para evitar patrones predecibles
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}
