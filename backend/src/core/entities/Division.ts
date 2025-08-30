/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Entidad Division
 * 
 * Entidad para representar divisiones de hockey con reglas específicas
 * de edad, género y reglamentos (como shootout)
 */

export interface Division {
  /** Identificador único de la división */
  id: string;
  
  /** Nombre de la división ('Sub14', 'Sub16', 'Sub19', 'Inter', 'Primera') */
  name: string;
  
  /** Género de la división */
  gender: 'male' | 'female';
  
  /** Año mínimo de nacimiento permitido (para divisiones con límite inferior) */
  minBirthYear?: number;
  
  /** Año máximo de nacimiento permitido (para divisiones con límite superior) */
  maxBirthYear?: number;
  
  /** Si permite definición por shootout */
  allowsShootout: boolean;
  
  /** Descripción adicional de la división */
  description?: string;
  
  /** Si la división está activa */
  isActive: boolean;
  
  /** Fecha de creación */
  createdAt: Date;
  
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Resumen de división para respuestas optimizadas
 */
export interface DivisionSummary {
  id: string;
  name: string;
  gender: 'male' | 'female';
  allowsShootout: boolean;
  ageRange?: string; // e.g., "2009-2010", "2011+", "-1999"
}

/**
 * Reglas específicas de división
 * Utilizado para validaciones de edad y reglamento
 */
export interface DivisionRules {
  divisionId: string;
  minAge?: number;
  maxAge?: number;
  allowsShootout: boolean;
  maxPlayersPerTeam: number;
  canPlayInHigherDivisions: boolean;
}

/**
 * Configuración de divisiones con sus reglas
 * Basado en el reglamento de hockey sobre césped
 */
export const DIVISION_CONFIG: Record<string, Omit<Division, 'id' | 'createdAt' | 'updatedAt'>> = {
  'Sub14': {
    name: 'Sub14',
    gender: 'female',
    minBirthYear: 2011,
    maxBirthYear: undefined, // Sin límite superior
    allowsShootout: false,
    description: 'Categoría Sub-14 femenino',
    isActive: true
  },
  'Sub16': {
    name: 'Sub16',
    gender: 'female',
    minBirthYear: 2009,
    maxBirthYear: 2010,
    allowsShootout: true,
    description: 'Categoría Sub-16 femenino',
    isActive: true
  },
  'Sub19': {
    name: 'Sub19',
    gender: 'female',
    minBirthYear: 2006,
    maxBirthYear: 2008,
    allowsShootout: true,
    description: 'Categoría Sub-19 femenino',
    isActive: true
  },
  'Inter': {
    name: 'Inter',
    gender: 'female',
    minBirthYear: 2000,
    maxBirthYear: 2005,
    allowsShootout: true,
    description: 'Categoría Intermedia femenino',
    isActive: true
  },
  'Primera': {
    name: 'Primera',
    gender: 'female',
    minBirthYear: undefined, // Sin límite inferior
    maxBirthYear: 1999,
    allowsShootout: true,
    description: 'Primera División femenino',
    isActive: true
  }
};
