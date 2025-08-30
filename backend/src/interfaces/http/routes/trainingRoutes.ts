import express from 'express';
import { TrainingSessionRepositoryPostgres } from '../../../core/repositories/TrainingSessionRepositoryPostgres.js';
import { TrainingAttendanceRepositoryPostgres } from '../../../core/repositories/TrainingAttendanceRepositoryPostgres.js';

const router = express.Router();
const trainingSessionRepo = new TrainingSessionRepositoryPostgres();
const trainingAttendanceRepo = new TrainingAttendanceRepositoryPostgres();

// GET /api/training-sessions - Obtener todas las sesiones de entrenamiento
router.get('/', async (req, res) => {
  try {
    const { teamId, status, startDate, endDate } = req.query;
    
    const options: any = {};
    if (teamId) options.teamId = teamId as string;
    if (status) options.status = status as string;
    if (startDate && endDate) {
      options.startDate = new Date(startDate as string);
      options.endDate = new Date(endDate as string);
    }
    
    const trainingSessions = await trainingSessionRepo.findAll(options);
    
    res.json({
      success: true,
      data: trainingSessions,
      count: trainingSessions.length
    });
  } catch (error) {
    console.error('Error obteniendo sesiones de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/training-sessions/:id - Obtener sesión por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trainingSession = await trainingSessionRepo.findById(id);
    
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        error: 'Sesión de entrenamiento no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: trainingSession
    });
  } catch (error) {
    console.error('Error obteniendo sesión de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/training-sessions - Crear nueva sesión
router.post('/', async (req, res) => {
  try {
    const sessionData = {
      id: `training_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newSession = await trainingSessionRepo.create(sessionData);
    
    res.status(201).json({
      success: true,
      data: newSession,
      message: 'Sesión de entrenamiento creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando sesión de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/training-sessions/:id - Actualizar sesión
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedSession = await trainingSessionRepo.update(id, updateData);
    
    res.json({
      success: true,
      data: updatedSession,
      message: 'Sesión de entrenamiento actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando sesión de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/training-sessions/:id - Eliminar sesión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await trainingSessionRepo.delete(id);
    
    res.json({
      success: true,
      message: 'Sesión de entrenamiento eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando sesión de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/training-sessions/team/:teamId/upcoming - Próximos entrenamientos
router.get('/team/:teamId/upcoming', async (req, res) => {
  try {
    const { teamId } = req.params;
    const upcomingSessions = await trainingSessionRepo.findUpcoming(teamId);
    
    res.json({
      success: true,
      data: upcomingSessions,
      count: upcomingSessions.length
    });
  } catch (error) {
    console.error('Error obteniendo próximos entrenamientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/training-sessions/:id/cancel - Cancelar sesión
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const cancelledSession = await trainingSessionRepo.markAsCancelled(id, reason);
    
    res.json({
      success: true,
      data: cancelledSession,
      message: 'Sesión de entrenamiento cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error cancelando sesión de entrenamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/training-sessions/:id/attendances - Obtener asistencias de una sesión
router.get('/:id/attendances', async (req, res) => {
  try {
    const { id } = req.params;
    const attendances = await trainingAttendanceRepo.findByTrainingSession(id);
    
    res.json({
      success: true,
      data: attendances,
      count: attendances.length
    });
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
