import { Router } from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createCourseSchema,
} from '../controllers/course.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCourses);
router.post('/', authorize('ADMINISTRADOR', 'DIRECTIVO'), validate(createCourseSchema), createCourse);
router.put('/:id', authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR'), updateCourse);
router.delete('/:id', authorize('ADMINISTRADOR'), deleteCourse);

export default router;

