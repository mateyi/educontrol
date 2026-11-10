import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/password';
import { createAuditLog } from '../utils/audit';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    dni: z.string().min(7),
    role: z.enum(['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR', 'ALUMNO', 'TUTOR']),
    password: z.string().min(6).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateSchoolSettingsSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    cueCode: z.string().min(5),
    address: z.string().min(3),
    phone: z.string(),
    email: z.string().email(),
    passingGrade: z.number().min(1).max(10),
    minAttendancePercentage: z.number().min(50).max(100),
    absenceWarningThreshold: z.number().min(5).max(30),
  }),
});

export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const { role, search } = req.query;

  const where: any = { schoolId };
  if (role) where.role = role as string;
  if (search) {
    const q = (search as string).trim();
    where.OR = [
      { name: { contains: q } },
      { lastName: { contains: q } },
      { dni: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      lastName: true,
      dni: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: users });
}

export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ dni: data.dni }, { email: data.email.toLowerCase() }] },
  });

  if (existing) {
    res.status(400).json({ error: 'Ya existe un usuario con este DNI o correo electrónico' });
    return;
  }

  const hashedPassword = await hashPassword(data.password || data.dni);

  const user = await prisma.user.create({
    data: {
      schoolId,
      name: data.name,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      dni: data.dni,
      role: data.role,
      password: hashedPassword,
      phone: data.phone,
      address: data.address,
    },
  });

  // Create corresponding role profile if needed
  if (data.role === 'PROFESOR') {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        fileNumber: `DOC-${Date.now().toString().slice(-4)}`,
      },
    });
  } else if (data.role === 'TUTOR') {
    await prisma.guardian.create({
      data: {
        userId: user.id,
      },
    });
  }

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'CREAR_USUARIO',
    entity: 'User',
    entityId: user.id,
    details: { name: `${user.name} ${user.lastName}`, role: user.role },
  });

  res.status(201).json({ message: 'Usuario creado exitosamente', user });
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schoolId = req.user!.schoolId;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.schoolId !== schoolId) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: updated.active ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
    entity: 'User',
    entityId: id,
  });

  res.json({ message: `Usuario ${updated.active ? 'activado' : 'desactivado'} exitosamente` });
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;

  const logs = await prisma.auditLog.findMany({
    where: { schoolId },
    include: {
      user: { select: { name: true, lastName: true, role: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json({ data: logs });
}

export async function getSchoolSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      academicYears: { orderBy: { year: 'desc' } },
    },
  });

  if (!school) {
    res.status(404).json({ error: 'Institución no encontrada' });
    return;
  }

  res.json({ school });
}

export async function updateSchoolSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  const schoolId = req.user!.schoolId;
  const data = req.body;

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: {
      name: data.name,
      cueCode: data.cueCode,
      address: data.address,
      phone: data.phone,
      email: data.email,
      passingGrade: data.passingGrade,
      minAttendancePercentage: data.minAttendancePercentage,
      absenceWarningThreshold: data.absenceWarningThreshold,
    },
  });

  await createAuditLog({
    schoolId,
    userId: req.user!.userId,
    action: 'MODIFICAR_CONFIGURACION_INSTITUCIONAL',
    entity: 'School',
    entityId: schoolId,
    details: data,
  });

  res.json({ message: 'Configuración institucional actualizada', school });
}

