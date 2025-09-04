import app from './app-formations.js';

console.log('🚀 Iniciando servidor de formaciones (versión simplificada)...');

try {
  const PORT = parseInt(process.env.PORT || '3001');
  
  console.log(`🔌 Intentando escuchar en puerto ${PORT}`);
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log('🎯 API de formaciones disponible en:');
    console.log(`   - GET    http://localhost:${PORT}/api/formations`);
    console.log(`   - POST   http://localhost:${PORT}/api/formations`);
    console.log(`   - GET    http://localhost:${PORT}/api/formations/:id`);
    console.log(`   - PUT    http://localhost:${PORT}/api/formations/:id`);
    console.log(`   - DELETE http://localhost:${PORT}/api/formations/:id`);
    console.log(`   - GET    http://localhost:${PORT}/api/formations/:id/details`);
    console.log(`   - GET    http://localhost:${PORT}/api/formations/:id/positions`);
    console.log(`   - POST   http://localhost:${PORT}/api/formations/:id/positions`);
    console.log(`   - GET    http://localhost:${PORT}/health`);
    console.log('🌟 Servidor listo para recibir peticiones');
  });

  server.on('error', (err: any) => {
    console.error('❌ Error en servidor:', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Error al inicializar servidor:', error);
  process.exit(1);
}
