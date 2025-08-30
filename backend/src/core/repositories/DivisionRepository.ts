/**
 * Interfaz para el repositorio de divisiones
 * Define las operaciones de acceso a datos para las divisiones del sistema
 */

import { Division, DIVISION_CONFIG } from '../entities/Division.js';
import { DivisionDetailDTO } from '../dtos/DivisionDTO.js';

export interface DivisionRepository {
  /**
   * Buscar todas las divisiones
   */
  findAll(): Promise<Division[]>;
  
  /**
   * Buscar división por ID
   */
  findById(id: string): Promise<Division | null>;
  
  /**
   * Buscar divisiones adecuadas para un año de nacimiento
   */
  findSuitableForBirthDate(birthYear: number): Promise<Division[]>;
  
  /**
   * Buscar todas las divisiones con estadísticas
   */
  findAllWithStats(): Promise<DivisionDetailDTO[]>;
  
  /**
   * Obtener estadísticas de una división específica
   */
  getDivisionStats(divisionId: string): Promise<DivisionDetailDTO | null>;
  
  /**
   * Inicializar divisiones por defecto en el sistema
   */
  initializeDefaultDivisions(): Promise<void>;
  
  /**
   * Verificar si una división existe
   */
  exists(divisionId: string): Promise<boolean>;
}
