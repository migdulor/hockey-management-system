/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Servicio Principal de Teams
 * 
 * Servicio principal que coordina todas las operaciones CRUD de equipos
 * aplicando validaciones de hockey, límites de plan y reglas de negocio
 */

import { Team, TeamWithDivision, TeamWithPlayers } from '../entities/Team.js';
import { 
  CreateTeamDTO, 
  UpdateTeamDTO, 
  TeamResponseDTO, 
  TeamWithPlayersDTO,
  TeamValidationDTO,
  TeamFiltersDTO,
  PaginatedTeamsDTO
} from '../dtos/TeamDTO.js';
import { DivisionValidationService, ValidationResult } from './DivisionValidationService.js';
import { PlanValidationService, UserPlanInfo } from './PlanValidationService.js';

/**
 * Interface para el repositorio de equipos
 * Define los métodos que debe implementar el repositorio
 */
export interface TeamRepository {
  create(team: CreateTeamDTO): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findByUserId(userId: string): Promise<Team[]>;
  update(id: string, data: UpdateTeamDTO): Promise<Team>;
  delete(id: string): Promise<void>;
  countTeamsByUser(userId: string): Promise<number>;
  findByClubAndDivision(clubName: string, divisionId: string): Promise<Team[]>;
  findWithFilters(filters: TeamFiltersDTO): Promise<PaginatedTeamsDTO>;
  addPlayerToTeam(teamId: string, playerId: string): Promise<void>;
  removePlayerFromTeam(teamId: string, playerId: string): Promise<void>;
  getTeamPlayerCount(teamId: string): Promise<number>;
}

/**
 * Interface para el repositorio de divisiones
 */
export interface DivisionRepository {
  findById(id: string): Promise<any>;
  findAll(): Promise<any[]>;
}

/**
 * Servicio principal para gestión de equipos
 */
export class TeamService {
  
  constructor(
    private teamRepository: TeamRepository,
    private divisionRepository: DivisionRepository,
    private divisionValidationService: DivisionValidationService,
    private planValidationService: PlanValidationService
  ) {}
  
