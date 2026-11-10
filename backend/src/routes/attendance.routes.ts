import { Router } from 'express';
import {
  getAttendanceByCourseAndDate,
  saveAttendance,
  getAttendanceStats,
  saveAttendanceSchema,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAttendanceByCourseAndDate);
router.post(
  '/',
  authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'),
  validate(saveAttendanceSchema),
  saveAttendance
);
router.get('/stats', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR'), getAttendanceStats);

export default router;
