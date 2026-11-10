# 09. Arquitectura del Sistema

EduControl adopta un patrón arquitectónico desacoplado en tres capas (Three-Tier Architecture), asegurando alta cohesión, bajo acoplamiento y facilidad de escalado horizontal.

## Diagrama de Arquitectura de Capas (Mermaid)

```mermaid
flowchart TD
    subgraph Cliente ["Capa de Presentación (Frontend SPA)"]
        UI["React 18 + Vite + Tailwind CSS"]
        Router["React Router v6"]
        Query["TanStack Query / Cache"]
        Contexts["Auth Context (RBAC) + Theme Context"]
    end

    subgraph API ["Capa de Servicios de Aplicación (Backend Node.js)"]
        ExpressApp["Express.js HTTP Server"]
        SecurityMW["Helmet + CORS + Morgan"]
        AuthMW["JWT Auth & Role-Based Guard (RBAC)"]
        ValMW["Zod Schemas Validation"]
        Controllers["Controllers (Grades, Attendance, Schedule, Students)"]
    end

    subgraph Datos ["Capa de Persistencia de Datos"]
        PrismaORM["Prisma Client ORM"]
        DB[(PostgreSQL / SQLite Database)]
        AuditStore[(AuditLog)]
    end

    UI --> Router
    Router --> Contexts
    Contexts --> Query
    Query -->|"HTTP / REST / JSON (Bearer Token)"| SecurityMW
    SecurityMW --> AuthMW
    AuthMW --> ValMW
    ValMW --> Controllers
    Controllers --> PrismaORM
    PrismaORM --> DB
    PrismaORM --> AuditStore
```

## Flujo de Seguridad y Autorización
1. El usuario envía credenciales a `/api/auth/login`.
2. El servidor compara el hash con `bcrypt.compare`.
3. Se firma un token JWT conteniendo `userId`, `role`, `schoolId`, y `email`.
4. En cada petición posterior, el middleware `authenticate` verifica la firma criptográfica y `authorize(...roles)` restringe el acceso al endpoint.

