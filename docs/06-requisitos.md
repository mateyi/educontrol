# 06. Requisitos Funcionales y No Funcionales

## Requisitos Funcionales (RF)

| Código | Requisito Funcional |
| :--- | :--- |
| **RF-01** | El sistema debe permitir el inicio de sesión mediante correo y contraseña encriptada con Bcrypt. |
| **RF-02** | El sistema debe diferenciar 6 roles: Administrador, Directivo, Preceptor, Profesor, Alumno y Tutor. |
| **RF-03** | El sistema debe validar que un alumno solo acceda a sus propias calificaciones y asistencias. |
| **RF-04** | El sistema debe permitir al profesor cargar calificaciones del 1 al 10 en evaluaciones trimestrales. |
| **RF-05** | El sistema debe considerar la nota 7.0 como umbral de aprobación; notas de 1 a 6.9 se marcarán como "Desaprobado / En proceso". |
| **RF-06** | El sistema debe permitir al preceptor registrar presentismo diario por curso con estados: Presente, Ausente, Tarde, Justificado. |
| **RF-07** | El sistema debe emitir una alerta visual cuando un alumno alcance 10 y 15 inasistencias injustificadas. |
| **RF-08** | El sistema debe impedir la carga de dos clases simultáneas para el mismo docente o la misma aula física. |
| **RF-09** | El sistema debe permitir a los alumnos enviar entregas de tareas y a los profesores calificarlas y dejar devoluciones. |
| **RF-10** | El sistema debe generar un boletín de calificaciones con desglose trimestral y promedio final. |
| **RF-11** | El sistema debe registrar en auditoría la fecha, hora, usuario y acción de cada cambio sensible. |

## Requisitos No Funcionales (RNF)

| Código | Requisito No Funcional |
| :--- | :--- |
| **RNF-01** | **Seguridad:** Autenticación stateless mediante JWT con expiración de 7 días y cabeceras seguras con Helmet. |
| **RNF-02** | **Rendimiento:** Tiempos de respuesta menores a 200 ms en endpoints de consulta habitual. |
| **RNF-03** | **Compatibilidad:** Interfaz responsiva operable en dispositivos móviles y de escritorio. |
| **RNF-04** | **Usabilidad:** Modo claro y oscuro intercambiable sin recargar la página. |
| **RNF-05** | **Localización:** Fechas en formato DD/MM/AAAA y huso horario de Argentina (GMT-3). |

