import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre de materia requerido'),
    code: z.string().min(2, 'Código de materia requerido'),
    description: z.string().optional(),
    hoursPerWeek: z.number().int().min(1).max(20).default(4),
  }),
});

export async function getSubjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    include: {
      teacherAssignments: {
        include: {
          teacher: { include: { user: { select: { name: true, lastName: true } } } },
          course: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    data: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      description: s.description,
      hoursPerWeek: s.hoursPerWeek,
      assignments: s.teacherAssignments.map((ta) => ({
        id: ta.id,
        courseId: ta.course.id,
        courseName: ta.course.name,
        teacherName: `${ta.teacher.user.name} ${ta.teacher.user.lastName}`,
      })),
    })),
  });
}

export async function createSubject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const subject = await prisma.subject.create({
    data: {
      schoolId,
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
      hoursPerWeek: data.hoursPerWeek,
    },
  });

  res.status(201).json({ message: 'Materia creada exitosamente', subject });
}

export const assignTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string(),
    subjectId: z.string(),
    courseId: z.string(),
  }),
});

export async function assignTeacherToSubject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const { teacherId, subjectId, courseId } = req.body;

  const activeYear = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
  });

  if (!activeYear) {
    res.status(400).json({ error: 'Ciclo lectivo activo no configurado' });
    return;
  }

  const assignment = await prisma.teacherAssignment.upsert({
    where: {
      teacherId_subjectId_courseId_academicYearId: {
        teacherId,
        subjectId,
        courseId,
        academicYearId: activeYear.id,
      },
    },
    update: {},
    create: {
      teacherId,
      subjectId,
      courseId,
      academicYearId: activeYear.id,
    },
  });

  res.status(201).json({ message: 'Profesor asignado con éxito', assignment });
}
