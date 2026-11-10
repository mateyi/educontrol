import { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
  getClassrooms,
  createScheduleSchema,
} from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSchedules);
router.get('/classrooms', getClassrooms);
router.post('/', authorize('ADMINISTRADOR', 'DIRECTIVO'), validate(createScheduleSchema), createSchedule);
router.delete('/:id', authorize('ADMINISTRADOR', 'DIRECTIVO'), deleteSchedule);

export default router;
