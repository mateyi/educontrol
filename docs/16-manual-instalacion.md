# 16. Manual de Instalación Local y Despliegue en Producción

## 1. Requisitos Previos
- Node.js versión 20 o superior.
- Git.

## 2. Puesta en Marcha Local en 3 Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/educontrol-school-management.git
cd educontrol-school-management

# 2. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 3. Inicializar base de datos y seed de demostración
cd ../backend
npx prisma generate
npx prisma db push
npm run prisma:seed

# 4. Iniciar Backend y Frontend en paralelo
# Terminal 1 (Backend):
cd backend && npm run dev
# Terminal 2 (Frontend):
cd frontend && npm run dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:4000/api`.

---

## 3. Despliegue en Producción

### Frontend en Vercel:
1. Conectar el repositorio de GitHub en Vercel.
2. Root Directory: `frontend`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Variables de entorno: `VITE_API_URL=https://educontrol-backend.up.railway.app/api`.

### Backend en Railway / Render:
1. Root Directory: `backend`.
2. Build Command: `npm install && npx prisma generate && npm run build`.
3. Start Command: `npm start`.
4. Variables de entorno:
   - `DATABASE_URL`: Conexión de PostgreSQL (Neon o Railway Postgres).
   - `JWT_SECRET`: Clave secreta robusta.
   - `NODE_ENV`: `production`.

