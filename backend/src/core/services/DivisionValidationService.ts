/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Servicio de Validación de Divisiones
 * 
 * Implementa todas las validaciones específicas de hockey relacionadas
 * con divisiones, edades y reglas de participación
 */

import { Division, DIVISION_CONFIG } from '../entities/Division.js';
import { AgeValidationDTO, DivisionRulesDTO } from '../dtos/DivisionDTO.js';

/**
 * Resultado de validación genérico
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  details?: Record<string, any>;
  suggestedActions?: string[];
}

/**
 * Servicio para validaciones específicas de divisiones de hockey
 */
export class DivisionValidationService {
  
  /**
   * Valida si una jugadora puede participar en una división según su edad
   */
  async validatePlayerAgeForDivision(birthDate: Date, divisionId: string): Promise<AgeValidationDTO> {
    try {
      // Calcular edad actual
      const currentYear = new Date().getFullYear();
      const birthYear = birthDate.getFullYear();
      const age = currentYear - birthYear;
      
      // Buscar configuración de división
      const divisionConfig = Object.values(DIVISION_CONFIG).find(
        config => config.name === divisionId || divisionId.includes(config.name)
      );
      
      if (!divisionConfig) {
        return {
          isValid: false,
          birthDate,
          age,
          divisionId,
          errorMessage: `División '${divisionId}' no encontrada`
        };
      }
      
      // Validar límites de edad
      let isValid = true;
      let errorMessage: string | undefined;
      
      // Verificar límite mínimo (año máximo de nacimiento)
      if (divisionConfig.maxBirthYear && birthYear > divisionConfig.maxBirthYear) {
        isValid = false;
        errorMessage = `Jugadora muy joven. Año de nacimiento máximo: ${divisionConfig.maxBirthYear}`;
      }
      
      // Verificar límite máximo (año mínimo de nacimiento)
      if (divisionConfig.minBirthYear && birthYear < divisionConfig.minBirthYear) {
        isValid = false;
        errorMessage = `Jugadora muy mayor. Año de nacimiento mínimo: ${divisionConfig.minBirthYear}`;
      }
      
      // Sugerir divisiones alternativas si no es válida
      let suggestedDivisions: any[] = [];
      if (!isValid) {
        suggestedDivisions = await this.findSuitableDivisions(birthDate);
      }
      
      return {
        isValid,
        birthDate,
        age,
        divisionId,
        errorMessage,
        suggestedDivisions
      };
      
    } catch (error) {
      return {
        isValid: false,
        birthDate,
        age: 0,
        divisionId,
        errorMessage: `Error validating age: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Valida el límite de divisiones por club para una jugadora
   * Una jugadora no puede estar en más de 2 divisiones del mismo club
   */
  async validatePlayerDivisionLimits(playerId: string, clubName: string): Promise<ValidationResult> {
    try {
      // TODO: Implementar consulta a BD para obtener equipos actuales de la jugadora
      // Por ahora simulamos la validación
      
      const currentDivisionsInClub = await this.getPlayerDivisionsInClub(playerId, clubName);
      
      if (currentDivisionsInClub.length >= 2) {
        return {
          isValid: false,
          errorMessage: `La jugadora ya participa en ${currentDivisionsInClub.length} divisiones del club '${clubName}'. Máximo permitido: 2`,
          details: {
            currentDivisions: currentDivisionsInClub,
            maxAllowed: 2
          },
          suggestedActions: [
            'Remover de una división existente antes de agregar a una nueva',
            'Considerar cambiar a otro club para participar en más divisiones'
          ]
        };
      }
      
      return {
        isValid: true,
        details: {
          currentDivisions: currentDivisionsInClub,
          remainingSlots: 2 - currentDivisionsInClub.length
        }
      };
      
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating division limits: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Validación completa para que una jugadora se una a una división
   */
  async canPlayerJoinDivision(
    playerId: string, 
    divisionId: string, 
    clubName: string,
    birthDate: Date
  ): Promise<ValidationResult> {
    
    try {
      // Validar edad
      const ageValidation = await this.validatePlayerAgeForDivision(birthDate, divisionId);
      if (!ageValidation.isValid) {
        return {
          isValid: false,
          errorMessage: ageValidation.errorMessage,
          details: { ageValidation }
        };
      }
      
      // Validar límite de divisiones por club
      const divisionLimitValidation = await this.validatePlayerDivisionLimits(playerId, clubName);
      if (!divisionLimitValidation.isValid) {
        return divisionLimitValidation;
      }
      
      // Validar reglas específicas de división
      const divisionRules = await this.getDivisionShootoutRule(divisionId);
      
      return {
        isValid: true,
        details: {
          ageValidation,
          divisionLimitValidation,
          divisionRules: {
            allowsShootout: divisionRules
          }
        }
      };
      
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating player eligibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Obtiene la regla de shootout para una división
   */
  async getDivisionShootoutRule(divisionId: string): Promise<boolean> {
    const divisionConfig = Object.values(DIVISION_CONFIG).find(
      config => config.name === divisionId || divisionId.includes(config.name)
    );
    
    return divisionConfig?.allowsShootout ?? false;
  }
  
  /**
   * Obtiene las reglas completas de una división
   */
  async getDivisionRules(divisionId: string): Promise<DivisionRulesDTO | null> {
    const divisionConfig = Object.values(DIVISION_CONFIG).find(
      config => config.name === divisionId || divisionId.includes(config.name)
    );
    
    if (!divisionConfig) return null;
    
    return {
      divisionId,
      divisionName: divisionConfig.name,
      ageRules: {
        hasMinAge: divisionConfig.minBirthYear !== undefined,
        hasMaxAge: divisionConfig.maxBirthYear !== undefined,
        minBirthYear: divisionConfig.minBirthYear,
        maxBirthYear: divisionConfig.maxBirthYear,
        description: this.formatAgeRuleDescription(divisionConfig.minBirthYear, divisionConfig.maxBirthYear)
      },
      gameRules: {
        allowsShootout: divisionConfig.allowsShootout,
        maxPlayersPerTeam: 20,
        substitutions: 5
      },
      participationRules: {
        canPlayInHigherDivisions: this.canPlayInHigherDivisions(divisionConfig.name),
        maxDivisionsPerClub: 2,
        requiresParentalConsent: this.requiresParentalConsent(divisionConfig.name)
      }
    };
  }
  
  // --- Métodos auxiliares privados ---
  
  /**
   * Busca divisiones adecuadas para una fecha de nacimiento
   */
  private async findSuitableDivisions(birthDate: Date): Promise<any[]> {
    const birthYear = birthDate.getFullYear();
    const suitableDivisions: any[] = [];
    
    for (const [key, config] of Object.entries(DIVISION_CONFIG)) {
      let isEligible = true;
      
      if (config.minBirthYear && birthYear < config.minBirthYear) {
        isEligible = false;
      }
      
      if (config.maxBirthYear && birthYear > config.maxBirthYear) {
        isEligible = false;
      }
      
      if (isEligible) {
        suitableDivisions.push({
          id: key,
          name: config.name,
          gender: config.gender,
          allowsShootout: config.allowsShootout,
          description: config.description
        });
      }
    }
    
    return suitableDivisions;
  }
  
  /**
   * Obtiene las divisiones actuales de una jugadora en un club específico
   * TODO: Implementar consulta real a la base de datos
   */
  private async getPlayerDivisionsInClub(playerId: string, clubName: string): Promise<string[]> {
    // Simulación - en implementación real consultaría la BD
    return [];
  }
  
  /**
   * Determina si una división puede jugar en divisiones superiores
   */
  private canPlayInHigherDivisions(divisionName: string): boolean {
    const hierarchyOrder = ['Sub14', 'Sub16', 'Sub19', 'Inter', 'Primera'];
    const currentIndex = hierarchyOrder.indexOf(divisionName);
    
    // Las jugadoras pueden jugar en divisiones iguales o superiores (índice mayor)
    return currentIndex >= 0 && currentIndex < hierarchyOrder.length - 1;
  }
  
  /**
   * Determina si una división requiere consentimiento parental
   */
  private requiresParentalConsent(divisionName: string): boolean {
    return ['Sub14', 'Sub16'].includes(divisionName);
  }
  
  /**
   * Formatea la descripción de reglas de edad
   */
  private formatAgeRuleDescription(minBirthYear?: number, maxBirthYear?: number): string {
    if (minBirthYear && maxBirthYear) {
      return `Nacidas entre ${maxBirthYear} y ${minBirthYear}`;
    } else if (minBirthYear) {
      return `Nacidas en ${minBirthYear} o antes`;
    } else if (maxBirthYear) {
      return `Nacidas en ${maxBirthYear} o después`;
    }
    return 'Sin restricciones de edad';
  }
}
