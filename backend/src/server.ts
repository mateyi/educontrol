import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor EduControl iniciado con éxito`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

