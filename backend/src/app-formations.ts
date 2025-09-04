import express from 'express';
import formationRoutes from './interfaces/http/routes/formationRoutes.js';

const app = express();

// Middleware
app.use(express.json());

// CORS middleware (opcional, para pruebas desde el frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas
app.use('/api/formations', formationRoutes);

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hockey Management System API - Formations Module',
    status: 'active',
    endpoints: {
      formations: '/api/formations',
      formationDetails: '/api/formations/:id/details',
      formationPositions: '/api/formations/:id/positions'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error en la aplicación:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

export default app;
