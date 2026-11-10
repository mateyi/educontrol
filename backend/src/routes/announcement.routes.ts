import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  getNotifications,
  markNotificationAsRead,
  createAnnouncementSchema,
} from '../controllers/announcement.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post(
  '/',
  authorize('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'),
  validate(createAnnouncementSchema),
  createAnnouncement
);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);

export default router;

