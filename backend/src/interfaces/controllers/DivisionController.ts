/**
 * 🏑 Hockey Management System
 * FASE 1C: CRUD Equipos - Controlador de Divisiones
 * 
 * Controlador para operaciones con divisiones y validaciones
 * específicas del reglamento de hockey sobre césped
 */

import { Request, Response } from 'express';
import { DivisionRepositoryPostgres } from '../../infrastructure/repositories/DivisionRepositoryPostgres.js';
import { DivisionValidationService } from '../../core/services/DivisionValidationService.js';
import { DivisionFiltersDTO } from '../../core/dtos/DivisionDTO.js';

/**
 * Controlador para endpoints de divisiones
 */
export class DivisionController {
  
  constructor(
    private divisionRepository: DivisionRepositoryPostgres,
    private divisionValidationService: DivisionValidationService
  ) {}
  
  /**
   * GET /api/divisions - Obtener todas las divisiones
   */
  async getAllDivisions(req: Request, res: Response): Promise<void> {
    try {
      // Extraer filtros de query parameters
      const filters: DivisionFiltersDTO = {
        gender: req.query.gender as 'male' | 'female',
        activeOnly: req.query.activeOnly !== 'false', // Por defecto true
        allowsShootout: req.query.allowsShootout ? req.query.allowsShootout === 'true' : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };
      
      let divisions;
      
      // Si se solicita información detallada
      if (req.query.detailed === 'true') {
        divisions = await this.divisionRepository.findAllWithStats();
      } else if (filters.gender) {
        divisions = await this.divisionRepository.findByGender(filters.gender);
      } else {
        divisions = await this.divisionRepository.findAll();
      }
      
      // Aplicar filtros adicionales si es necesario
      if (filters.allowsShootout !== undefined) {
        divisions = divisions.filter(d => d.allowsShootout === filters.allowsShootout);
      }
      
      res.status(200).json({
        success: true,
        message: 'Divisiones obtenidas exitosamente',
        data: divisions,
        meta: {
          count: divisions.length,
          filters: filters
        }
      });
      
    } catch (error) {
      console.error('Error getting divisions:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener divisiones',
        code: 'DIVISIONS_FETCH_ERROR'
      });
    }
  }
  
  /**
   * GET /api/divisions/by-gender/:gender - Obtener divisiones por género
   */
  async getDivisionsByGender(req: Request, res: Response): Promise<void> {
    try {
      const { gender } = req.params;
      
      if (!gender || !['male', 'female'].includes(gender)) {
        res.status(400).json({
          success: false,
          message: 'Género válido requerido (male o female)'
        });
        return;
      }
      
      const divisions = await this.divisionRepository.findByGender(gender);
      
      res.status(200).json({
        success: true,
        message: `Divisiones ${gender === 'female' ? 'femeninas' : 'masculinas'} obtenidas exitosamente`,
        data: divisions,
        meta: {
          count: divisions.length,
          gender: gender
        }
      });
      
    } catch (error) {
      console.error('Error getting divisions by gender:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener divisiones por género',
        code: 'DIVISIONS_BY_GENDER_ERROR'
      });
    }
  }
  
  /**
   * GET /api/divisions/:id - Obtener división específica
   */
  async getDivisionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de división requerido'
        });
        return;
      }
      
      const division = await this.divisionRepository.findById(id);
      
      if (!division) {
        res.status(404).json({
          success: false,
          message: 'División no encontrada',
          code: 'DIVISION_NOT_FOUND'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'División obtenida exitosamente',
        data: division
      });
      
    } catch (error) {
      console.error('Error getting division:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener división',
        code: 'DIVISION_FETCH_ERROR'
      });
    }
  }
  
  /**
   * GET /api/divisions/:id/rules - Obtener reglas específicas de una división
   */
  async getDivisionRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de división requerido'
        });
        return;
      }
      
      const rules = await this.divisionValidationService.getDivisionRules(id);
      
      if (!rules) {
        res.status(404).json({
          success: false,
          message: 'Reglas de división no encontradas',
          code: 'DIVISION_RULES_NOT_FOUND'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Reglas de división obtenidas exitosamente',
        data: rules
      });
      
    } catch (error) {
      console.error('Error getting division rules:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reglas de división',
        code: 'DIVISION_RULES_ERROR'
      });
    }
  }
  
  /**
   * POST /api/divisions/validate-age - Validar edad para división
   */
  async validatePlayerAge(req: Request, res: Response): Promise<void> {
    try {
      const { birthDate, divisionId } = req.body;
      
      if (!birthDate || !divisionId) {
        res.status(400).json({
          success: false,
          message: 'Fecha de nacimiento y división son requeridas',
          errors: {
            birthDate: !birthDate ? 'Fecha de nacimiento requerida' : undefined,
            divisionId: !divisionId ? 'División requerida' : undefined
          }
        });
        return;
      }
      
      // Validar formato de fecha
      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido'
        });
        return;
      }
      
      const validation = await this.divisionValidationService.validatePlayerAgeForDivision(
        parsedDate, 
        divisionId
      );
      
      res.status(200).json({
        success: true,
        message: validation.isValid ? 'Edad válida para la división' : 'Edad no válida para la división',
        data: validation
      });
      
    } catch (error) {
      console.error('Error validating player age:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al validar edad',
        code: 'AGE_VALIDATION_ERROR'
      });
    }
  }
  
  /**
   * POST /api/divisions/suitable-for-birth-date - Encontrar divisiones apropiadas para fecha de nacimiento
   */
  async findSuitableDivisions(req: Request, res: Response): Promise<void> {
    try {
      const { birthDate } = req.body;
      
      if (!birthDate) {
        res.status(400).json({
          success: false,
          message: 'Fecha de nacimiento es requerida'
        });
        return;
      }
      
      // Validar formato de fecha
      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido'
        });
        return;
      }
      
      const suitableDivisions = await this.divisionRepository.findSuitableForBirthDate(parsedDate);
      
      res.status(200).json({
        success: true,
        message: 'Divisiones apropiadas encontradas',
        data: suitableDivisions,
        meta: {
          birthDate: parsedDate.toISOString().split('T')[0],
          count: suitableDivisions.length
        }
      });
      
    } catch (error) {
      console.error('Error finding suitable divisions:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al buscar divisiones apropiadas',
        code: 'SUITABLE_DIVISIONS_ERROR'
      });
    }
  }
  
  /**
   * GET /api/divisions/:id/stats - Obtener estadísticas de una división
   */
  async getDivisionStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de división requerido'
        });
        return;
      }
      
      // Obtener información detallada de la división
      const detailedDivisions = await this.divisionRepository.findAllWithStats();
      const divisionStats = detailedDivisions.find(d => d.id === id);
      
      if (!divisionStats) {
        res.status(404).json({
          success: false,
          message: 'División no encontrada',
          code: 'DIVISION_NOT_FOUND'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Estadísticas de división obtenidas exitosamente',
        data: {
          division: {
            id: divisionStats.id,
            name: divisionStats.name,
            gender: divisionStats.gender
          },
          stats: {
            teamCount: divisionStats.teamCount,
            totalPlayers: divisionStats.totalPlayers,
            averagePlayersPerTeam: divisionStats.averagePlayersPerTeam
          },
          rules: divisionStats.rules
        }
      });
      
    } catch (error) {
      console.error('Error getting division stats:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas',
        code: 'DIVISION_STATS_ERROR'
      });
    }
  }
  
  /**
   * POST /api/divisions/initialize - Inicializar divisiones por defecto (admin only)
   */
  async initializeDefaultDivisions(req: Request, res: Response): Promise<void> {
    try {
      // Esta función debería estar protegida por middleware requireRole(['admin'])
      await this.divisionRepository.initializeDefaultDivisions();
      
      res.status(200).json({
        success: true,
        message: 'Divisiones por defecto inicializadas exitosamente'
      });
      
    } catch (error) {
      console.error('Error initializing default divisions:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al inicializar divisiones',
        code: 'DIVISION_INITIALIZATION_ERROR'
      });
    }
  }
}
