# 11. Diccionario de Datos del Modelo Relacional

A continuación se detallan las principales tablas y sus atributos clave:

### 1. `School`
- `id` (UUID, PK): Identificador único de la institución.
- `name` (String): Nombre oficial de la escuela (ej. E.E.S.T. N° 5).
- `cueCode` (String, Unique): Código Único de Establecimiento educativo.
- `passingGrade` (Float, Default 7.0): Nota umbral de aprobación.
- `minAttendancePercentage` (Float, Default 80.0): Asistencia mínima requerida.
- `absenceWarningThreshold` (Int, Default 15): Límite de inasistencias para alerta.

### 2. `User`
- `id` (UUID, PK): Identificador de cuenta de usuario.
- `schoolId` (UUID, FK -> School.id): Institución de pertenencia.
- `email` (String, Unique): Correo electrónico institucional.
- `password` (String): Contraseña hasheada mediante Bcrypt (salt rounds 10).
- `role` (Enum/String): `ADMINISTRADOR`, `DIRECTIVO`, `PRECEPTOR`, `PROFESOR`, `ALUMNO`, `TUTOR`.
- `dni` (String, Unique): Documento Nacional de Identidad.

### 3. `Assessment` & `Grade`
- `Assessment.id` (UUID, PK)
- `Assessment.teacherAssignmentId` (UUID, FK -> TeacherAssignment.id)
- `Assessment.period` (String): '1° Trimestre', '2° Trimestre', '3° Trimestre'.
- `Assessment.passingScore` (Float): Fijado en 7.0 según normativa.
- `Grade.id` (UUID, PK)
- `Grade.score` (Float): Calificación entre 1.0 y 10.0.
- `Grade.studentId` (UUID, FK -> Student.id)

### 4. `AttendanceSession` & `Attendance`
- `AttendanceSession.id` (UUID, PK)
- `AttendanceSession.courseId` (UUID, FK -> Course.id)
- `AttendanceSession.date` (DateTime): Fecha normalizada a medianoche UTC.
- `Attendance.status` (String): `PRESENTE`, `AUSENTE`, `TARDE`, `JUSTIFICADO`.
- `Attendance.justified` (Boolean): Si la falta cuenta con constancia médica.
