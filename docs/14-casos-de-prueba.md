# 14. Matriz de Casos de Prueba (QA)

| ID | Módulo | Caso de Prueba | Entrada | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-01** | Auth | Login con credenciales válidas de Administrador | `admin@educontrol.edu.ar` / `admin123` | HTTP 200, JWT generado, rol `ADMINISTRADOR` | **PASS** |
| **CP-02** | Auth | Login con contraseña incorrecta | `admin@educontrol.edu.ar` / `badpass` | HTTP 401, mensaje de credenciales inválidas | **PASS** |
| **CP-03** | RBAC | Alumno intenta acceder a ruta `/api/admin/users` | Token de Alumno | HTTP 403 Forbidden | **PASS** |
| **CP-04** | Calificaciones | Nota mayor o igual a 7.0 | Score: `8.5` | Clasificada como `Aprobado = true` | **PASS** |
| **CP-05** | Calificaciones | Nota menor a 7.0 | Score: `5.0` | Clasificada como `Aprobado = false` | **PASS** |
| **CP-06** | Asistencia | Guardar presentismo con fecha duplicada | Misma fecha y curso | Upsert seguro sin registros duplicados | **PASS** |
| **CP-07** | Horarios | Choque horario de profesor en el mismo horario | Mismo docente, Lunes 07:45 - 09:45 | HTTP 409 Conflicto con detalle de la materia | **PASS** |
| **CP-08** | Horarios | Choque de aula física | Misma aula ocupada en mismo día y hora | HTTP 409 Conflicto con detalle del aula | **PASS** |
| **CP-09** | Tareas | Alumno realiza entrega digital | Content o enlace | Estado pasa a `ENTREGADO` | **PASS** |
| **CP-10** | Tareas | Profesor califica y deja feedback | Score: 9.0, Feedback: "Excelente" | Estado pasa a `CORREGIDO` | **PASS** |
