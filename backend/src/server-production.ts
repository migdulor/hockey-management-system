import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import formationRoutes from './interfaces/http/routes/formationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar middlewares de seguridad
app.use(helmet());
app.use(compression());

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint directo
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'formations-api'
  });
});

// API routes
app.use('/api', formationRoutes);

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor de formaciones iniciado');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('🎯 Endpoints disponibles:');
  console.log('   - GET    /health');
  console.log('   - GET    /api/formations');
  console.log('   - POST   /api/formations');
  console.log('   - GET    /api/formations/:id');
  console.log('   - PUT    /api/formations/:id');
  console.log('   - DELETE /api/formations/:id');
  console.log('   - GET    /api/formations/:id/details');
  console.log('   - GET    /api/formations/:id/positions');
  console.log('   - POST   /api/formations/:id/positions');
  console.log('');
  console.log('✅ Servidor listo para recibir peticiones');
});

// Manejo de errores del servidor
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso`);
    console.log('💡 Prueba con un puerto diferente usando: PORT=3002 npm start');
  } else {
    console.error('❌ Error del servidor:', error);
  }
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
  });
});

export default app;
