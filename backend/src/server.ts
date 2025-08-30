import app from './app.js';

console.log('Iniciando servidor principal...');

try {
  const PORT = process.env.PORT || 3001;
  
  console.log(`Intentando escuchar en puerto ${PORT}`);
  
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Servidor listo para recibir peticiones');
  });

  server.on('error', (err) => {
    console.error('Error en servidor:', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('Excepción no capturada:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    process.exit(1);
  });

} catch (error) {
  console.error('Error al inicializar servidor:', error);
  process.exit(1);
}
