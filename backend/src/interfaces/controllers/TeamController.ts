/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Controlador de Equipos
 * 
 * Controlador principal para todas las operaciones CRUD de equipos
 * con validaciones específicas de hockey y manejo de errores
 */

import { Request, Response } from 'express';
import { TeamService } from '../../core/services/TeamService.js';
import { CreateTeamDTO, UpdateTeamDTO, TeamFiltersDTO } from '../../core/dtos/TeamDTO.js';

/**
 * Controlador para endpoints de equipos
 */
export class TeamController {
  
  constructor(private teamService: TeamService) {}
  
  /**
   * POST /api/teams - Crear nuevo equipo
   */
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId; // Garantizado por middleware requireAuth
      
      // Validar datos de entrada
      const { name, clubName, divisionId, maxPlayers } = req.body;
      
      if (!name || !clubName || !divisionId) {
        res.status(400).json({
          success: false,
          message: 'Campos requeridos: name, clubName, divisionId',
          errors: {
            name: !name ? 'Nombre del equipo es requerido' : undefined,
            clubName: !clubName ? 'Nombre del club es requerido' : undefined,
            divisionId: !divisionId ? 'División es requerida' : undefined
          }
        });
        return;
      }
      
      // Preparar DTO
      const teamData: CreateTeamDTO = {
        name: name.trim(),
        clubName: clubName.trim(),
        divisionId,
        userId,
        maxPlayers: maxPlayers || 20
      };
      
      // Crear equipo
      const createdTeam = await this.teamService.createTeam(teamData);
      
