# 07. Casos de Uso del Sistema

## Diagrama de Casos de Uso (Mermaid)

```mermaid
flowchart LR
    subgraph Actores
        Admin((Administrador))
        Directivo((Directivo))
        Preceptor((Preceptor))
        Profesor((Profesor))
        Alumno((Alumno))
        Tutor((Tutor))
    end

    subgraph "Módulo Académico"
        CU1["Gestionar Cursos y Materias"]
        CU2["Cargar Calificaciones (1-10)"]
        CU3["Consultar Boletín de Notas"]
        CU4["Calcular Promedio y Estado (>= 7)"]
    end

    subgraph "Módulo Asistencia"
        CU5["Registrar Presentismo Diario"]
        CU6["Justificar Inasistencia"]
        CU7["Ver Alerta de Faltas (>= 15)"]
    end

    subgraph "Módulo Horarios y Tareas"
        CU8["Asignar Horario sin Conflictos"]
        CU9["Crear y Calificar Tareas"]
        CU10["Entregar Trabajo Práctico"]
    end

    Admin --> CU1
    Admin --> CU8
    Directivo --> CU1
    Directivo --> CU3
    Directivo --> CU7

    Preceptor --> CU5
    Preceptor --> CU6
    Preceptor --> CU7

    Profesor --> CU2
    Profesor --> CU4
    Profesor --> CU9

    Alumno --> CU3
    Alumno --> CU10

    Tutor --> CU3
    Tutor --> CU7
```

## Descripción de Casos de Uso Clave

### CU-02: Cargar Calificaciones
- **Actor Principal:** Profesor.
- **Precondición:** El docente debe tener la materia y curso asignados en el ciclo lectivo activo.
- **Flujo Principal:**
  1. El profesor selecciona Curso, Materia y Período (1°, 2° o 3° Trimestre).
  2. Crea o selecciona una Evaluación (Parcial, TP, Oral).
  3. Ingresa la calificación de cada alumno en escala de 1.0 a 10.0.
  4. El sistema valida que el valor sea numérico entre 1 y 10.
  5. El sistema calcula si la nota es &ge; 7.0 (Aprobado) o &lt; 7.0 (Desaprobado).
  6. El profesor confirma el guardado y se registra en la auditoría del sistema.

### CU-08: Asignar Horario con Detección de Conflictos
- **Actor Principal:** Administrador / Directivo.
- **Flujo Principal:**
  1. Selecciona curso, materia, docente, aula, día de la semana y rango de horas.
  2. El sistema comprueba si el docente ya tiene otra clase en ese horario.
  3. El sistema comprueba si el aula física ya está ocupada en ese horario.
  4. Si existe solapamiento, rechaza la operación con código HTTP 409 y mensaje explícito.
  5. Si no hay conflicto, persiste el horario en la base de datos.
