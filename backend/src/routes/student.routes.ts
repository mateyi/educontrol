import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  createStudentSchema,
  updateStudentSchema,
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'), getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR'), validate(createStudentSchema), createStudent);
router.put('/:id', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR'), validate(updateStudentSchema), updateStudent);
router.delete('/:id', authorize('ADMINISTRADOR', 'DIRECTIVO'), deleteStudent);

export default router;