      res.status(201).json({
        success: true,
        message: 'Equipo creado exitosamente',
        data: createdTeam
      });
      
    } catch (error) {
      console.error('Error creating team:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al crear equipo',
        code: 'TEAM_CREATION_ERROR'
      });
    }
  }
  
  /**
   * GET /api/teams - Obtener equipos del usuario
   */
  async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      const teams = await this.teamService.getTeamsByUser(userId);
      
      res.status(200).json({
        success: true,
        message: 'Equipos obtenidos exitosamente',
        data: teams,
        meta: {
          count: teams.length
        }
      });
      
    } catch (error) {
      console.error('Error getting teams:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener equipos',
        code: 'TEAMS_FETCH_ERROR'
      });
    }
  }
  
  /**
   * GET /api/teams/:id - Obtener equipo específico
   */
  async getTeamById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestUserId = req.user!.userId;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo es requerido'
        });
        return;
      }
      
      const team = await this.teamService.getTeamById(id, requestUserId);
      
      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado',
          code: 'TEAM_NOT_FOUND'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Equipo obtenido exitosamente',
        data: team
      });
      
    } catch (error) {
      console.error('Error getting team:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener equipo',
        code: 'TEAM_FETCH_ERROR'
      });
    }
  }
  
  /**
   * PUT /api/teams/:id - Actualizar equipo
   */
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { name, clubName, divisionId, maxPlayers } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo es requerido'
        });
        return;
      }
      
      // Preparar datos de actualización (solo campos que se envían)
      const updateData: UpdateTeamDTO = {};
      
      if (name !== undefined) updateData.name = name.trim();
      if (clubName !== undefined) updateData.clubName = clubName.trim();
      if (divisionId !== undefined) updateData.divisionId = divisionId;
      if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers;
      
      // Verificar que al menos un campo se actualice
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Al menos un campo debe ser proporcionado para actualizar'
        });
        return;
      }
      
      const updatedTeam = await this.teamService.updateTeam(id, updateData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Equipo actualizado exitosamente',
        data: updatedTeam
      });
      
    } catch (error) {
      console.error('Error updating team:', error);
      
      const statusCode = error instanceof Error && error.message.includes('No tienes permisos') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al actualizar equipo',
        code: 'TEAM_UPDATE_ERROR'
      });
    }
  }
  
  /**
   * DELETE /api/teams/:id - Eliminar equipo
   */
  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo es requerido'
        });
        return;
      }
      
      await this.teamService.deleteTeam(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Equipo eliminado exitosamente'
      });
      
    } catch (error) {
      console.error('Error deleting team:', error);
      
      const statusCode = error instanceof Error && error.message.includes('No tienes permisos') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al eliminar equipo',
        code: 'TEAM_DELETE_ERROR'
      });
    }
  }
  
  /**
   * POST /api/teams/:id/players - Agregar jugadora a equipo
   */
  async addPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id: teamId } = req.params;
      const { playerId } = req.body;
      const userId = req.user!.userId;
      
      if (!teamId || !playerId) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo y jugadora son requeridos',
          errors: {
            teamId: !teamId ? 'ID de equipo requerido' : undefined,
            playerId: !playerId ? 'ID de jugadora requerido' : undefined
          }
        });
        return;
      }
      
      await this.teamService.addPlayerToTeam(teamId, playerId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Jugadora agregada al equipo exitosamente'
      });
      
    } catch (error) {
      console.error('Error adding player to team:', error);
      
      const statusCode = error instanceof Error && error.message.includes('No tienes permisos') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al agregar jugadora',
        code: 'PLAYER_ADD_ERROR'
      });
    }
  }
  
  /**
   * DELETE /api/teams/:id/players/:playerId - Remover jugadora de equipo
   */
  async removePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id: teamId, playerId } = req.params;
      const userId = req.user!.userId;
      
      if (!teamId || !playerId) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo y jugadora son requeridos'
        });
        return;
      }
      
      await this.teamService.removePlayerFromTeam(teamId, playerId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Jugadora removida del equipo exitosamente'
      });
      
    } catch (error) {
      console.error('Error removing player from team:', error);
      
      const statusCode = error instanceof Error && error.message.includes('No tienes permisos') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al remover jugadora',
        code: 'PLAYER_REMOVE_ERROR'
      });
    }
  }
  
  /**
   * GET /api/teams/:id/players - Obtener equipo con jugadoras
   */
  async getTeamWithPlayers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestUserId = req.user!.userId;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de equipo es requerido'
        });
        return;
      }
      
      const teamWithPlayers = await this.teamService.getTeamWithPlayers(id, requestUserId);
      
      if (!teamWithPlayers) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado',
          code: 'TEAM_NOT_FOUND'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Equipo con jugadoras obtenido exitosamente',
        data: teamWithPlayers
      });
      
    } catch (error) {
      console.error('Error getting team with players:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener equipo con jugadoras',
        code: 'TEAM_WITH_PLAYERS_ERROR'
      });
    }
  }
  
  /**
   * GET /api/teams/validation-info - Obtener información de validación para crear equipos
   */
  async getValidationInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      const validationInfo = await this.teamService.getTeamValidationInfo(userId);
      
      res.status(200).json({
        success: true,
        message: 'Información de validación obtenida exitosamente',
        data: validationInfo
      });
      
    } catch (error) {
      console.error('Error getting validation info:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener información de validación',
        code: 'VALIDATION_INFO_ERROR'
      });
    }
  }
  
  /**
   * GET /api/teams/search - Buscar equipos con filtros
   */
  async searchTeams(req: Request, res: Response): Promise<void> {
    try {
      // Construir filtros desde query parameters
      const filters: TeamFiltersDTO = {
        teamName: req.query.teamName as string,
        clubName: req.query.clubName as string,
        divisionId: req.query.divisionId as string,
        gender: req.query.gender as 'male' | 'female',
        hasAvailableSpots: req.query.hasAvailableSpots === 'true',
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      
      // Remover filtros undefined
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof TeamFiltersDTO] === undefined) {
          delete filters[key as keyof TeamFiltersDTO];
        }
      });
      
      const results = await this.teamService.searchTeams(filters);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda de equipos exitosa',
        data: results.teams,
        meta: {
          totalCount: results.totalCount,
          currentPage: results.currentPage,
          totalPages: results.totalPages,
          hasNextPage: results.hasNextPage,
          hasPreviousPage: results.hasPreviousPage
        }
      });
      
    } catch (error) {
      console.error('Error searching teams:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor en búsqueda de equipos',
        code: 'TEAM_SEARCH_ERROR'
      });
    }
  }
}
