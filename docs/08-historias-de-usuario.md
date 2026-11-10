# 08. Historias de Usuario

### HU-01: Visualización del Boletín de Calificaciones
> **Como** alumno o tutor  
> **Quiero** consultar las calificaciones del trimestre y el promedio final  
> **Para** conocer mi rendimiento académico y saber si aprobé la asignatura.

**Criterios de Aceptación:**
- Debe mostrar las notas divididas en 1°, 2° y 3° Trimestre.
- Si el promedio es igual o superior a 7.0, debe figurar la etiqueta verde "Aprobado".
- Si el promedio es inferior a 7.0, debe figurar la etiqueta roja "Desaprobado / En proceso".
- El alumno solo puede visualizar su propio boletín.

---

### HU-02: Registro Rápido de Asistencia Diaria
> **Como** preceptor  
> **Quiero** tomar asistencia en un solo clic por curso y fecha  
> **Para** registrar el presentismo diario sin demoras burocráticas.

**Criterios de Aceptación:**
- Botón "Todos Presentes" para cargar el curso completo rápidamente.
- Estados configurables: Presente, Ausente, Tarde, Justificado.
- Posibilidad de ingresar número de certificado médico o motivo para inasistencias justificadas.
- Evitar duplicados si se guarda más de una vez en el mismo día.

---

### HU-03: Alerta de Inasistencias Acumuladas
> **Como** directivo o preceptor  
> **Quiero** visualizar una lista de alumnos en riesgo de perder la regularidad  
> **Para** citar a sus familias antes de que alcancen el límite de 15 o 20 faltas.

**Criterios de Aceptación:**
- Alerta amarilla preventiva a las 10 inasistencias.
- Alerta roja crítica a las 15 inasistencias.
- Desglose de faltas justificadas vs injustificadas.

---

### HU-04: Prevención de Superposición de Aulas y Profesores
> **Como** administrador  
> **Quiero** que el sistema impida asignar dos clases simultáneas al mismo profesor o aula  
> **Para** evitar choques de horarios en el laboratorio o taller.

**Criterios de Aceptación:**
- Valida solapamiento de minutos entre la hora de inicio y fin.
- Emite un mensaje descriptivo indicando qué materia, aula o docente está en conflicto.

