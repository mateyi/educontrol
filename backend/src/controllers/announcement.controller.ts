import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Título requerido'),
    content: z.string().min(5, 'Contenido requerido'),
    targetAudience: z.enum(['TODOS', 'PROFESORES', 'ALUMNOS', 'TUTORES', 'CURSO']),
    courseId: z.string().optional().nullable(),
    isImportant: z.boolean().default(false),
  }),
});

export async function getAnnouncements(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const user = req.user!;

  const where: any = { schoolId };

  // Role based filtering
  if (user.role === 'PROFESOR') {
    where.OR = [{ targetAudience: 'TODOS' }, { targetAudience: 'PROFESORES' }];
  } else if (user.role === 'ALUMNO') {
    where.OR = [{ targetAudience: 'TODOS' }, { targetAudience: 'ALUMNOS' }];
  } else if (user.role === 'TUTOR') {
    where.OR = [{ targetAudience: 'TODOS' }, { targetAudience: 'TUTORES' }];
  }

  const announcements = await prisma.announcement.findMany({
    where,
    include: {
      author: { select: { name: true, lastName: true, role: true } },
      course: { select: { name: true } },
    },
    orderBy: [{ isImportant: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ data: announcements });
}

export async function createAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;
  const user = req.user!;

  const announcement = await prisma.announcement.create({
    data: {
      schoolId,
      authorId: user.userId,
      title: data.title,
      content: data.content,
      targetAudience: data.targetAudience,
      courseId: data.courseId || null,
      isImportant: data.isImportant || false,
    },
    include: {
      author: { select: { name: true, lastName: true } },
    },
  });

  res.status(201).json({ message: 'Comunicado publicado exitosamente', announcement });
}

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  res.json({ data: notifications, unreadCount });
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;

  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

  res.json({ message: 'Notificación marcada como leída' });
}
