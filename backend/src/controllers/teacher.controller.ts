import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/password';
import { createAuditLog } from '../utils/audit';

export const createTeacherSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    lastName: z.string().min(2),
    dni: z.string().min(7),
    email: z.string().email(),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    fileNumber: z.string().optional(), // Legajo docente
    password: z.string().min(6).optional(),
  }),
});

export async function getTeachers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;

  const teachers = await prisma.teacher.findMany({
    where: {
      user: { schoolId, active: true },
    },
    include: {
      user: {
        select: { id: true, name: true, lastName: true, dni: true, email: true, phone: true, avatar: true },
      },
      assignments: {
        include: {
          subject: true,
          course: true,
        },
      },
      schedules: {
        include: {
          subject: true,
          course: true,
          classroom: true,
        },
      },
    },
    orderBy: { user: { lastName: 'asc' } },
  });

  res.json({
    data: teachers.map((t) => ({
      id: t.id,
      userId: t.userId,
      fileNumber: t.fileNumber,
      name: t.user.name,
      lastName: t.user.lastName,
      dni: t.user.dni,
      email: t.user.email,
      phone: t.user.phone,
      specialty: t.specialty,
      active: t.active,
      assignments: t.assignments.map((a) => ({
        id: a.id,
        subjectId: a.subject.id,
        subjectName: a.subject.name,
        courseId: a.course.id,
        courseName: a.course.name,
      })),
      schedulesCount: t.schedules.length,
    })),
  });
}

export async function createTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ dni: data.dni }, { email: data.email.toLowerCase() }] },
  });

  if (existing) {
    res.status(400).json({ error: 'Ya existe un usuario con este DNI o correo' });
    return;
  }

  const hashedPassword = await hashPassword(data.password || data.dni);
  const fileNumber = data.fileNumber || `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const teacher = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'PROFESOR',
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        phone: data.phone,
      },
    });

    return tx.teacher.create({
      data: {
        userId: user.id,
        fileNumber,
        specialty: data.specialty,
        hireDate: new Date(),
        active: true,
      },
    });
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'CREAR_PROFESOR',
    entity: 'Teacher',
    entityId: teacher.id,
  });

  res.status(201).json({ message: 'Profesor registrado exitosamente', teacher });
}

export async function updateTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!teacher || teacher.user.schoolId !== schoolId) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: teacher.userId },
      data: {
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        email: data.email?.toLowerCase(),
        phone: data.phone,
      },
    }),
    prisma.teacher.update({
      where: { id },
      data: {
        specialty: data.specialty,
      },
    }),
  ]);

  res.json({ message: 'Profesor actualizado correctamente' });
}

export async function deleteTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!teacher) {
    res.status(404).json({ error: 'Profesor no encontrado' });
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: teacher.userId },
      data: { active: false },
    }),
    prisma.teacher.update({
      where: { id },
      data: { active: false },
    }),
  ]);

  res.json({ message: 'Profesor desactivado correctamente' });
}