  /**
   * Crea un nuevo equipo aplicando todas las validaciones
   */
  async createTeam(teamData: CreateTeamDTO): Promise<TeamResponseDTO> {
    try {
      // 1. Validar límites del plan del usuario
      const planValidation = await this.planValidationService.canUserCreateTeam(teamData.userId);
      if (!planValidation.isValid) {
        throw new Error(planValidation.errorMessage);
      }
      
      // 2. Validar que la división existe y está activa
      const division = await this.divisionRepository.findById(teamData.divisionId);
      if (!division || !division.isActive) {
        throw new Error(`División '${teamData.divisionId}' no encontrada o inactiva`);
      }
      
      // 3. Validar unicidad de equipo por club y división
      const existingTeams = await this.teamRepository.findByClubAndDivision(
        teamData.clubName, 
        teamData.divisionId
      );
      
      if (existingTeams.length > 0) {
        throw new Error(`Ya existe un equipo del club '${teamData.clubName}' en la división '${division.name}'`);
      }
      
      // 4. Preparar datos del equipo con valores por defecto
      const teamToCreate: CreateTeamDTO = {
        ...teamData,
        maxPlayers: teamData.maxPlayers || 20
      };
      
      // 5. Crear el equipo en la base de datos
      const createdTeam = await this.teamRepository.create(teamToCreate);
      
      // 6. Retornar respuesta formateada
      return await this.formatTeamResponse(createdTeam, teamData.userId);
      
    } catch (error) {
      throw new Error(`Error creating team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Actualiza un equipo existente
   */
  async updateTeam(id: string, updateData: UpdateTeamDTO, userId: string): Promise<TeamResponseDTO> {
    try {
      // 1. Verificar que el equipo existe y pertenece al usuario
      const existingTeam = await this.teamRepository.findById(id);
      if (!existingTeam) {
        throw new Error('Equipo no encontrado');
      }
      
      if (existingTeam.userId !== userId) {
        throw new Error('No tienes permisos para editar este equipo');
      }
      
      // 2. Si se cambia la división, validar la nueva división
      if (updateData.divisionId && updateData.divisionId !== existingTeam.divisionId) {
        const newDivision = await this.divisionRepository.findById(updateData.divisionId);
        if (!newDivision || !newDivision.isActive) {
          throw new Error(`División '${updateData.divisionId}' no encontrada o inactiva`);
        }
        
        // Validar unicidad en nueva división y club
        const conflictingTeams = await this.teamRepository.findByClubAndDivision(
          updateData.clubName || existingTeam.clubName,
          updateData.divisionId
        );
        
        if (conflictingTeams.some(team => team.id !== id)) {
          throw new Error(`Ya existe un equipo del club en la división '${newDivision.name}'`);
        }
      }
      
      // 3. Actualizar el equipo
      const updatedTeam = await this.teamRepository.update(id, updateData);
      
      // 4. Retornar respuesta formateada
      return await this.formatTeamResponse(updatedTeam, userId);
      
    } catch (error) {
      throw new Error(`Error updating team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Elimina un equipo
   */
  async deleteTeam(id: string, userId: string): Promise<void> {
    try {
      // 1. Verificar que el equipo existe y pertenece al usuario
      const existingTeam = await this.teamRepository.findById(id);
      if (!existingTeam) {
        throw new Error('Equipo no encontrado');
      }
      
      if (existingTeam.userId !== userId) {
        throw new Error('No tienes permisos para eliminar este equipo');
      }
      
      // 2. Verificar que el equipo no tenga jugadoras activas
      const playerCount = await this.teamRepository.getTeamPlayerCount(id);
      if (playerCount > 0) {
        throw new Error(`No se puede eliminar un equipo con ${playerCount} jugadoras. Remover todas las jugadoras primero.`);
      }
      
      // 3. Eliminar el equipo
      await this.teamRepository.delete(id);
      
    } catch (error) {
      throw new Error(`Error deleting team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene todos los equipos de un usuario
   */
  async getTeamsByUser(userId: string): Promise<TeamResponseDTO[]> {
    try {
      const teams = await this.teamRepository.findByUserId(userId);
      
      const teamResponses = await Promise.all(
        teams.map(team => this.formatTeamResponse(team, userId))
      );
      
      return teamResponses;
      
    } catch (error) {
      throw new Error(`Error getting user teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene un equipo específico por ID
   */
  async getTeamById(id: string, requestUserId: string): Promise<TeamResponseDTO | null> {
    try {
      const team = await this.teamRepository.findById(id);
      if (!team) return null;
      
      return await this.formatTeamResponse(team, requestUserId);
      
    } catch (error) {
      throw new Error(`Error getting team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Agrega una jugadora a un equipo
   */
  async addPlayerToTeam(teamId: string, playerId: string, userId: string): Promise<void> {
    try {
      // 1. Verificar que el equipo existe y pertenece al usuario
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }
      
      if (team.userId !== userId) {
        throw new Error('No tienes permisos para modificar este equipo');
      }
      
      // 2. Verificar límite de jugadoras
      const currentPlayerCount = await this.teamRepository.getTeamPlayerCount(teamId);
      if (currentPlayerCount >= team.maxPlayers) {
        throw new Error(`Equipo completo. Máximo ${team.maxPlayers} jugadoras permitidas.`);
      }
      
      // 3. Validaciones específicas de hockey (edad, divisiones, etc.)
      // TODO: Implementar validaciones con datos de la jugadora
      // const playerValidation = await this.divisionValidationService.canPlayerJoinDivision(
      //   playerId, team.divisionId, team.clubName, playerBirthDate
      // );
      
      // 4. Agregar jugadora al equipo
      await this.teamRepository.addPlayerToTeam(teamId, playerId);
      
    } catch (error) {
      throw new Error(`Error adding player to team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Remueve una jugadora de un equipo
   */
  async removePlayerFromTeam(teamId: string, playerId: string, userId: string): Promise<void> {
    try {
      // 1. Verificar que el equipo existe y pertenece al usuario
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }
      
      if (team.userId !== userId) {
        throw new Error('No tienes permisos para modificar este equipo');
      }
      
      // 2. Remover jugadora del equipo
      await this.teamRepository.removePlayerFromTeam(teamId, playerId);
      
    } catch (error) {
      throw new Error(`Error removing player from team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene un equipo con sus jugadoras
   */
  async getTeamWithPlayers(id: string, requestUserId: string): Promise<TeamWithPlayersDTO | null> {
    try {
      const team = await this.teamRepository.findById(id);
      if (!team) return null;
      
      // Formatear respuesta básica
      const basicResponse = await this.formatTeamResponse(team, requestUserId);
      
      // TODO: Implementar obtención de jugadoras y estadísticas
      const teamWithPlayers: TeamWithPlayersDTO = {
        ...basicResponse,
        players: [], // TODO: Obtener jugadoras reales
        positionsSummary: {
          goalkeepers: 0,
          defenders: 0,
          midfielders: 0,
          forwards: 0,
          total: 0
        },
        stats: {
          averageAge: 0,
          activePlayersCount: 0,
          inactivePlayersCount: 0
        }
      };
      
      return teamWithPlayers;
      
    } catch (error) {
      throw new Error(`Error getting team with players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Obtiene información de validación para crear equipos
   */
  async getTeamValidationInfo(userId: string): Promise<TeamValidationDTO> {
    try {
      const userPlan = await this.planValidationService.getUserPlanInfo(userId);
      if (!userPlan) {
        throw new Error('Plan de usuario no encontrado');
      }
      
      const availableDivisions = await this.divisionRepository.findAll();
      
      return {
        canCreate: userPlan.canCreateTeam,
        currentTeamCount: userPlan.currentTeamCount,
        maxTeamsAllowed: userPlan.maxTeamsAllowed,
        remainingTeams: userPlan.remainingTeams,
        userPlan: userPlan.planName,
        availableDivisions: availableDivisions.map(div => ({
          id: div.id,
          name: div.name,
          gender: div.gender,
          allowsShootout: div.allowsShootout
        }))
      };
      
    } catch (error) {
      throw new Error(`Error getting validation info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Busca equipos con filtros
   */
  async searchTeams(filters: TeamFiltersDTO): Promise<PaginatedTeamsDTO> {
    try {
      return await this.teamRepository.findWithFilters(filters);
    } catch (error) {
      throw new Error(`Error searching teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // --- Métodos auxiliares privados ---
  
  /**
   * Formatea un equipo para respuesta API
   */
  private async formatTeamResponse(team: Team, requestUserId: string): Promise<TeamResponseDTO> {
    try {
      // Obtener información de la división
      const division = await this.divisionRepository.findById(team.divisionId);
      const playerCount = await this.teamRepository.getTeamPlayerCount(team.id);
      
      const canAddPlayers = playerCount < team.maxPlayers;
      const canEdit = team.userId === requestUserId;
      const canDelete = team.userId === requestUserId && playerCount === 0;
      
      return {
        id: team.id,
        name: team.name,
        clubName: team.clubName,
        division: {
          id: division.id,
          name: division.name,
          gender: division.gender,
          allowsShootout: division.allowsShootout
        },
        playerCount,
        maxPlayers: team.maxPlayers,
        canAddPlayers,
        canEdit,
        canDelete,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      };
      
    } catch (error) {
      throw new Error(`Error formatting team response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
