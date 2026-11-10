import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      school: true,
      studentProfile: {
        include: {
          enrollments: {
            where: { status: 'ACTIVO' },
            include: { course: true },
          },
        },
      },
      teacherProfile: true,
      guardianProfile: {
        include: {
          students: {
            include: {
              student: {
                include: {
                  user: true,
                  enrollments: {
                    where: { status: 'ACTIVO' },
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.active) {
    res.status(401).json({ error: 'Credenciales inválidas o cuenta desactivada.' });
    return;
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Credenciales inválidas o cuenta desactivada.' });
    return;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role as any,
    schoolId: user.schoolId,
    name: user.name,
    lastName: user.lastName,
  });

  await createAuditLog({
    schoolId: user.schoolId,
    userId: user.id,
    action: 'INICIO_SESION',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  res.json({
    message: 'Inicio de sesión exitoso',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      school: {
        id: user.school.id,
        name: user.school.name,
        cueCode: user.school.cueCode,
        passingGrade: user.school.passingGrade,
        minAttendancePercentage: user.school.minAttendancePercentage,
      },
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
      guardianProfile: user.guardianProfile,
    },
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      school: true,
      studentProfile: {
        include: {
          enrollments: {
            where: { status: 'ACTIVO' },
            include: { course: true },
          },
        },
      },
      teacherProfile: true,
      guardianProfile: {
        include: {
          students: {
            include: {
              student: {
                include: {
                  user: true,
                  enrollments: {
                    where: { status: 'ACTIVO' },
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.active) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
}

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  }),
});

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    res.status(400).json({ error: 'La contraseña actual no es correcta' });
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await createAuditLog({
    schoolId: user.schoolId,
    userId: user.id,
    action: 'CAMBIO_CONTRASENA',
    entity: 'User',
    entityId: user.id,
  });

  res.json({ message: 'Contraseña actualizada con éxito' });
}
