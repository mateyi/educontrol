# 13. Documentación de API REST

Todos los endpoints (salvo `/api/auth/login` y `/api/health`) requieren la cabecera:
`Authorization: Bearer <JWT_TOKEN>`

### 1. Autenticación
- `POST /api/auth/login`: Inicia sesión con `email` y `password`. Devuelve `token` y objeto `user`.
- `GET /api/auth/me`: Retorna los datos del usuario autenticado.

### 2. Alumnos y Legajos
- `GET /api/students`: Retorna lista paginada y filtrable de alumnos.
- `GET /api/students/:id`: Retorna el legajo completo del alumno con su historial académico y asistencias.
- `POST /api/students`: Inscribe un nuevo alumno con usuario, DNI y legajo.
- `PUT /api/students/:id`: Actualiza datos personales y curso.
- `DELETE /api/students/:id`: Baja lógica del alumno.

### 3. Calificaciones y Boletín
- `GET /api/grades/assessments`: Lista evaluaciones por curso, materia y período.
- `POST /api/grades/assessments`: Crea una nueva evaluación con `passingScore` (7.0).
- `POST /api/grades/save`: Guarda calificaciones numéricas en lote (escala 1 a 10).
- `GET /api/grades/report-card/:studentId`: Retorna el boletín digital completo con promedios trimestrales y estado de aprobación.

### 4. Asistencia
- `GET /api/attendance`: Obtiene la planilla de asistencia por curso y fecha.
- `POST /api/attendance`: Guarda el parte diario de asistencia (Presente, Ausente, Tarde, Justificado).
- `GET /api/attendance/stats`: Lista de alerta de alumnos con 10 o más inasistencias.

### 5. Horarios
- `GET /api/schedules`: Retorna la grilla semanal por curso o docente.
- `POST /api/schedules`: Asigna un módulo horario con chequeo automático de solapamientos (conflicto 409).
