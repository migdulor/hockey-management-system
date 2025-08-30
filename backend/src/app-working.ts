import express from 'express';

console.log('Iniciando app principal...');

// Importar solo las rutas que están completamente implementadas
import playerRoutes from './interfaces/http/routes/playerRoutes.js';
// import teamRoutes from './interfaces/http/routes/teamRoutes.js';
// import matchRoutes from './interfaces/http/routes/matchRoutes.js';
// import formationRoutes from './interfaces/http/routes/formationRoutes.js';
// import attendanceRoutes from './interfaces/http/routes/attendanceRoutes.js';

const app = express();
console.log('Express app creada');

app.use(express.json());
console.log('Middleware json configurado');

// Rutas principales
app.get('/', (req, res) => {
  console.log('Recibida petición GET /');
  res.send('Hockey Management System API');
});

app.get('/health', (req, res) => {
  console.log('Recibida petición GET /health');
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Solo agregar las rutas implementadas
console.log('Configurando rutas de players...');
app.use('/api/players', playerRoutes);

// Comentar las demás rutas hasta que estén funcionando
// app.use('/api/teams', teamRoutes);
// app.use('/api/matches', matchRoutes);
// app.use('/api/formations', formationRoutes);
// app.use('/api/attendances', attendanceRoutes);

console.log('App configurada correctamente');

export default app;
