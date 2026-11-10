import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const saveAttendanceSchema = z.object({
  body: z.object({
    courseId: z.string(),
    date: z.string(), // ISO string YYYY-MM-DD
    periodOrShift: z.string().default('GENERAL_DIARIA'),
    notes: z.string().optional(),
    records: z.array(
      z.object({
        studentId: z.string(),
        status: z.enum(['PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADO']),
        justified: z.boolean().default(false),
        justificationReason: z.string().optional().nullable(),
        remarks: z.string().optional().nullable(),
      })
    ),
  }),
});

export async function getAttendanceByCourseAndDate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { courseId, date, periodOrShift = 'GENERAL_DIARIA' } = req.query;

  if (!courseId || !date) {
    res.status(400).json({ error: 'courseId y date son obligatorios' });
    return;
  }

  // Normalize date to start of day
  const queryDate = new Date(date as string);
  queryDate.setUTCHours(0, 0, 0, 0);

  const session = await prisma.attendanceSession.findUnique({
    where: {
      courseId_date_periodOrShift: {
        courseId: courseId as string,
        date: queryDate,
        periodOrShift: periodOrShift as string,
      },
    },
    include: {
      recordedBy: { select: { name: true, lastName: true, role: true } },
      attendances: {
        include: {
          student: {
            include: { user: { select: { id: true, name: true, lastName: true, dni: true } } },
          },
        },
      },
    },
  });

  // Also get list of all enrolled students in the course to show pending
  const course = await prisma.course.findUnique({
    where: { id: courseId as string },
    include: {
      enrollments: {
        where: { status: 'ACTIVO' },
        include: {
          student: {
            include: { user: { select: { id: true, name: true, lastName: true, dni: true } } },
          },
        },
        orderBy: { student: { user: { lastName: 'asc' } } },
      },
    },
  });

  if (!course) {
    res.status(404).json({ error: 'Curso no encontrado' });
    return;
  }

  const existingMap = new Map();
  if (session) {
    session.attendances.forEach((att) => {
      existingMap.set(att.studentId, att);
    });
  }

  const studentRecords = course.enrollments.map((enr) => {
    const existing = existingMap.get(enr.student.id);
    return {
      studentId: enr.student.id,
      fileNumber: enr.student.fileNumber,
      name: enr.student.user.name,
      lastName: enr.student.user.lastName,
      dni: enr.student.user.dni,
      status: existing ? existing.status : 'PRESENTE', // Default to PRESENTE
      justified: existing ? existing.justified : false,
      justificationReason: existing ? existing.justificationReason : '',
      remarks: existing ? existing.remarks : '',
    };
  });

  res.json({
    session: session
      ? {
          id: session.id,
          date: session.date,
          periodOrShift: session.periodOrShift,
          notes: session.notes,
          recordedBy: `${session.recordedBy.name} ${session.recordedBy.lastName} (${session.recordedBy.role})`,
        }
      : null,
    isRecorded: !!session,
    records: studentRecords,
  });
}

export async function saveAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { courseId, date, periodOrShift, notes, records } = req.body;
  const user = req.user!;

  const sessionDate = new Date(date);
  sessionDate.setUTCHours(0, 0, 0, 0);

  // Upsert the session
  const session = await prisma.attendanceSession.upsert({
    where: {
      courseId_date_periodOrShift: {
        courseId,
        date: sessionDate,
        periodOrShift: periodOrShift || 'GENERAL_DIARIA',
      },
    },
    update: {
      recordedById: user.userId,
      notes,
      updatedAt: new Date(),
    },
    create: {
      courseId,
      date: sessionDate,
      periodOrShift: periodOrShift || 'GENERAL_DIARIA',
      recordedById: user.userId,
      notes,
    },
  });

  // Upsert each individual student attendance record
  await prisma.$transaction(
    records.map((r: any) =>
      prisma.attendance.upsert({
        where: {
          attendanceSessionId_studentId: {
            attendanceSessionId: session.id,
            studentId: r.studentId,
          },
        },
        update: {
          status: r.status,
          justified: r.justified || r.status === 'JUSTIFICADO',
          justificationReason: r.justificationReason,
          remarks: r.remarks,
          updatedAt: new Date(),
        },
        create: {
          attendanceSessionId: session.id,
          studentId: r.studentId,
          status: r.status,
          justified: r.justified || r.status === 'JUSTIFICADO',
          justificationReason: r.justificationReason,
          remarks: r.remarks,
        },
      })
    )
  );

  await createAuditLog({
    schoolId: user.schoolId,
    userId: user.userId,
    action: 'REGISTRO_ASISTENCIA',
    entity: 'AttendanceSession',
    entityId: session.id,
    details: { courseId, date: sessionDate, totalStudents: records.length },
  });

  res.json({ message: 'Asistencia guardada exitosamente', sessionId: session.id });
}

export async function getAttendanceStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const { courseId } = req.query;

  const whereCourse: any = { schoolId };
  if (courseId) {
    whereCourse.id = courseId as string;
  }

  const courses = await prisma.course.findMany({
    where: whereCourse,
    include: {
      enrollments: {
        where: { status: 'ACTIVO' },
        include: {
          student: {
            include: {
              user: true,
              attendances: true,
            },
          },
        },
      },
    },
  });

  const studentsWithAlerts: any[] = [];

  courses.forEach((c) => {
    c.enrollments.forEach((e) => {
      const s = e.student;
      const total = s.attendances.length;
      const absences = s.attendances.filter((a) => a.status === 'AUSENTE' && !a.justified).length;
      const late = s.attendances.filter((a) => a.status === 'TARDE').length;
      const rate = total > 0 ? Number((((total - absences) / total) * 100).toFixed(1)) : 100;

      // School threshold: 15 absences is warning threshold
      if (absences >= 10) {
        studentsWithAlerts.push({
          studentId: s.id,
          name: `${s.user.name} ${s.user.lastName}`,
          dni: s.user.dni,
          courseName: c.name,
          absences,
          late,
          attendanceRate: rate,
          critical: absences >= 15,
        });
      }
    });
  });

  res.json({
    studentsWithAlerts: studentsWithAlerts.sort((a, b) => b.absences - a.absences),
  });
}
