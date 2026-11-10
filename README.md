# EduControl — Sistema Integral de Gestión Escolar

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)

> **Trabajo Final Integrador para la materia Laboratorio de Software — Educación Secundaria Técnica de Argentina.**

EduControl es una plataforma web Full Stack moderna, profesional y lista para producción diseñada para digitalizar de forma integral la gestión académica, el presentismo escolar, las calificaciones y la comunicación de las escuelas secundarias y técnicas de la República Argentina.

---

## 🎯 Características Principales

- **Diseño SaaS Premium:** Inspirado en Linear, Vercel y Notion, con soporte nativo para **Modo Oscuro** y **Modo Claro**, diseño responsive y tipografía Inter.
- **Régimen de Evaluación Argentino:**
  - Calificaciones numéricas en escala de **1 a 10**.
  - **Nota de aprobación reglamentaria: 7.0 puntos** (7 a 10 Aprobado, menor a 7 Desaprobado / En proceso).
  - Desglose por **1°, 2° y 3° Trimestre**.
  - **Boletín Digital Oficial** con promedio final por asignatura y GPA institucional con opción de impresión.
- **Control de Asistencia & Alerta Temprana:**
  - Estados: `Presente`, `Ausente`, `Tarde`, `Justificado`.
  - Botón de carga rápida "Todos Presentes".
  - **Umbral de Alerta de Inasistencias:** Detección automática y advertencia preventiva para estudiantes que alcanzan **10 o 15 faltas** (riesgo de pérdida de regularidad).
- **Grilla Horaria Inteligente:**
  - Matriz semanal con asignación de cursos, materias, profesores y aulas.
  - **Detección automática de conflictos:** Impide que un docente o un aula física (ej. laboratorio o taller) tengan dos clases superpuestas.
- **Plataforma Pedagógica de Tareas:**
  - Publicación de actividades y trabajos prácticos con fecha límite.
  - Entrega digital estudiantil (enlaces de repositorio, archivos o texto).
  - Corrección docente con nota y retroalimentación pedagógica.
- **Control de Acceso Basado en Roles (RBAC):**
  - Validación de permisos en Frontend y protección estricta en los endpoints de la API Backend.
  - 6 roles diferenciados: **Administrador**, **Directivo**, **Preceptor**, **Profesor**, **Alumno** y **Tutor**.
- **Registro de Auditoría de Seguridad:**
  - Historial de todas las operaciones sensibles (inicio de sesión, carga de notas, asistencias, altas y bajas).

---

## 👥 Credenciales de Demostración (Acceso en 1 Clic)

En la pantalla de inicio de sesión (`/login`) se dispone de un selector rápido para ingresar inmediatamente con cualquiera de los 6 roles:

| Rol | Usuario / Cargo | Correo Electrónico | Contraseña |
| :--- | :--- | :--- | :--- |
| **ADMINISTRADOR** | Facundo Santillán (Acceso total) | `admin@educontrol.edu.ar` | `admin123` |
| **DIRECTIVO** | Lic. Silvina Rossi (Directora) | `directora@educontrol.edu.ar` | `admin123` |
| **PRECEPTOR** | Gustavo Peralta (Turno Mañana) | `preceptor.manana@educontrol.edu.ar` | `admin123` |
| **PROFESOR** | Ing. Mariana Solís (Programación) | `prof.programacion@educontrol.edu.ar` | `prof123` |
| **ALUMNO** | Juan Ignacio Pérez (6° 1° Informática) | `juan.perez@alumno.educontrol.edu.ar` | `alumno123` |
| **TUTOR** | Roberto Pérez (Padre de Juan) | `tutor.perez@educontrol.edu.ar` | `tutor123` |

---

## 🏗️ Arquitectura y Tecnologías

### Frontend
- **Framework:** React 18 con TypeScript y Vite.
- **Estilos:** Tailwind CSS con paleta azul pizarra corporativa.
- **Iconografía:** Lucide React.
- **Gráficos:** Recharts (curvas de presentismo y distribución de notas).
- **Navegación:** React Router v6.
- **Gestión de Estado:** Context API + TanStack Query.

### Backend
- **Entorno:** Node.js + Express en TypeScript.
- **Arquitectura:** API REST modular y desacoplada en tres capas.
- **Seguridad:** JWT (JSON Web Tokens), Bcrypt para hash de claves, Helmet y CORS configurado.
- **Validaciones:** Zod en todos los cuerpos y parámetros de solicitud.

### Base de Datos
- **ORM:** Prisma ORM.
- **Soporte Dual:** SQLite para ejecución local inmediata sin configuración, y PostgreSQL para despliegue en la nube (Railway / Neon).
- **Semilla (Seed):** Escuela ficticia completa ("E.E.S.T. N° 5"), 30 alumnos, 5 docentes, horarios, calificaciones, asistencias y comunicados.

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el proyecto
```bash
git clone https://github.com/ortiz-dev/educontrol-school-management.git
cd educontrol-school-management
```

### 2. Instalar dependencias
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Inicializar Base de Datos y Seed
```bash
cd ../backend
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Iniciar Aplicación
- **Backend:** `cd backend && npm run dev` (Disponible en `http://localhost:4000/api`)
- **Frontend:** `cd frontend && npm run dev` (Disponible en `http://localhost:5173`)

---

## 🧪 Pruebas Automatizadas

```bash
# Pruebas Backend (11 tests unitarios y de integración)
cd backend && npm test

# Pruebas Frontend (Vitest & Testing Library)
cd frontend && npm test
```

---

## 📚 Documentación para Laboratorio de Software

En la carpeta [`/docs`](docs/README.md) se encuentra la carpeta pedagógica completa con:
1. Introducción y Fundamentación.
2. Problemática que resuelve y Alcance.
3. Requisitos Funcionales y No Funcionales.
4. Diagrama de Casos de Uso (Mermaid).
5. Historias de Usuario con Criterios de Aceptación.
6. Arquitectura del Sistema (Mermaid).
7. Diagrama Entidad-Relación (Mermaid ER).
8. Diccionario de Datos del Modelo Relacional.
9. Diagrama de Componentes.
10. Documentación Completa de la API REST.
11. Matriz de Casos de Prueba (QA).
12. Manual de Usuario y Manual de Despliegue.

---

## 📄 Licencia
Este proyecto fue desarrollado con fines educativos para la materia Laboratorio de Software bajo la licencia MIT.

