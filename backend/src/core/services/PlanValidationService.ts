/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Servicio de Validación de Planes
 * 
 * Implementa validaciones relacionadas con los límites de equipos
 * según el plan de suscripción del usuario
 */

import { ValidationResult } from './DivisionValidationService.js';

/**
 * Planes disponibles con sus límites
 */
export interface Plan {
  id: string;
  name: string;
  maxTeams: number;
  maxPlayersPerTeam: number;
  description: string;
  features: string[];
}

/**
 * Configuración de planes del sistema
 */
export const PLAN_LIMITS: Record<string, Plan> = {
  '2_teams': {
    id: '2_teams',
    name: 'Plan Básico',
    maxTeams: 2,
    maxPlayersPerTeam: 20,
    description: 'Plan básico para entrenadores que manejan hasta 2 equipos',
    features: [
      'Gestión de hasta 2 equipos',
      '20 jugadoras por equipo',
      'Estadísticas básicas',
      'Soporte por email'
    ]
  },
  '3_teams': {
    id: '3_teams',
    name: 'Plan Profesional',
    maxTeams: 3,
    maxPlayersPerTeam: 20,
    description: 'Plan profesional para entrenadores con múltiples equipos',
    features: [
      'Gestión de hasta 3 equipos',
      '20 jugadoras por equipo',
      'Estadísticas avanzadas',
      'Reportes personalizados',
      'Soporte prioritario'
    ]
  },
  '5_teams': {
    id: '5_teams',
    name: 'Plan Club',
    maxTeams: 5,
    maxPlayersPerTeam: 20,
    description: 'Plan completo para clubes con múltiples divisiones',
    features: [
      'Gestión de hasta 5 equipos',
      '20 jugadoras por equipo',
      'Estadísticas completas',
      'Dashboard de club',
      'Integración con federación',
      'Soporte dedicado'
    ]
  }
};

/**
 * DTO para información de plan del usuario
 */
export interface UserPlanInfo {
  userId: string;
  planId: string;
  planName: string;
  currentTeamCount: number;
  maxTeamsAllowed: number;
  remainingTeams: number;
  canCreateTeam: boolean;
  planFeatures: string[];
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  subscriptionExpiresAt?: Date;
}

/**
 * Servicio para validaciones relacionadas con planes de suscripción
 */
export class PlanValidationService {
  
