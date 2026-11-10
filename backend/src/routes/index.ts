import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import studentRoutes from './student.routes';
import teacherRoutes from './teacher.routes';
import courseRoutes from './course.routes';
import subjectRoutes from './subject.routes';
import gradeRoutes from './grade.routes';
import attendanceRoutes from './attendance.routes';
import scheduleRoutes from './schedule.routes';
import assignmentRoutes from './assignment.routes';
import announcementRoutes from './announcement.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/grades', gradeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/admin', adminRoutes);

export default router;
