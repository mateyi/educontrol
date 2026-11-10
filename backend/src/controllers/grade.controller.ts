import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const createAssessmentSchema = z.object({
  body: z.object({
    teacherAssignmentId: z.string(),
    title: z.string().min(2, 'Título de evaluación requerido'),
    type: z.enum(['EXAMEN', 'TRABAJO_PRACTICO', 'ORAL', 'RECUPERATORIO']),
    period: z.enum(['1° Trimestre', '2° Trimestre', '3° Trimestre']),
    date: z.string(),
    maxScore: z.number().default(10.0),
    passingScore: z.number().default(7.0),
    weight: z.number().default(1.0),
  }),
});

export const saveGradesSchema = z.object({
  body: z.object({
    assessmentId: z.string(),
    grades: z.array(
      z.object({
        studentId: z.string(),
        score: z.number().min(1).max(10),
        observations: z.string().optional().nullable(),
      })
    ),
  }),
});

export async function getAssessments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { courseId, subjectId, period } = req.query;
  const user = req.user!;

  const where: any = {};

  if (period) {
    where.period = period as string;
  }

  if (courseId || subjectId) {
    where.teacherAssignment = {};
    if (courseId) where.teacherAssignment.courseId = courseId as string;
    if (subjectId) where.teacherAssignment.subjectId = subjectId as string;
  }

  // If user is PROFESOR, restrict to assignments assigned to them
  if (user.role === 'PROFESOR') {
    const teacher = await prisma.teacher.findUnique({ where: { userId: user.userId } });
    if (teacher) {
      where.teacherAssignment = {
        ...where.teacherAssignment,
        teacherId: teacher.id,
      };
    }
  }

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      teacherAssignment: {
        include: {
          subject: true,
          course: true,
          teacher: { include: { user: { select: { name: true, lastName: true } } } },
        },
      },
      grades: {
        include: {
          student: {
            include: { user: { select: { name: true, lastName: true, dni: true } } },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  res.json({
    data: assessments.map((a) => {
      const totalGrades = a.grades.length;
      const averageScore = totalGrades > 0
        ? Number((a.grades.reduce((sum, g) => sum + g.score, 0) / totalGrades).toFixed(2))
        : null;
      const passedCount = a.grades.filter((g) => g.score >= a.passingScore).length;

      return {
        id: a.id,
        title: a.title,
        type: a.type,
        period: a.period,
        date: a.date,
        maxScore: a.maxScore,
        passingScore: a.passingScore,
        weight: a.weight,
        courseName: a.teacherAssignment.course.name,
        courseId: a.teacherAssignment.courseId,
        subjectName: a.teacherAssignment.subject.name,
        subjectId: a.teacherAssignment.subjectId,
        teacherName: `${a.teacherAssignment.teacher.user.name} ${a.teacherAssignment.teacher.user.lastName}`,
        stats: {
          totalGrades,
          averageScore,
          passedCount,
          failedCount: totalGrades - passedCount,
        },
        grades: a.grades.map((g) => ({
          gradeId: g.id,
          studentId: g.studentId,
          studentName: `${g.student.user.lastName}, ${g.student.user.name}`,
          dni: g.student.user.dni,
          score: g.score,
          approved: g.score >= a.passingScore,
          observations: g.observations,
        })),
      };
    }),
  });
}

export async function createAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const data = req.body;

  const assessment = await prisma.assessment.create({
    data: {
      teacherAssignmentId: data.teacherAssignmentId,
      title: data.title,
      type: data.type,
      period: data.period,
      date: new Date(data.date),
      maxScore: data.maxScore,
      passingScore: 7.0, // Regla institucional: 7.0
      weight: data.weight,
    },
  });

  await createAuditLog({
    schoolId: req.user!.schoolId,
    userId: req.user!.userId,
    action: 'CREAR_EVALUACION',
    entity: 'Assessment',
    entityId: assessment.id,
    details: { title: data.title, period: data.period },
  });

  res.status(201).json({ message: 'Evaluación creada correctamente', assessment });
}

export async function saveGrades(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { assessmentId, grades } = req.body;
  const user = req.user!;

  const teacher = user.role === 'PROFESOR'
    ? await prisma.teacher.findUnique({ where: { userId: user.userId } })
    : null;

  await prisma.$transaction(
    grades.map((g: { studentId: string; score: number; observations?: string }) =>
      prisma.grade.upsert({
        where: {
          assessmentId_studentId: {
            assessmentId,
            studentId: g.studentId,
          },
        },
        update: {
          score: g.score,
          observations: g.observations,
          teacherId: teacher?.id,
          updatedAt: new Date(),
        },
        create: {
          assessmentId,
          studentId: g.studentId,
          score: g.score,
          observations: g.observations,
          teacherId: teacher?.id,
        },
      })
    )
  );

  await createAuditLog({
    schoolId: user.schoolId,
    userId: user.userId,
    action: 'CARGA_CALIFICACIONES',
    entity: 'Grade',
    details: { assessmentId, totalLoaded: grades.length },
  });

  res.json({ message: 'Calificaciones registradas correctamente' });
}

// Boletín de calificaciones del alumno
export async function getStudentReportCard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { studentId } = req.params;
  const user = req.user!;

  // Verify access for Alumno or Tutor
  if (user.role === 'ALUMNO') {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.userId !== user.userId) {
      res.status(403).json({ error: 'No autorizado para ver este boletín' });
      return;
    }
  } else if (user.role === 'TUTOR') {
    const guardian = await prisma.guardian.findUnique({ where: { userId: user.userId } });
    const link = await prisma.guardianStudent.findFirst({
      where: { guardianId: guardian?.id, studentId },
    });
    if (!link) {
      res.status(403).json({ error: 'No autorizado para ver el boletín de este alumno' });
      return;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      enrollments: {
        where: { status: 'ACTIVO' },
        include: {
          course: {
            include: {
              school: true,
              teacherAssignments: {
                include: {
                  subject: true,
                  teacher: { include: { user: true } },
                  assessments: {
                    include: {
                      grades: {
                        where: { studentId },
                      },
                    },
                    orderBy: { date: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
      attendances: {
        include: { attendanceSession: true },
      },
    },
  });

  if (!student) {
    res.status(404).json({ error: 'Alumno no encontrado' });
    return;
  }

  const course = student.enrollments[0]?.course;
  if (!course) {
    res.status(400).json({ error: 'El alumno no tiene un curso activo' });
    return;
  }

  const passingThreshold = course.school.passingGrade || 7.0;

  // Build subject breakdown by trimester
  const periods = ['1° Trimestre', '2° Trimestre', '3° Trimestre'];

  const subjectsReport = course.teacherAssignments.map((ta) => {
    const subjectGrades = ta.assessments.flatMap((a) => a.grades);
    const periodBreakdown = periods.map((period) => {
      const periodAssessments = ta.assessments.filter((a) => a.period === period);
      const gradesInPeriod = periodAssessments.flatMap((a) =>
        a.grades.map((g) => ({ assessmentTitle: a.title, score: g.score, date: a.date }))
      );

      const avg = gradesInPeriod.length > 0
        ? Number((gradesInPeriod.reduce((sum, g) => sum + g.score, 0) / gradesInPeriod.length).toFixed(1))
        : null;

      return {
        period,
        grades: gradesInPeriod,
        periodAverage: avg,
        isApproved: avg !== null ? avg >= passingThreshold : null,
      };
    });

    const validAverages = periodBreakdown.map((p) => p.periodAverage).filter((avg): avg is number => avg !== null);
    const finalSubjectAverage = validAverages.length > 0
      ? Number((validAverages.reduce((s, a) => s + a, 0) / validAverages.length).toFixed(1))
      : null;

    return {
      subjectId: ta.subject.id,
      subjectName: ta.subject.name,
      teacherName: `${ta.teacher.user.name} ${ta.teacher.user.lastName}`,
      hoursPerWeek: ta.subject.hoursPerWeek,
      periods: periodBreakdown,
      finalAverage: finalSubjectAverage,
      status: finalSubjectAverage !== null
        ? finalSubjectAverage >= passingThreshold
          ? 'APROBADO'
          : 'EN_PROCESO'
        : 'SIN_CALIFICACION',
    };
  });

  // Calculate overall GPA
  const finalAvgs = subjectsReport
    .map((s) => s.finalAverage)
    .filter((a): a is number => a !== null);
  const overallAverage = finalAvgs.length > 0
    ? Number((finalAvgs.reduce((sum, a) => sum + a, 0) / finalAvgs.length).toFixed(2))
    : 0;

  // Attendance summary
  const totalAttendances = student.attendances.length;
  const absences = student.attendances.filter((a) => a.status === 'AUSENTE').length;
  const justified = student.attendances.filter((a) => a.justified || a.status === 'JUSTIFICADO').length;
  const attendanceRate = totalAttendances > 0
    ? Number((((totalAttendances - absences) / totalAttendances) * 100).toFixed(1))
    : 100;

  res.json({
    institution: {
      name: course.school.name,
      cueCode: course.school.cueCode,
      passingGrade: passingThreshold,
    },
    student: {
      id: student.id,
      fileNumber: student.fileNumber,
      name: `${student.user.name} ${student.user.lastName}`,
      dni: student.user.dni,
      course: course.name,
      division: course.division,
      shift: course.shift,
    },
    overallAverage,
    academicStatus: overallAverage >= passingThreshold ? 'REGULAR / APROBADO' : 'EN RECUPERACIÓN / INTENSIFICACIÓN',
    attendanceSummary: {
      totalAttendances,
      absences,
      justified,
      attendanceRate,
    },
    subjectsReport,
  });
}