  /**
   * Valida si un usuario puede crear más equipos según su plan
   */
  async validateTeamLimitForUser(userId: string): Promise<ValidationResult> {
    try {
      const userPlan = await this.getUserPlanInfo(userId);
      
      if (!userPlan) {
        return {
          isValid: false,
          errorMessage: 'Usuario no tiene un plan asignado',
          suggestedActions: ['Contactar soporte para asignar un plan']
        };
      }
      
      // Verificar estado de suscripción
      if (userPlan.subscriptionStatus !== 'active') {
        return {
          isValid: false,
          errorMessage: `Suscripción ${userPlan.subscriptionStatus}. No se pueden crear nuevos equipos`,
          details: {
            subscriptionStatus: userPlan.subscriptionStatus,
            expiresAt: userPlan.subscriptionExpiresAt
          },
          suggestedActions: [
            'Renovar suscripción',
            'Contactar soporte para reactivar cuenta'
          ]
        };
      }
      
      // Verificar límite de equipos
      if (userPlan.currentTeamCount >= userPlan.maxTeamsAllowed) {
        return {
          isValid: false,
          errorMessage: `Límite de equipos alcanzado. Plan actual: ${userPlan.planName} (${userPlan.maxTeamsAllowed} equipos máx.)`,
          details: {
            currentTeamCount: userPlan.currentTeamCount,
            maxTeamsAllowed: userPlan.maxTeamsAllowed,
            planName: userPlan.planName
          },
          suggestedActions: [
            'Actualizar a un plan superior',
            'Eliminar un equipo existente',
            'Contactar ventas para opciones personalizadas'
          ]
        };
      }
      
      return {
        isValid: true,
        details: {
          remainingTeams: userPlan.remainingTeams,
          currentPlan: userPlan.planName
        }
      };
      
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating team limit: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Obtiene el número máximo de equipos para un plan específico
   */
  async getMaxTeamsForPlan(planId: string): Promise<number> {
    const plan = PLAN_LIMITS[planId];
    return plan ? plan.maxTeams : 0;
  }
  
  /**
   * Obtiene el conteo actual de equipos de un usuario
   */
  async getCurrentTeamCount(userId: string): Promise<number> {
    try {
      // TODO: Implementar consulta real a la base de datos
      // Por ahora retornamos un valor simulado
      return 0;
    } catch (error) {
      console.error('Error getting current team count:', error);
      return 0;
    }
  }
  
  /**
   * Validación completa para determinar si un usuario puede crear un equipo
   */
  async canUserCreateTeam(userId: string): Promise<ValidationResult> {
    try {
      // Validar límites del plan
      const planValidation = await this.validateTeamLimitForUser(userId);
      if (!planValidation.isValid) {
        return planValidation;
      }
      
      // Validaciones adicionales pueden ir aquí
      // Por ejemplo: verificar pagos pendientes, términos de servicio aceptados, etc.
      
      return {
        isValid: true,
        details: planValidation.details
      };
      
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating team creation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Obtiene información completa del plan de un usuario
   */
  async getUserPlanInfo(userId: string): Promise<UserPlanInfo | null> {
    try {
      // TODO: Implementar consulta real a la base de datos
      // Por ahora retornamos datos simulados para el plan básico
      
      const currentTeamCount = await this.getCurrentTeamCount(userId);
      const planId = '2_teams'; // Simulado - obtener de BD
      const plan = PLAN_LIMITS[planId];
      
      if (!plan) return null;
      
      return {
        userId,
        planId: plan.id,
        planName: plan.name,
        currentTeamCount,
        maxTeamsAllowed: plan.maxTeams,
        remainingTeams: plan.maxTeams - currentTeamCount,
        canCreateTeam: currentTeamCount < plan.maxTeams,
        planFeatures: plan.features,
        subscriptionStatus: 'active', // Simulado
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      };
      
    } catch (error) {
      console.error('Error getting user plan info:', error);
      return null;
    }
  }
  
  /**
   * Obtiene todos los planes disponibles
   */
  async getAllPlans(): Promise<Plan[]> {
    return Object.values(PLAN_LIMITS);
  }
  
  /**
   * Obtiene un plan específico por ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    return PLAN_LIMITS[planId] || null;
  }
  
  /**
   * Compara planes y sugiere upgrade si es necesario
   */
  async suggestPlanUpgrade(userId: string, desiredTeamCount: number): Promise<{
    needsUpgrade: boolean;
    currentPlan: Plan;
    suggestedPlan?: Plan;
    costDifference?: string;
  }> {
    const userPlan = await this.getUserPlanInfo(userId);
    if (!userPlan) {
      throw new Error('User plan not found');
    }
    
    const currentPlan = PLAN_LIMITS[userPlan.planId];
    
    if (desiredTeamCount <= currentPlan.maxTeams) {
      return {
        needsUpgrade: false,
        currentPlan
      };
    }
    
    // Buscar el plan más económico que satisfaga los requisitos
    const suitablePlans = Object.values(PLAN_LIMITS)
      .filter(plan => plan.maxTeams >= desiredTeamCount)
      .sort((a, b) => a.maxTeams - b.maxTeams);
    
    const suggestedPlan = suitablePlans[0];
    
    return {
      needsUpgrade: true,
      currentPlan,
      suggestedPlan,
      costDifference: this.calculateCostDifference(currentPlan.id, suggestedPlan.id)
    };
  }
  
  // --- Métodos auxiliares privados ---
  
  /**
   * Calcula la diferencia de costo entre planes
   * TODO: Implementar con precios reales
   */
  private calculateCostDifference(currentPlanId: string, newPlanId: string): string {
    // Simulado - en implementación real consultaría precios actuales
    const priceDifference = {
      '2_teams': 0,
      '3_teams': 10,
      '5_teams': 25
    };
    
    const currentPrice = priceDifference[currentPlanId as keyof typeof priceDifference] || 0;
    const newPrice = priceDifference[newPlanId as keyof typeof priceDifference] || 0;
    
    return `+$${newPrice - currentPrice}/mes`;
  }
}
