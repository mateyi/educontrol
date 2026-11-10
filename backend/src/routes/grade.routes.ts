import { Router } from 'express';
import {
  getAssessments,
  createAssessment,
  saveGrades,
  getStudentReportCard,
  createAssessmentSchema,
  saveGradesSchema,
} from '../controllers/grade.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/assessments', getAssessments);
router.post('/assessments', authorize('PROFESOR', 'ADMINISTRADOR'), validate(createAssessmentSchema), createAssessment);
router.post('/save', authorize('PROFESOR', 'ADMINISTRADOR'), validate(saveGradesSchema), saveGrades);
router.get('/report-card/:studentId', getStudentReportCard);

export default router;
