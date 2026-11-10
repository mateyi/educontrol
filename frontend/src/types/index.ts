export type UserRole =
  | 'ADMINISTRADOR'
  | 'DIRECTIVO'
  | 'PRECEPTOR'
  | 'PROFESOR'
  | 'ALUMNO'
  | 'TUTOR';

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  dni?: string;
  school?: {
    id: string;
    name: string;
    cueCode: string;
    passingGrade: number;
    minAttendancePercentage: number;
  };
  studentProfile?: any;
  teacherProfile?: any;
  guardianProfile?: any;
}

export interface Student {
  id: string;
  userId: string;
  fileNumber: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone?: string;
  birthDate: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status: 'REGULAR' | 'LIBRE' | 'EGRESADO' | 'TRASLADADO';
  entryYear: number;
  course?: {
    id: string;
    name: string;
    division: string;
    shift: string;
  } | null;
  guardians?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    relationship?: string;
    isPrimary: boolean;
  }[];
}

export interface Teacher {
  id: string;
  userId: string;
  fileNumber: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone?: string;
  specialty?: string;
  active: boolean;
  assignments: {
    id: string;
    subjectId: string;
    subjectName: string;
    courseId: string;
    courseName: string;
  }[];
  schedulesCount: number;
}

export interface Course {
  id: string;
  name: string;
  level: string;
  yearNumber: number;
  division: string;
  shift: 'MAÑANA' | 'TARDE' | 'VESPERTINO' | 'JORNADA_COMPLETA';
  preceptor?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  } | null;
  studentCount: number;
  subjectsCount: number;
  students?: {
    enrollmentId: string;
    studentId: string;
    fileNumber: string;
    name: string;
    lastName: string;
    dni: string;
    email: string;
    status: string;
  }[];
  subjects?: {
    assignmentId: string;
    subjectId: string;
    name: string;
    code: string;
    teacherName: string;
  }[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  hoursPerWeek: number;
  assignments: {
    id: string;
    courseId: string;
    courseName: string;
    teacherName: string;
  }[];
}

export interface Assessment {
  id: string;
  title: string;
  type: 'EXAMEN' | 'TRABAJO_PRACTICO' | 'ORAL' | 'RECUPERATORIO';
  period: '1° Trimestre' | '2° Trimestre' | '3° Trimestre';
  date: string;
  maxScore: number;
  passingScore: number;
  weight: number;
  courseName: string;
  courseId: string;
  subjectName: string;
  subjectId: string;
  teacherName: string;
  stats: {
    totalGrades: number;
    averageScore: number | null;
    passedCount: number;
    failedCount: number;
  };
  grades: {
    gradeId: string;
    studentId: string;
    studentName: string;
    dni: string;
    score: number;
    approved: boolean;
    observations?: string;
  }[];
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  course?: { name: string };
  subjectId: string;
  subject?: { name: string; code: string };
  teacherId: string;
  teacher?: { user: { name: string; lastName: string } };
  classroomId: string;
  classroom?: { name: string; building?: string };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  attachments?: string;
  courseName: string;
  subjectName: string;
  teacherName: string;
  totalSubmissions: number;
  mySubmission?: {
    id: string;
    status: string;
    score?: number;
    feedback?: string;
    submittedAt: string;
    content?: string;
  } | null;
  submissions?: {
    id: string;
    studentId: string;
    studentName: string;
    dni: string;
    status: string;
    score?: number;
    feedback?: string;
    submittedAt: string;
    content?: string;
  }[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'TODOS' | 'PROFESORES' | 'ALUMNOS' | 'TUTORES' | 'CURSO';
  course?: { name: string } | null;
  author: { name: string; lastName: string; role?: string };
  isImportant: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

