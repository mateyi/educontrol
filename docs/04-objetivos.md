# 04. Objetivos del Proyecto

## Objetivo General
Diseñar, desarrollar, probar y desplegar un sistema integral de gestión escolar web Full Stack (EduControl) que optimice la administración académica, el control de presentismo, la carga de calificaciones y la comunicación institucional de una escuela secundaria técnica argentina.

## Objetivos Específicos
1. Desarrollar una API REST robusta en **Node.js, Express y TypeScript** con validación mediante **Zod** y persistencia ORM con **Prisma**.
2. Diseñar una base de datos relacional normalizada capaz de gestionar ciclos lectivos, cursos, divisiones, materias, asignaciones docentes, legajos y auditoría.
3. Implementar autenticación segura basada en **JSON Web Tokens (JWT)** y control de acceso basado en roles (**RBAC**) para 6 tipos de usuario.
4. Construir una interfaz moderna, accesible y minimalista en **React y Tailwind CSS**, inspirada en los estándares de productos SaaS líderes como Linear y Vercel.
5. Automatizar el cálculo de promedios trimestrales, el estado de aprobación (umbral &ge; 7) y la generación de boletines digitales oficiales.
6. Incorporar un motor de detección de conflictos de horarios para profesores y aulas.
7. Implementar un módulo de tareas y trabajos prácticos con entrega y corrección digital.
8. Garantizar la confiabilidad del sistema mediante una suite de pruebas unitarias, de integración y end-to-end con **Vitest** y **Playwright**.

