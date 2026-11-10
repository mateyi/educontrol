import { Router } from 'express';
import {
  getUsers,
  createUser,
  toggleUserStatus,
  getAuditLogs,
  getSchoolSettings,
  updateSchoolSettings,
  createUserSchema,
  updateSchoolSettingsSchema,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/users', authorize('ADMINISTRADOR'), getUsers);
router.post('/users', authorize('ADMINISTRADOR'), validate(createUserSchema), createUser);
router.patch('/users/:id/toggle-status', authorize('ADMINISTRADOR'), toggleUserStatus);
router.get('/audit-logs', authorize('ADMINISTRADOR'), getAuditLogs);
router.get('/school-settings', authorize('ADMINISTRADOR', 'DIRECTIVO'), getSchoolSettings);
router.put(
  '/school-settings',
  authorize('ADMINISTRADOR'),
  validate(updateSchoolSettingsSchema),
  updateSchoolSettings
);

export default router;
