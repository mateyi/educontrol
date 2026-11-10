export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  DIRECTIVO: 'DIRECTIVO',
  PRECEPTOR: 'PRECEPTOR',
  PROFESOR: 'PROFESOR',
  ALUMNO: 'ALUMNO',
  TUTOR: 'TUTOR',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  schoolId: string;
  name: string;
  lastName: string;
}

export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'JUSTIFICADO';

export type AssessmentPeriod = '1° Trimestre' | '2° Trimestre' | '3° Trimestre';

export type AssessmentType = 'EXAMEN' | 'TRABAJO_PRACTICO' | 'ORAL' | 'RECUPERATORIO';

export type ShiftType = 'MAÑANA' | 'TARDE' | 'VESPERTINO' | 'JORNADA_COMPLETA';
