import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createAssignmentSchema = z.object({
  body: z.object({
    teacherAssignmentId: z.string(),
    title: z.string().min(2, 'Título de tarea requerido'),
    description: z.string().min(5, 'Descripción requerida'),
    dueDate: z.string(),
    maxScore: z.number().default(10.0),
    attachments: z.string().optional(),
  }),
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    assignmentId: z.string(),
    content: z.string().optional(),
    fileUrl: z.string().optional(),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    submissionId: z.string(),
    score: z.number().min(1).max(10),
    feedback: z.string().optional(),
    status: z.enum(['CORREGIDO', 'REENTREGA']),
  }),
});

export async function getAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { courseId, subjectId } = req.query;
  const user = req.user!;

  const where: any = {};
  if (courseId || subjectId) {
    where.teacherAssignment = {};
    if (courseId) where.teacherAssignment.courseId = courseId as string;
    if (subjectId) where.teacherAssignment.subjectId = subjectId as string;
  }

  // If student, find studentId and attach their submission status
  let studentId: string | null = null;
  if (user.role === 'ALUMNO') {
    const s = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (s) studentId = s.id;
  }

  const assignments = await prisma.assignment.findMany({
    where,
    include: {
      teacherAssignment: {
        include: {
          course: true,
          subject: true,
          teacher: { include: { user: { select: { name: true, lastName: true } } } },
        },
      },
      submissions: {
        include: {
          student: {
            include: { user: { select: { name: true, lastName: true, dni: true } } },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  res.json({
    data: assignments.map((a) => {
      const mySubmission = studentId ? a.submissions.find((sub) => sub.studentId === studentId) : null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxScore: a.maxScore,
        attachments: a.attachments,
        courseName: a.teacherAssignment.course.name,
        subjectName: a.teacherAssignment.subject.name,
        teacherName: `${a.teacherAssignment.teacher.user.name} ${a.teacherAssignment.teacher.user.lastName}`,
        totalSubmissions: a.submissions.length,
        mySubmission: mySubmission
          ? {
              id: mySubmission.id,
              status: mySubmission.status,
              score: mySubmission.score,
              feedback: mySubmission.feedback,
              submittedAt: mySubmission.submittedAt,
              content: mySubmission.content,
            }
          : null,
        submissions: user.role === 'PROFESOR' || user.role === 'ADMINISTRADOR'
          ? a.submissions.map((sub) => ({
              id: sub.id,
              studentId: sub.studentId,
              studentName: `${sub.student.user.lastName}, ${sub.student.user.name}`,
              dni: sub.student.user.dni,
              status: sub.status,
              score: sub.score,
              feedback: sub.feedback,
              submittedAt: sub.submittedAt,
              content: sub.content,
            }))
          : [],
      };
    }),
  });
}

export async function createAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const data = req.body;

  const assignment = await prisma.assignment.create({
    data: {
      teacherAssignmentId: data.teacherAssignmentId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      maxScore: data.maxScore || 10.0,
      attachments: data.attachments,
    },
  });

  res.status(201).json({ message: 'Tarea creada con éxito', assignment });
}

export async function submitAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { assignmentId, content, fileUrl } = req.body;
  const user = req.user!;

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    res.status(404).json({ error: 'Perfil de alumno no encontrado' });
    return;
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: student.id,
      },
    },
    update: {
      content,
      fileUrl,
      status: 'ENTREGADO',
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      studentId: student.id,
      content,
      fileUrl,
      status: 'ENTREGADO',
    },
  });

  res.json({ message: 'Tarea entregada con éxito', submission });
}

export async function gradeSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { submissionId, score, feedback, status } = req.body;

  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback,
      status,
      gradedAt: new Date(),
    },
  });

  res.json({ message: 'Calificación de tarea guardada con éxito', submission });
}

