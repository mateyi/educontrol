import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre del curso requerido'),
    level: z.string().default('SECUNDARIO'),
    yearNumber: z.number().int().min(1).max(7),
    division: z.string().min(1),
    shift: z.enum(['MAÑANA', 'TARDE', 'VESPERTINO', 'JORNADA_COMPLETA']),
    preceptorId: z.string().optional().nullable(),
  }),
});

export async function getCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;

  const courses = await prisma.course.findMany({
    where: { schoolId },
    include: {
      preceptor: { select: { id: true, name: true, lastName: true, email: true } },
      enrollments: {
        where: { status: 'ACTIVO' },
        include: {
          student: {
            include: { user: { select: { id: true, name: true, lastName: true, dni: true, email: true } } },
          },
        },
      },
      teacherAssignments: {
        include: {
          subject: true,
          teacher: { include: { user: { select: { name: true, lastName: true } } } },
        },
      },
      schedules: {
        include: { subject: true, teacher: { include: { user: true } }, classroom: true },
      },
    },
    orderBy: [{ yearNumber: 'asc' }, { division: 'asc' }],
  });

  res.json({
    data: courses.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      yearNumber: c.yearNumber,
      division: c.division,
      shift: c.shift,
      preceptor: c.preceptor,
      studentCount: c.enrollments.length,
      subjectsCount: c.teacherAssignments.length,
      students: c.enrollments.map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        fileNumber: e.student.fileNumber,
        name: e.student.user.name,
        lastName: e.student.user.lastName,
        dni: e.student.user.dni,
        email: e.student.user.email,
        status: e.student.status,
      })),
      subjects: c.teacherAssignments.map((ta) => ({
        assignmentId: ta.id,
        subjectId: ta.subject.id,
        name: ta.subject.name,
        code: ta.subject.code,
        teacherName: `${ta.teacher.user.name} ${ta.teacher.user.lastName}`,
      })),
    })),
  });
}

export async function createCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  // Active academic year
  const activeYear = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
  });

  if (!activeYear) {
    res.status(400).json({ error: 'No se encontró un ciclo lectivo activo configurado' });
    return;
  }

  const course = await prisma.course.create({
    data: {
      schoolId,
      academicYearId: activeYear.id,
      name: data.name,
      level: data.level,
      yearNumber: data.yearNumber,
      division: data.division,
      shift: data.shift,
      preceptorId: data.preceptorId || null,
    },
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'CREAR_CURSO',
    entity: 'Course',
    entityId: course.id,
    details: data,
  });

  res.status(201).json({ message: 'Curso creado exitosamente', course });
}

export async function updateCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const data = req.body;

  const course = await prisma.course.update({
    where: { id },
    data: {
      name: data.name,
      level: data.level,
      yearNumber: data.yearNumber,
      division: data.division,
      shift: data.shift,
      preceptorId: data.preceptorId,
    },
  });

  res.json({ message: 'Curso actualizado exitosamente', course });
}

export async function deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  // Check if course has active enrollments
  const enrollmentsCount = await prisma.enrollment.count({
    where: { courseId: id, status: 'ACTIVO' },
  });

  if (enrollmentsCount > 0) {
    res.status(400).json({
      error: `No se puede eliminar el curso porque tiene ${enrollmentsCount} alumnos inscriptos. Reasigne o desvincule los alumnos primero.`,
    });
    return;
  }

  await prisma.course.delete({ where: { id } });
  res.json({ message: 'Curso eliminado correctamente' });
}

