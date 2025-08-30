import express from 'express';

console.log('Iniciando servidor de prueba...');

try {
  const app = express();
  console.log('Express app creada');
  
  app.use(express.json());
  console.log('Middleware json configurado');

  app.get('/', (req, res) => {
    console.log('Recibida petición GET /');
    res.send('Test server funcionando');
  });

  app.get('/test', (req, res) => {
    console.log('Recibida petición GET /test');
    res.json({ message: 'Test endpoint funcionando' });
  });

  const PORT = process.env.PORT || 3002;
  console.log(`Intentando escuchar en puerto ${PORT}`);

  const server = app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);
    console.log('Servidor listo para recibir peticiones');
  });

  server.on('error', (err) => {
    console.error('Error en servidor:', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('Excepción no capturada:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
  });

} catch (error) {
  console.error('Error al inicializar servidor:', error);
}
