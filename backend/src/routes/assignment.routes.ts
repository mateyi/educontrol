import { Router } from 'express';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAssignments);
router.post('/', authorize('PROFESOR', 'ADMINISTRADOR'), validate(createAssignmentSchema), createAssignment);
router.post('/submit', authorize('ALUMNO'), validate(submitAssignmentSchema), submitAssignment);
router.post('/grade', authorize('PROFESOR', 'ADMINISTRADOR'), validate(gradeSubmissionSchema), gradeSubmission);

export default router;

