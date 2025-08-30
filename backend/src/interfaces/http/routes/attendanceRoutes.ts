import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController.js';
import { AttendanceService } from '../../../core/services/AttendanceService.js';
import { AttendanceRepositoryPostgres } from '../../../core/repositories/AttendanceRepositoryPostgres.js';

const router = Router();
const attendanceRepo = new AttendanceRepositoryPostgres();
const attendanceService = new AttendanceService(attendanceRepo);
const attendanceController = new AttendanceController(attendanceService);

router.post('/', (req, res) => attendanceController.create(req, res));
router.get('/', (req, res) => attendanceController.getAll(req, res));
router.get('/:id', (req, res) => attendanceController.getById(req, res));
router.put('/:id', (req, res) => attendanceController.update(req, res));
router.delete('/:id', (req, res) => attendanceController.delete(req, res));

export default router;
