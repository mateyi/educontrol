import { Router } from 'express';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  createTeacherSchema,
} from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'), getTeachers);
router.post('/', authorize('ADMINISTRADOR', 'DIRECTIVO'), validate(createTeacherSchema), createTeacher);
router.put('/:id', authorize('ADMINISTRADOR', 'DIRECTIVO'), updateTeacher);
router.delete('/:id', authorize('ADMINISTRADOR'), deleteTeacher);

export default router;

