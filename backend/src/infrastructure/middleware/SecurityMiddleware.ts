import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Extender tipos de Express para rate limiting
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime?: Date;
      };
    }
  }
}

/**
 * Rate limiter para intentos de login
 * Máximo 5 intentos por IP en 15 minutos
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
    retryAfter: 15 * 60 // segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Personalizar key para incluir email si está disponible
  keyGenerator: (req: Request) => {
    const email = req.body?.email || '';
    return `${req.ip}_${email}`;
  },
  // Headers adicionales
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
      error: 'TOO_MANY_LOGIN_ATTEMPTS',
      retryAfter: req.rateLimit?.resetTime ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000) : 900
    });
  }
});

/**
 * Rate limiter para registro de usuarios
 * Máximo 3 registros por IP en 1 hora
 */
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    success: false,
    message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.',
    error: 'TOO_MANY_REGISTER_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.',
      error: 'TOO_MANY_REGISTER_ATTEMPTS',
      retryAfter: req.rateLimit?.resetTime ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000) : 3600
    });
  }
});

/**
 * Rate limiter general para la API
 * Máximo 100 requests por IP en 15 minutos
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta nuevamente más tarde.',
    error: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Excluir ciertas rutas del rate limiting
  skip: (req: Request) => {
    const excludePaths = ['/health', '/api/health'];
    return excludePaths.includes(req.path);
  }
});

/**
 * Rate limiter estricto para operaciones sensibles
 * Máximo 10 requests por IP en 5 minutos
 */
export const strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 requests por ventana
  message: {
    success: false,
    message: 'Límite de operaciones sensibles excedido. Intenta nuevamente en 5 minutos.',
    error: 'SENSITIVE_OPERATION_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Esquemas de validación Joi comunes
 */
export const validationSchemas = {
  // Validación para login
  login: Joi.object({
    email: Joi.string().email().max(255).required().messages({
      'string.email': 'Email debe tener un formato válido',
      'string.max': 'Email no puede exceder 255 caracteres',
      'any.required': 'Email es requerido'
    }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.max': 'Contraseña no puede exceder 128 caracteres',
      'any.required': 'Contraseña es requerida'
    })
  }),

  // Validación para registro
  register: Joi.object({
    email: Joi.string().email().max(255).required().messages({
      'string.email': 'Email debe tener un formato válido',
      'string.max': 'Email no puede exceder 255 caracteres',
      'any.required': 'Email es requerido'
    }),
    password: Joi.string().min(8).max(128).pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>?]).*$')
    ).required().messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.max': 'Contraseña no puede exceder 128 caracteres',
      'string.pattern.base': 'Contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      'any.required': 'Contraseña es requerida'
    }),
    role: Joi.string().valid('admin', 'coach').required().messages({
      'any.only': 'Role debe ser admin o coach',
      'any.required': 'Role es requerido'
    }),
    plan: Joi.string().valid('2_teams', '3_teams', '5_teams').required().messages({
      'any.only': 'Plan debe ser 2_teams, 3_teams o 5_teams',
      'any.required': 'Plan es requerido'
    }),
    first_name: Joi.string().min(2).max(50).trim().required().messages({
      'string.min': 'Nombre debe tener al menos 2 caracteres',
      'string.max': 'Nombre no puede exceder 50 caracteres',
      'any.required': 'Nombre es requerido'
    }),
    last_name: Joi.string().min(2).max(50).trim().required().messages({
      'string.min': 'Apellido debe tener al menos 2 caracteres',
      'string.max': 'Apellido no puede exceder 50 caracteres',
      'any.required': 'Apellido es requerido'
    })
  }),

  // Validación para refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token es requerido'
    })
  }),

  // Validación para cambio de contraseña
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Contraseña actual es requerida'
    }),
    newPassword: Joi.string().min(8).max(128).pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>?]).*$')
    ).required().messages({
      'string.min': 'Nueva contraseña debe tener al menos 8 caracteres',
      'string.max': 'Nueva contraseña no puede exceder 128 caracteres',
      'string.pattern.base': 'Nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      'any.required': 'Nueva contraseña es requerida'
    })
  })
};

/**
 * Middleware de validación de entrada usando Joi
 */
export const validateInput = (schema: Joi.Schema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true, // Remover campos no definidos en el schema
      convert: true // Convertir tipos automáticamente
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors,
        error: 'VALIDATION_ERROR'
      });
    }

    // Reemplazar datos originales con datos validados y sanitizados
    req[source] = value;
    next();
  };
};

/**
 * Middleware de seguridad adicional
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevenir ataques de clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Indicar que el contenido debe servirse por HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Middleware para sanitizar entrada de datos
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Función para sanitizar recursivamente
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

/**
 * Middleware para logging de seguridad
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log de intentos sospechosos
  const suspiciousPatterns = [
    /script/i,
    /select.*from/i,
    /union.*select/i,
    /<script/i,
    /javascript:/i
  ];

  const checkSuspicious = (data: any): boolean => {
    const str = JSON.stringify(data).toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  if (checkSuspicious(req.body) || checkSuspicious(req.query)) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next();
};
