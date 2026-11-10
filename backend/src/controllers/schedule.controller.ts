import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createScheduleSchema = z.object({
  body: z.object({
    courseId: z.string(),
    subjectId: z.string(),
    teacherId: z.string(),
    classroomId: z.string(),
    dayOfWeek: z.number().int().min(1).max(6), // 1: Lun, 5: Vie
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:MM'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:MM'),
  }),
});

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export async function getSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { courseId, teacherId, classroomId } = req.query;

  const where: any = {};
  if (courseId) where.courseId = courseId as string;
  if (teacherId) where.teacherId = teacherId as string;
  if (classroomId) where.classroomId = classroomId as string;

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      course: true,
      subject: true,
      teacher: { include: { user: { select: { name: true, lastName: true } } } },
      classroom: true,
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  res.json({ data: schedules });
}

export async function createSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  const data = req.body;

  if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
    res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });
    return;
  }

  // Check 1: Teacher conflict
  const teacherSchedules = await prisma.schedule.findMany({
    where: {
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
    },
    include: { course: true, subject: true },
  });

  const teacherConflict = teacherSchedules.find((s) =>
    timesOverlap(data.startTime, data.endTime, s.startTime, s.endTime)
  );

  if (teacherConflict) {
    res.status(409).json({
      error: `Conflicto de horario: El docente ya tiene asignada la materia "${teacherConflict.subject.name}" en el curso "${teacherConflict.course.name}" de ${teacherConflict.startTime} a ${teacherConflict.endTime}`,
    });
    return;
  }

  // Check 2: Classroom conflict
  const classroomSchedules = await prisma.schedule.findMany({
    where: {
      classroomId: data.classroomId,
      dayOfWeek: data.dayOfWeek,
    },
    include: { course: true, classroom: true },
  });

  const classroomConflict = classroomSchedules.find((s) =>
    timesOverlap(data.startTime, data.endTime, s.startTime, s.endTime)
  );

  if (classroomConflict) {
    res.status(409).json({
      error: `Conflicto de aula: El aula "${classroomConflict.classroom.name}" ya está ocupada por el curso "${classroomConflict.course.name}" de ${classroomConflict.startTime} a ${classroomConflict.endTime}`,
    });
    return;
  }

  // Check 3: Course conflict
  const courseSchedules = await prisma.schedule.findMany({
    where: {
      courseId: data.courseId,
      dayOfWeek: data.dayOfWeek,
    },
    include: { subject: true },
  });

  const courseConflict = courseSchedules.find((s) =>
    timesOverlap(data.startTime, data.endTime, s.startTime, s.endTime)
  );

  if (courseConflict) {
    res.status(409).json({
      error: `Conflicto de curso: Este curso ya tiene clase de "${courseConflict.subject.name}" programada de ${courseConflict.startTime} a ${courseConflict.endTime}`,
    });
    return;
  }

  const schedule = await prisma.schedule.create({
    data: {
      courseId: data.courseId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: {
      course: true,
      subject: true,
      teacher: { include: { user: true } },
      classroom: true,
    },
  });

  res.status(201).json({ message: 'Horario asignado correctamente', schedule });
}

export async function deleteSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.schedule.delete({ where: { id } });
  res.json({ message: 'Horario eliminado correctamente' });
}

export async function getClassrooms(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const classrooms = await prisma.classroom.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });
  res.json({ data: classrooms });
}

