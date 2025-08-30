import { Router } from 'express';
import { UserAdminController } from '../controllers/UserAdminController.js';

const router = Router();
const userAdminController = new UserAdminController();

// Middleware para verificar que es admin (simplificado por ahora)
const requireAdmin = (req: any, res: any, next: any) => {
  // TODO: Implementar verificación real de JWT y rol admin
  // Por ahora permitimos todas las operaciones para pruebas
  next();
};

/**
 * @route GET /api/admin/users
 * @desc Obtener todos los usuarios
 * @access Admin only
 */
router.get('/', requireAdmin, (req, res) => userAdminController.getAllUsers(req, res));

/**
 * @route GET /api/admin/users/stats
 * @desc Obtener estadísticas de usuarios
 * @access Admin only
 */
router.get('/stats', requireAdmin, (req, res) => userAdminController.getUserStats(req, res));

/**
 * @route POST /api/admin/users
 * @desc Crear nuevo usuario
 * @access Admin only
 */
router.post('/', requireAdmin, (req, res) => userAdminController.createUser(req, res));

/**
 * @route GET /api/admin/users/:id
 * @desc Obtener usuario por ID
 * @access Admin only
 */
router.get('/:id', requireAdmin, (req, res) => userAdminController.getUserById(req, res));

/**
 * @route PUT /api/admin/users/:id
 * @desc Actualizar usuario
 * @access Admin only
 */
router.put('/:id', requireAdmin, (req, res) => userAdminController.updateUser(req, res));

/**
 * @route PATCH /api/admin/users/:id/toggle
 * @desc Activar/Desactivar usuario
 * @access Admin only
 */
router.patch('/:id/toggle', requireAdmin, (req, res) => userAdminController.toggleUserStatus(req, res));

/**
 * @route PUT /api/admin/users/:id/password
 * @desc Resetear contraseña de usuario
 * @access Admin only
 */
router.put('/:id/password', requireAdmin, (req, res) => userAdminController.resetPassword(req, res));

export default router;
