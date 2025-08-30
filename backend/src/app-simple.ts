import express from 'express';

console.log('Iniciando app.ts...');

const app = express();
console.log('Express app creada');

app.use(express.json());
console.log('Middleware json configurado');

app.get('/', (req, res) => {
  console.log('Recibida petición GET /');
  res.send('Hockey Management System API');
});

app.get('/health', (req, res) => {
  console.log('Recibida petición GET /health');
  res.json({ status: 'OK', message: 'Server is healthy' });
});

console.log('Rutas básicas configuradas');

export default app;
