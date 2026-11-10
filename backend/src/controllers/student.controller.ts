import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/password';
import { createAuditLog } from '../utils/audit';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
    email: z.string().email('Email inválido'),
    birthDate: z.string(), // ISO date string
    fileNumber: z.string().optional(), // Legajo
    address: z.string().optional(),
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    entryYear: z.number().optional(),
    courseId: z.string().optional(),
    password: z.string().min(6).optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    dni: z.string().min(7).optional(),
    email: z.string().email().optional(),
    birthDate: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    status: z.enum(['REGULAR', 'LIBRE', 'EGRESADO', 'TRASLADADO']).optional(),
    courseId: z.string().optional(),
  }),
});

export async function getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const { search, courseId, status, page = '1', limit = '15' } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const take = parseInt(limit as string, 10) || 15;
  const skip = (pageNum - 1) * take;

  const where: any = {
    user: {
      schoolId,
      active: true,
    },
  };

  if (status) {
    where.status = status as string;
  }

  if (courseId) {
    where.enrollments = {
      some: {
        courseId: courseId as string,
        status: 'ACTIVO',
      },
    };
  }

  if (search) {
    const q = (search as string).trim();
    where.OR = [
      { user: { name: { contains: q } } },
      { user: { lastName: { contains: q } } },
      { user: { dni: { contains: q } } },
      { fileNumber: { contains: q } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take,
      orderBy: { user: { lastName: 'asc' } },
      include: {
        user: { select: { id: true, name: true, lastName: true, dni: true, email: true, phone: true, avatar: true } },
        enrollments: {
          where: { status: 'ACTIVO' },
          include: { course: true },
        },
        guardianLinks: {
          include: {
            guardian: {
              include: { user: { select: { name: true, lastName: true, phone: true, email: true } } },
            },
          },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({
    data: students.map((s) => ({
      id: s.id,
      userId: s.userId,
      fileNumber: s.fileNumber,
      name: s.user.name,
      lastName: s.user.lastName,
      dni: s.user.dni,
      email: s.user.email,
      phone: s.phone || s.user.phone,
      birthDate: s.birthDate,
      address: s.address,
      emergencyContact: s.emergencyContact,
      emergencyPhone: s.emergencyPhone,
      status: s.status,
      entryYear: s.entryYear,
      course: s.enrollments[0]?.course || null,
      guardians: s.guardianLinks.map((g) => ({
        id: g.guardian.id,
        name: `${g.guardian.user.name} ${g.guardian.user.lastName}`,
        phone: g.guardian.user.phone,
        email: g.guardian.user.email,
        relationship: g.relationshipType || g.guardian.relationship,
        isPrimary: g.isPrimaryContact,
      })),
    })),
    meta: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
}

export async function getStudentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  // Authorization checks: Alumno can only view their own student profile unless admin/directivo/preceptor/profesor
  if (req.user!.role === 'ALUMNO') {
    const studentUser = await prisma.student.findUnique({ where: { id } });
    if (!studentUser || studentUser.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Acceso no autorizado al legajo' });
      return;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      enrollments: {
        include: {
          course: {
            include: {
              schedules: { include: { subject: true, teacher: { include: { user: true } }, classroom: true } },
            },
          },
        },
      },
      guardianLinks: {
        include: {
          guardian: {
            include: { user: true },
          },
        },
      },
      grades: {
        include: {
          assessment: {
            include: {
              teacherAssignment: { include: { subject: true } },
            },
          },
        },
        orderBy: { gradedAt: 'desc' },
      },
      attendances: {
        include: {
          attendanceSession: true,
        },
        orderBy: { attendanceSession: { date: 'desc' } },
      },
    },
  });

  if (!student || student.user.schoolId !== schoolId) {
    res.status(404).json({ error: 'Alumno no encontrado' });
    return;
  }

  // Calculate academic stats
  const totalGrades = student.grades.length;
  const avgGrade = totalGrades > 0
    ? Number((student.grades.reduce((sum, g) => sum + g.score, 0) / totalGrades).toFixed(2))
    : 0;
  const passedGrades = student.grades.filter((g) => g.score >= 7.0).length;

  // Calculate attendance stats
  const totalSessions = student.attendances.length;
  const presentCount = student.attendances.filter((a) => a.status === 'PRESENTE').length;
  const absentCount = student.attendances.filter((a) => a.status === 'AUSENTE').length;
  const lateCount = student.attendances.filter((a) => a.status === 'TARDE').length;
  const justifiedCount = student.attendances.filter((a) => a.justified || a.status === 'JUSTIFICADO').length;
  const attendanceRate = totalSessions > 0
    ? Number((((presentCount + lateCount) / totalSessions) * 100).toFixed(1))
    : 100;

  res.json({
    student: {
      id: student.id,
      userId: student.userId,
      fileNumber: student.fileNumber,
      name: student.user.name,
      lastName: student.user.lastName,
      dni: student.user.dni,
      email: student.user.email,
      phone: student.phone || student.user.phone,
      address: student.address || student.user.address,
      birthDate: student.birthDate,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      status: student.status,
      entryYear: student.entryYear,
      avatar: student.user.avatar,
      currentCourse: student.enrollments[0]?.course || null,
      guardians: student.guardianLinks.map((g) => ({
        id: g.guardian.id,
        name: `${g.guardian.user.name} ${g.guardian.user.lastName}`,
        phone: g.guardian.user.phone,
        email: g.guardian.user.email,
        relationship: g.relationshipType || g.guardian.relationship,
        isPrimary: g.isPrimaryContact,
      })),
      stats: {
        averageGrade: avgGrade,
        passedGradesCount: passedGrades,
        totalGradesCount: totalGrades,
        attendanceRate,
        absentCount,
        lateCount,
        justifiedCount,
        warningThresholdReached: absentCount >= 15,
      },
      grades: student.grades,
      attendances: student.attendances,
    },
  });
}

export async function createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  // Verify unique DNI / email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ dni: data.dni }, { email: data.email.toLowerCase() }],
    },
  });

  if (existingUser) {
    res.status(400).json({ error: 'Ya existe un usuario con este DNI o correo electrónico' });
    return;
  }

  const hashedPassword = await hashPassword(data.password || data.dni); // Default password is DNI
  const fileNumber = data.fileNumber || `LEG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Find active academic year
  const activeYear = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
  });

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'ALUMNO',
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        phone: data.phone,
        address: data.address,
      },
    });

    const newStudent = await tx.student.create({
      data: {
        userId: user.id,
        fileNumber,
        birthDate: new Date(data.birthDate),
        address: data.address,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        entryYear: data.entryYear || new Date().getFullYear(),
        status: 'REGULAR',
      },
    });

    if (data.courseId && activeYear) {
      await tx.enrollment.create({
        data: {
          studentId: newStudent.id,
          courseId: data.courseId,
          academicYearId: activeYear.id,
          status: 'ACTIVO',
        },
      });
    }

    return newStudent;
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'CREAR_ALUMNO',
    entity: 'Student',
    entityId: student.id,
    details: { name: `${data.name} ${data.lastName}`, fileNumber },
  });

  res.status(201).json({
    message: 'Alumno registrado exitosamente',
    student,
  });
}

export async function updateStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student || student.user.schoolId !== schoolId) {
    res.status(404).json({ error: 'Alumno no encontrado' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: student.userId },
      data: {
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        email: data.email?.toLowerCase(),
        phone: data.phone,
        address: data.address,
      },
    });

    await tx.student.update({
      where: { id },
      data: {
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        address: data.address,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        status: data.status,
      },
    });

    if (data.courseId) {
      const activeYear = await tx.academicYear.findFirst({
        where: { schoolId, isActive: true },
      });
      if (activeYear) {
        // Update or create active enrollment
        const existingEnrollment = await tx.enrollment.findFirst({
          where: { studentId: id, academicYearId: activeYear.id },
        });

        if (existingEnrollment) {
          await tx.enrollment.update({
            where: { id: existingEnrollment.id },
            data: { courseId: data.courseId },
          });
        } else {
          await tx.enrollment.create({
            data: {
              studentId: id,
              courseId: data.courseId,
              academicYearId: activeYear.id,
              status: 'ACTIVO',
            },
          });
        }
      }
    }
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'MODIFICAR_ALUMNO',
    entity: 'Student',
    entityId: id,
    details: data,
  });

  res.json({ message: 'Alumno actualizado exitosamente' });
}

export async function deleteStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student || student.user.schoolId !== schoolId) {
    res.status(404).json({ error: 'Alumno no encontrado' });
    return;
  }

  // Baja lógica (deactivate user and set status to TRASLADADO / INACTIVO)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.userId },
      data: { active: false },
    }),
    prisma.student.update({
      where: { id },
      data: { status: 'TRASLADADO' },
    }),
  ]);

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'BAJA_ALUMNO',
    entity: 'Student',
    entityId: id,
    details: { name: `${student.user.name} ${student.user.lastName}` },
  });

  res.json({ message: 'Alumno dado de baja correctamente' });
}
