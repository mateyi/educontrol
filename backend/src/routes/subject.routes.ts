import { Router } from 'express';
import {
  getSubjects,
  createSubject,
  assignTeacherToSubject,
  createSubjectSchema,
  assignTeacherSchema,
} from '../controllers/subject.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSubjects);
router.post('/', authorize('ADMINISTRADOR', 'DIRECTIVO'), validate(createSubjectSchema), createSubject);
router.post('/assign-teacher', authorize('ADMINISTRADOR', 'DIRECTIVO'), validate(assignTeacherSchema), assignTeacherToSubject);

export default router;
