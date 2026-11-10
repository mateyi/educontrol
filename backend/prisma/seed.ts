import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de EduControl...');

  // Limpiar datos existentes en orden inverso de claves foráneas
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.guardianStudent.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const teacherPasswordHash = await bcrypt.hash('prof123', 10);
  const studentPasswordHash = await bcrypt.hash('alumno123', 10);
  const parentPasswordHash = await bcrypt.hash('tutor123', 10);

  // 1. Institución Educativa
  const school = await prisma.school.create({
    data: {
      name: 'E.E.S.T. N° 5 "República Argentina"',
      cueCode: '0601523-00',
      address: 'Av. Juan B. Justo 4250, Mar del Plata, Buenos Aires',
      phone: '+54 (223) 472-8890',
      email: 'contacto@eest5mdp.edu.ar',
      passingGrade: 7.0, // Escala de 7 a 10 aprobado, menor a 7 desaprobado
      minAttendancePercentage: 80.0,
      absenceWarningThreshold: 15,
    },
  });

  // 2. Ciclo Lectivo Activo
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      year: 2026,
      name: 'Ciclo Lectivo 2026',
      startDate: new Date('2026-03-01T00:00:00Z'),
      endDate: new Date('2026-12-18T23:59:59Z'),
      isActive: true,
    },
  });

  // 3. Aulas
  const aula101 = await prisma.classroom.create({
    data: { schoolId: school.id, name: 'Aula 101', capacity: 32, building: 'Edificio Central', floor: 'Planta Baja' },
  });
  const labInfo1 = await prisma.classroom.create({
    data: { schoolId: school.id, name: 'Laboratorio de Informática 1', capacity: 30, building: 'Pabellón Tecnológico', floor: '1° Piso' },
  });
  const labCiencias = await prisma.classroom.create({
    data: { schoolId: school.id, name: 'Laboratorio de Ciencias', capacity: 28, building: 'Edificio Central', floor: '1° Piso' },
  });
  const tallerTecnico = await prisma.classroom.create({
    data: { schoolId: school.id, name: 'Taller de Sistemas y Redes', capacity: 26, building: 'Pabellón Tecnológico', floor: 'Planta Baja' },
  });

  // 4. Usuarios Directivos y Administrador
  const adminUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'admin@educontrol.edu.ar',
      password: defaultPasswordHash,
      role: 'ADMINISTRADOR',
      name: 'Facundo',
      lastName: 'Santillán',
      dni: '32456789',
      phone: '+54 11 4455-6677',
      address: 'Av. Rivadavia 2040, CABA',
    },
  });

  const directivo1 = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'directora@educontrol.edu.ar',
      password: defaultPasswordHash,
      role: 'DIRECTIVO',
      name: 'Silvina',
      lastName: 'Rossi',
      dni: '24112345',
      phone: '+54 223 555-0101',
      address: 'Calle Colón 1420, Mar del Plata',
    },
  });

  const directivo2 = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'vicedirector@educontrol.edu.ar',
      password: defaultPasswordHash,
      role: 'DIRECTIVO',
      name: 'Marcelo',
      lastName: 'Ferreyra',
      dni: '25889900',
      phone: '+54 223 555-0102',
      address: 'Calle San Martín 320, Mar del Plata',
    },
  });

  // 5. Preceptores
  const preceptorManana = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'preceptor.manana@educontrol.edu.ar',
      password: defaultPasswordHash,
      role: 'PRECEPTOR',
      name: 'Gustavo',
      lastName: 'Peralta',
      dni: '28334455',
      phone: '+54 223 555-0103',
      address: 'Av. Luro 3100, Mar del Plata',
    },
  });

  const preceptoraTarde = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'preceptora.tarde@educontrol.edu.ar',
      password: defaultPasswordHash,
      role: 'PRECEPTOR',
      name: 'Valeria',
      lastName: 'Gómez',
      dni: '30778899',
      phone: '+54 223 555-0104',
      address: 'Calle Güemes 2450, Mar del Plata',
    },
  });

  // 6. Cursos y Divisiones
  const curso6toInfo = await prisma.course.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: '6° 1° Informática',
      level: 'SECUNDARIO TÉCNICO',
      yearNumber: 6,
      division: '1°',
      shift: 'MAÑANA',
      preceptorId: preceptorManana.id,
    },
  });

  const curso5toInfo = await prisma.course.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: '5° 1° Informática',
      level: 'SECUNDARIO TÉCNICO',
      yearNumber: 5,
      division: '1°',
      shift: 'TARDE',
      preceptorId: preceptoraTarde.id,
    },
  });

  const curso1roA = await prisma.course.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: '1° A Ciclo Básico',
      level: 'SECUNDARIO BÁSICO',
      yearNumber: 1,
      division: 'A',
      shift: 'MAÑANA',
      preceptorId: preceptorManana.id,
    },
  });

  // 7. Materias
  const matMatematica = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Análisis Matemático', code: 'MAT-601', hoursPerWeek: 4 },
  });
  const matProgramacion = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Programación y Algoritmos', code: 'PROG-602', hoursPerWeek: 6 },
  });
  const matLengua = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Literatura', code: 'LIT-603', hoursPerWeek: 3 },
  });
  const matFisica = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Física Aplicada', code: 'FIS-604', hoursPerWeek: 3 },
  });
  const matSistemas = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Sistemas Operativos y Redes', code: 'SIS-605', hoursPerWeek: 4 },
  });

  // 8. Profesores (5 profesores)
  const teacherUsersData = [
    { email: 'prof.matematica@educontrol.edu.ar', name: 'Carlos', lastName: 'Benítez', dni: '27111222', specialty: 'Lic. en Ciencias Matemáticas' },
    { email: 'prof.programacion@educontrol.edu.ar', name: 'Mariana', lastName: 'Solís', dni: '29333444', specialty: 'Ingeniera en Sistemas' },
    { email: 'prof.lengua@educontrol.edu.ar', name: 'Esteban', lastName: 'Morales', dni: '26555666', specialty: 'Prof. en Letras' },
    { email: 'prof.fisica@educontrol.edu.ar', name: 'Lucía', lastName: 'Méndez', dni: '31777888', specialty: 'Lic. en Física' },
    { email: 'prof.sistemas@educontrol.edu.ar', name: 'Federico', lastName: 'Russo', dni: '30999000', specialty: 'Analista de Redes y Telecomunicaciones' },
  ];

  const teachers: any[] = [];
  for (let i = 0; i < teacherUsersData.length; i++) {
    const tData = teacherUsersData[i];
    const u = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: tData.email,
        password: teacherPasswordHash,
        role: 'PROFESOR',
        name: tData.name,
        lastName: tData.lastName,
        dni: tData.dni,
        phone: `+54 223 555-${1000 + i}`,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: u.id,
        fileNumber: `DOC-2026-00${i + 1}`,
        specialty: tData.specialty,
        hireDate: new Date('2022-03-01'),
        active: true,
      },
    });
    teachers.push({ ...teacher, user: u });
  }

  // 9. Asignaciones Docentes (Teacher Assignments) para 6° 1° Informática
  const taMatematica = await prisma.teacherAssignment.create({
    data: {
      teacherId: teachers[0].id,
      subjectId: matMatematica.id,
      courseId: curso6toInfo.id,
      academicYearId: academicYear.id,
    },
  });

  const taProgramacion = await prisma.teacherAssignment.create({
    data: {
      teacherId: teachers[1].id,
      subjectId: matProgramacion.id,
      courseId: curso6toInfo.id,
      academicYearId: academicYear.id,
    },
  });

  const taLengua = await prisma.teacherAssignment.create({
    data: {
      teacherId: teachers[2].id,
      subjectId: matLengua.id,
      courseId: curso6toInfo.id,
      academicYearId: academicYear.id,
    },
  });

  const taFisica = await prisma.teacherAssignment.create({
    data: {
      teacherId: teachers[3].id,
      subjectId: matFisica.id,
      courseId: curso6toInfo.id,
      academicYearId: academicYear.id,
    },
  });

  const taSistemas = await prisma.teacherAssignment.create({
    data: {
      teacherId: teachers[4].id,
      subjectId: matSistemas.id,
      courseId: curso6toInfo.id,
      academicYearId: academicYear.id,
    },
  });

  // 10. Horarios semanales (Sin conflictos)
  // Lunes: 07:45 - 09:45 Matemática (Aula 101), 10:00 - 12:00 Programación (Lab Info 1)
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matMatematica.id, teacherId: teachers[0].id, classroomId: aula101.id, dayOfWeek: 1, startTime: '07:45', endTime: '09:45' },
  });
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matProgramacion.id, teacherId: teachers[1].id, classroomId: labInfo1.id, dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
  });

  // Martes: 07:45 - 09:45 Lengua (Aula 101), 10:00 - 11:30 Física (Lab Ciencias)
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matLengua.id, teacherId: teachers[2].id, classroomId: aula101.id, dayOfWeek: 2, startTime: '07:45', endTime: '09:45' },
  });
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matFisica.id, teacherId: teachers[3].id, classroomId: labCiencias.id, dayOfWeek: 2, startTime: '10:00', endTime: '11:30' },
  });

  // Miércoles: 07:45 - 09:45 Sistemas Operativos (Taller), 10:00 - 12:00 Programación (Lab Info 1)
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matSistemas.id, teacherId: teachers[4].id, classroomId: tallerTecnico.id, dayOfWeek: 3, startTime: '07:45', endTime: '09:45' },
  });
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matProgramacion.id, teacherId: teachers[1].id, classroomId: labInfo1.id, dayOfWeek: 3, startTime: '10:00', endTime: '12:00' },
  });

  // Jueves: 07:45 - 09:45 Matemática (Aula 101), 10:00 - 11:30 Lengua (Aula 101)
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matMatematica.id, teacherId: teachers[0].id, classroomId: aula101.id, dayOfWeek: 4, startTime: '07:45', endTime: '09:45' },
  });
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matLengua.id, teacherId: teachers[2].id, classroomId: aula101.id, dayOfWeek: 4, startTime: '10:00', endTime: '11:30' },
  });

  // Viernes: 08:30 - 10:30 Física (Lab Ciencias), 10:45 - 12:45 Sistemas Operativos (Taller)
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matFisica.id, teacherId: teachers[3].id, classroomId: labCiencias.id, dayOfWeek: 5, startTime: '08:30', endTime: '10:30' },
  });
  await prisma.schedule.create({
    data: { courseId: curso6toInfo.id, subjectId: matSistemas.id, teacherId: teachers[4].id, classroomId: tallerTecnico.id, dayOfWeek: 5, startTime: '10:45', endTime: '12:45' },
  });

  // 11. Tutores
  const tutorUser1 = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'tutor.perez@educontrol.edu.ar',
      password: parentPasswordHash,
      role: 'TUTOR',
      name: 'Roberto',
      lastName: 'Pérez',
      dni: '18555444',
      phone: '+54 223 555-9001',
      address: 'Calle Jujuy 1890, Mar del Plata',
    },
  });
  const guardian1 = await prisma.guardian.create({
    data: { userId: tutorUser1.id, relationship: 'Padre', occupation: 'Contador Público' },
  });

  const tutorUser2 = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'tutora.martinez@educontrol.edu.ar',
      password: parentPasswordHash,
      role: 'TUTOR',
      name: 'Claudia',
      lastName: 'Gómez',
      dni: '19444333',
      phone: '+54 223 555-9002',
      address: 'Av. Paso 2340, Mar del Plata',
    },
  });
  const guardian2 = await prisma.guardian.create({
    data: { userId: tutorUser2.id, relationship: 'Madre', occupation: 'Médica Pediatra' },
  });

  // 12. 30 Alumnos Reales Ficticios (10 en 6° 1°, 10 en 5° 1°, 10 en 1° A)
  const studentsRaw = [
    // 6° 1° Informática
    { name: 'Juan Ignacio', lastName: 'Pérez', dni: '45100001', email: 'juan.perez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-04-12' },
    { name: 'Sofía', lastName: 'Martínez', dni: '45100002', email: 'sofia.martinez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-06-25' },
    { name: 'Agustín', lastName: 'Romero', dni: '45100003', email: 'agustin.romero@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-01-19' },
    { name: 'Camila', lastName: 'Álvarez', dni: '45100004', email: 'camila.alvarez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-09-08' },
    { name: 'Mateo', lastName: 'Díaz', dni: '45100005', email: 'mateo.diaz@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-11-03' },
    { name: 'Valentina', lastName: 'Sosa', dni: '45100006', email: 'valentina.sosa@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-02-14' },
    { name: 'Lucas', lastName: 'Fernández', dni: '45100007', email: 'lucas.fernandez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-08-30' },
    { name: 'Martina', lastName: 'Morales', dni: '45100008', email: 'martina.morales@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-05-17' },
    { name: 'Joaquín', lastName: 'Benítez', dni: '45100009', email: 'joaquin.benitez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-07-22' },
    { name: 'Julieta', lastName: 'Gómez', dni: '45100010', email: 'julieta.gomez@alumno.educontrol.edu.ar', course: curso6toInfo, birth: '2008-12-05' },

    // 5° 1° Informática
    { name: 'Nicolás', lastName: 'Castro', dni: '46200001', email: 'nicolas.castro@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-03-10' },
    { name: 'Candela', lastName: 'Ruiz', dni: '46200002', email: 'candela.ruiz@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-05-18' },
    { name: 'Tomás', lastName: 'Herrera', dni: '46200003', email: 'tomas.herrera@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-07-04' },
    { name: 'Abril', lastName: 'Medina', dni: '46200004', email: 'abril.medina@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-09-12' },
    { name: 'Facundo', lastName: 'Vargas', dni: '46200005', email: 'facundo.vargas@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-10-21' },
    { name: 'Florencia', lastName: 'Silva', dni: '46200006', email: 'florencia.silva@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-01-30' },
    { name: 'Bruno', lastName: 'Navarro', dni: '46200007', email: 'bruno.navarro@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-04-14' },
    { name: 'Delfina', lastName: 'Rojas', dni: '46200008', email: 'delfina.rojas@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-08-27' },
    { name: 'Santiago', lastName: 'Gil', dni: '46200009', email: 'santiago.gil@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-11-15' },
    { name: 'Malena', lastName: 'Vidal', dni: '46200010', email: 'malena.vidal@alumno.educontrol.edu.ar', course: curso5toInfo, birth: '2009-06-02' },

    // 1° A Ciclo Básico
    { name: 'Lautaro', lastName: 'Vega', dni: '50300001', email: 'lautaro.vega@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-02-11' },
    { name: 'Morena', lastName: 'Godoy', dni: '50300002', email: 'morena.godoy@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-04-05' },
    { name: 'Benjamín', lastName: 'Cabrera', dni: '50300003', email: 'benjamin.cabrera@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-05-20' },
    { name: 'Milagros', lastName: 'Ríos', dni: '50300004', email: 'milagros.rios@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-07-16' },
    { name: 'Thiago', lastName: 'Ponce', dni: '50300005', email: 'thiago.ponce@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-09-09' },
    { name: 'Zoe', lastName: 'Miranda', dni: '50300006', email: 'zoe.miranda@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-10-31' },
    { name: 'Santino', lastName: 'Acosta', dni: '50300007', email: 'santino.acosta@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-12-14' },
    { name: 'Victoria', lastName: 'Núñez', dni: '50300008', email: 'victoria.nunez@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-03-28' },
    { name: 'Enzo', lastName: 'Luna', dni: '50300009', email: 'enzo.luna@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-06-07' },
    { name: 'Mía', lastName: 'Paredes', dni: '50300010', email: 'mia.paredes@alumno.educontrol.edu.ar', course: curso1roA, birth: '2013-08-19' },
  ];

  const createdStudents: any[] = [];
  for (let i = 0; i < studentsRaw.length; i++) {
    const s = studentsRaw[i];
    const u = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: s.email,
        password: studentPasswordHash,
        role: 'ALUMNO',
        name: s.name,
        lastName: s.lastName,
        dni: s.dni,
        phone: `+54 223 600-${1000 + i}`,
        address: `Calle Ficticia ${100 + i * 15}`,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: u.id,
        fileNumber: `LEG-2026-${String(i + 1).padStart(4, '0')}`,
        birthDate: new Date(s.birth),
        entryYear: 2026 - (s.course.yearNumber - 1),
        status: 'REGULAR',
        emergencyContact: 'Tutor a cargo',
        emergencyPhone: '+54 223 555-9999',
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: s.course.id,
        academicYearId: academicYear.id,
        status: 'ACTIVO',
      },
    });

    createdStudents.push({ ...student, user: u, course: s.course });
  }

  // Vincular tutores a alumnos
  // Roberto Pérez es tutor de Juan Ignacio Pérez (alumno 0)
  await prisma.guardianStudent.create({
    data: {
      guardianId: guardian1.id,
      studentId: createdStudents[0].id,
      relationshipType: 'Padre',
      isPrimaryContact: true,
    },
  });

  // Claudia Gómez es tutora de Sofía Martínez (alumno 1)
  await prisma.guardianStudent.create({
    data: {
      guardianId: guardian2.id,
      studentId: createdStudents[1].id,
      relationshipType: 'Madre',
      isPrimaryContact: true,
    },
  });

  // 13. Evaluaciones y Calificaciones
  // Evaluaciones en 6° 1° Informática
  const evalProg1 = await prisma.assessment.create({
    data: {
      teacherAssignmentId: taProgramacion.id,
      title: 'Parcial 1 - Estructuras de Datos y POO',
      type: 'EXAMEN',
      period: '1° Trimestre',
      date: new Date('2026-04-15'),
      maxScore: 10.0,
      passingScore: 7.0, // Aprobado >= 7
      weight: 1.0,
    },
  });

  const evalProg2 = await prisma.assessment.create({
    data: {
      teacherAssignmentId: taProgramacion.id,
      title: 'TP Integrador - Arquitectura Full Stack',
      type: 'TRABAJO_PRACTICO',
      period: '1° Trimestre',
      date: new Date('2026-05-20'),
      maxScore: 10.0,
      passingScore: 7.0,
      weight: 1.5,
    },
  });

  const evalMat1 = await prisma.assessment.create({
    data: {
      teacherAssignmentId: taMatematica.id,
      title: 'Evaluación de Límites y Continuidad',
      type: 'EXAMEN',
      period: '1° Trimestre',
      date: new Date('2026-04-22'),
      maxScore: 10.0,
      passingScore: 7.0,
      weight: 1.0,
    },
  });

  const evalLengua1 = await prisma.assessment.create({
    data: {
      teacherAssignmentId: taLengua.id,
      title: 'Análisis Literario: El Aleph de Borges',
      type: 'TRABAJO_PRACTICO',
      period: '1° Trimestre',
      date: new Date('2026-05-08'),
      maxScore: 10.0,
      passingScore: 7.0,
      weight: 1.0,
    },
  });

  // Calificaciones para alumnos de 6° 1° (primeros 10 alumnos)
  const students6to = createdStudents.slice(0, 10);
  const sampleScoresEval1 = [9.5, 8.0, 7.0, 6.0, 10.0, 7.5, 8.5, 5.0, 9.0, 7.0];
  const sampleScoresEval2 = [9.0, 8.5, 7.5, 7.0, 9.5, 8.0, 7.0, 6.5, 8.5, 7.5];
  const sampleScoresMat = [8.0, 9.0, 6.5, 7.0, 9.0, 7.0, 8.0, 6.0, 8.5, 7.0];
  const sampleScoresLengua = [10.0, 9.0, 8.0, 7.5, 9.0, 8.5, 7.0, 7.5, 9.0, 8.0];

  for (let i = 0; i < students6to.length; i++) {
    const st = students6to[i];
    await prisma.grade.create({
      data: {
        assessmentId: evalProg1.id,
        studentId: st.id,
        teacherId: teachers[1].id,
        score: sampleScoresEval1[i],
        observations: sampleScoresEval1[i] >= 7.0 ? 'Excelente dominio conceptual.' : 'Reforzar complejidad algorítmica.',
      },
    });

    await prisma.grade.create({
      data: {
        assessmentId: evalProg2.id,
        studentId: st.id,
        teacherId: teachers[1].id,
        score: sampleScoresEval2[i],
        observations: 'Buen trabajo en equipo y arquitectura modular.',
      },
    });

    await prisma.grade.create({
      data: {
        assessmentId: evalMat1.id,
        studentId: st.id,
        teacherId: teachers[0].id,
        score: sampleScoresMat[i],
        observations: sampleScoresMat[i] >= 7.0 ? 'Aprobado.' : 'Intensificación de derivadas y asíntotas requerida.',
      },
    });

    await prisma.grade.create({
      data: {
        assessmentId: evalLengua1.id,
        studentId: st.id,
        teacherId: teachers[2].id,
        score: sampleScoresLengua[i],
        observations: 'Muy buen análisis contextual.',
      },
    });
  }

  // 14. Asistencias (Simulación de varias fechas)
  const dates = [
    new Date('2026-05-18T00:00:00Z'),
    new Date('2026-05-19T00:00:00Z'),
    new Date('2026-05-20T00:00:00Z'),
    new Date('2026-05-21T00:00:00Z'),
    new Date('2026-05-22T00:00:00Z'),
  ];

  for (const d of dates) {
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: curso6toInfo.id,
        recordedById: preceptorManana.id,
        date: d,
        periodOrShift: 'GENERAL_DIARIA',
        notes: 'Jornada escolar regular sin novedades extraordinarias.',
      },
    });

    for (let i = 0; i < students6to.length; i++) {
      const st = students6to[i];
      let status = 'PRESENTE';
      let justified = false;
      let justificationReason = null;

      // Generar ausencias realistas: Alumno 3 (Camila Álvarez) y Alumno 7 (Martina Morales)
      if (i === 3 && d.getDay() === 2) {
        status = 'AUSENTE';
        justified = true;
        justificationReason = 'Certificado médico por odontología presentado.';
      } else if (i === 7 && d.getDay() === 4) {
        status = 'AUSENTE';
        justified = false;
      } else if (i === 5 && d.getDay() === 3) {
        status = 'TARDE';
      }

      await prisma.attendance.create({
        data: {
          attendanceSessionId: session.id,
          studentId: st.id,
          status,
          justified,
          justificationReason,
        },
      });
    }
  }

  // 15. Tareas (Assignments) y Entregas (Submissions)
  const tareaPOO = await prisma.assignment.create({
    data: {
      teacherAssignmentId: taProgramacion.id,
      title: 'Práctica de Arquitectura REST en Express y TypeScript',
      description: 'Implementar endpoints protegidos por JWT, validación con Zod y persistencia con Prisma.',
      dueDate: new Date('2026-06-15T23:59:59Z'),
      maxScore: 10.0,
      attachments: JSON.stringify([{ name: 'consignas-tp.pdf', url: 'https://example.com/docs/consigna.pdf' }]),
    },
  });

  // Entregas de estudiantes
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: tareaPOO.id,
      studentId: students6to[0].id, // Juan Ignacio Pérez
      content: 'Repositorio GitHub con la implementación completa y tests pasando: https://github.com/juanperez/educontrol-tp',
      status: 'CORREGIDO',
      score: 10.0,
      feedback: 'Impecable arquitectura y cobertura de pruebas unitarias. Felicitaciones.',
      gradedAt: new Date(),
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: tareaPOO.id,
      studentId: students6to[1].id, // Sofía Martínez
      content: 'Entrega en archivo ZIP y reporte técnico en PDF adjunto.',
      status: 'CORREGIDO',
      score: 9.0,
      feedback: 'Muy buen código. Revisar el manejo de errores en endpoints secundarios.',
      gradedAt: new Date(),
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: tareaPOO.id,
      studentId: students6to[2].id, // Agustín Romero
      content: 'Adjunto link al despliegue en Vercel y backend en Railway.',
      status: 'ENTREGADO',
    },
  });

  // 16. Comunicados y Anuncios Institucionales
  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      authorId: directivo1.id,
      title: 'Reunión Informativa para Tutores de 6° Año - Prácticas Profesionalizantes',
      content: 'Se convoca a las familias a la reunión presencial el próximo viernes a las 18:00 hs en el SUM institucional para coordinar los convenios de pasantías técnicas.',
      targetAudience: 'TODOS',
      isImportant: true,
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      authorId: preceptorManana.id,
      title: 'Recordatorio: Presentación de Fichas Médicas de Educación Física',
      content: 'Aquellos alumnos que aún adeuden la ficha de aptitud física deben entregarla antes del 30 de mayo a la preceptoría del turno mañana.',
      targetAudience: 'ALUMNOS',
      isImportant: false,
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      authorId: teachers[1].userId,
      title: 'Muestra Anual de Proyectos de Software y Robótica 2026',
      content: 'Los equipos de 6° Informática presentarán sus sistemas de gestión escolar y proyectos tecnológicos ante el jurado provincial.',
      targetAudience: 'TODOS',
      isImportant: true,
    },
  });

  // 17. Notificaciones para Juan Ignacio Pérez
  await prisma.notification.create({
    data: {
      userId: students6to[0].userId,
      title: 'Nueva calificación publicada',
      message: 'La profesora Mariana Solís cargó tu nota en TP Integrador: 9.0 (Aprobado).',
      type: 'CALIFICACION',
      link: '/grades',
    },
  });

  await prisma.notification.create({
    data: {
      userId: students6to[0].userId,
      title: 'Nueva tarea asignada',
      message: 'Se publicó una nueva tarea en Programación y Algoritmos.',
      type: 'TAREA',
      link: '/assignments',
    },
  });

  // 18. Registro de Auditoría Inicial
  await prisma.auditLog.create({
    data: {
      schoolId: school.id,
      userId: adminUser.id,
      action: 'INICIALIZACION_SISTEMA',
      entity: 'School',
      entityId: school.id,
      details: JSON.stringify({ cueCode: '0601523-00', cycle: '2026' }),
    },
  });

  console.log('✅ Seed completado con éxito!');
  console.log('Credenciales de demostración:');
  console.log(' - Administrador: admin@educontrol.edu.ar / admin123');
  console.log(' - Directivo:     directora@educontrol.edu.ar / admin123');
  console.log(' - Preceptor:     preceptor.manana@educontrol.edu.ar / admin123');
  console.log(' - Profesor:      prof.programacion@educontrol.edu.ar / prof123');
  console.log(' - Alumno:        juan.perez@alumno.educontrol.edu.ar / alumno123');
  console.log(' - Tutor:         tutor.perez@educontrol.edu.ar / tutor123');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
