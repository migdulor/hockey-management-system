import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './interfaces/http/routes/playerRoutes.js';
import trainingRoutes from './interfaces/http/routes/trainingRoutes.js';
import formationRoutes from './interfaces/http/routes/formationRoutes.js';
import teamRoutes from './interfaces/http/routes/teamRoutes.js';
import matchRoutes from './interfaces/http/routes/matchRoutes.js';
import authRoutes from './interfaces/http/routes/authRoutes.js';
import userAdminRoutes from './interfaces/http/routes/userAdminRoutes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Hockey Management System API is running'
  });
});

// API Health check endpoint (with /api prefix)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Hockey Management System API is running',
    version: '2.1.0',
    environment: 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Hockey Management System API',
    version: '2.1.0',
    description: 'API para el sistema de gestión de hockey con administración de usuarios',
    authentication: {
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout'
    },
    administration: {
      users: 'GET /api/admin/users - Listar usuarios (admin)',
      createUser: 'POST /api/admin/users - Crear usuario (admin)',
      userStats: 'GET /api/admin/users/stats - Estadísticas (admin)',
      updateUser: 'PUT /api/admin/users/:id - Actualizar usuario (admin)',
      toggleUser: 'PATCH /api/admin/users/:id/toggle - Activar/Desactivar (admin)',
      resetPassword: 'PUT /api/admin/users/:id/password - Resetear contraseña (admin)'
    },
    endpoints: [
      'GET /health - Estado del servidor',
      'POST /api/auth/login - Iniciar sesión',
      'GET /api/admin/users - Administración de usuarios',
      'GET /api/players - Obtener jugadores',
      'GET /api/teams - Obtener equipos',
      'GET /api/matches - Obtener partidos',
      'GET /api/training-sessions - Obtener entrenamientos (US005)',
      'GET /api/formations - Obtener formaciones (US006/007/008)',
      'POST /api/training-sessions - Crear entrenamiento',
      'POST /api/formations - Crear formación'
    ],
    features: [
      '🔐 Sistema de autenticación JWT',
      '👥 Administración de usuarios (admin/coach)',
      '📋 Planes de suscripción (2/3/5 equipos)',
      '� US005: Sistema de entrenamientos independientes',
      '🏑 US006: Formaciones drag & drop (11+9 jugadores)',
      '📊 US007: Información contextual de partidos',
      '🖼️ US008: Exportación PNG de formaciones'
    ],
    database: {
      status: 'Connected to Vercel Postgres',
      tables: 12,
      migrations: 'Completed successfully',
      users: 'Ready for authentication'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userAdminRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/training-sessions', trainingRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});

export default app;
