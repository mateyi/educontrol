import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('EduControl Backend API Tests', () => {
  let adminToken = '';
  let studentToken = '';
  let teacherToken = '';

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.appName).toBe('EduControl API');
  });

  describe('Autenticación y RBAC', () => {
    it('POST /api/auth/login with valid admin credentials returns token and user data', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@educontrol.edu.ar', password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMINISTRADOR');
      adminToken = res.body.token;
    });

    it('POST /api/auth/login with invalid credentials returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@educontrol.edu.ar', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('POST /api/auth/login for student returns token and student profile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'juan.perez@alumno.educontrol.edu.ar', password: 'alumno123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ALUMNO');
      studentToken = res.body.token;
    });

    it('POST /api/auth/login for teacher returns token and teacher role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'prof.programacion@educontrol.edu.ar', password: 'prof123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('PROFESOR');
      teacherToken = res.body.token;
    });

    it('Protected route /api/admin/users rejects access without token', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('Protected route /api/admin/users rejects ALUMNO with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('Protected route /api/admin/users allows ADMINISTRADOR', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Módulo de Calificaciones y Boletín', () => {
    it('GET /api/grades/assessments returns assessments and calculates passing grades (>= 7)', async () => {
      const res = await request(app)
        .get('/api/grades/assessments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstAssessment = res.body.data[0];
      expect(firstAssessment.passingScore).toBe(7.0);
      expect(firstAssessment.stats).toBeDefined();
      expect(firstAssessment.grades).toBeDefined();
    });

    it('GET /api/grades/report-card/:studentId returns report card with trimesters and average', async () => {
      // Get student id for Juan Perez
      const studentsRes = await request(app)
        .get('/api/students?search=Juan')
        .set('Authorization', `Bearer ${adminToken}`);

      const studentId = studentsRes.body.data[0].id;

      const reportRes = await request(app)
        .get(`/api/grades/report-card/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(reportRes.status).toBe(200);
      expect(reportRes.body.student).toBeDefined();
      expect(reportRes.body.overallAverage).toBeGreaterThan(0);
      expect(reportRes.body.subjectsReport).toBeDefined();
      expect(reportRes.body.attendanceSummary).toBeDefined();
    });
  });

  describe('Detección de Conflictos de Horario', () => {
    it('Fails when startTime is greater or equal to endTime', async () => {
      const res = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: 'dummy-id',
          subjectId: 'dummy-sub',
          teacherId: 'dummy-teach',
          classroomId: 'dummy-room',
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '08:00',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('anterior');
    });
  });
});
