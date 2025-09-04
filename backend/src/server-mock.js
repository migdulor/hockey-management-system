import express from 'express';

const app = express();

// Middleware
app.use(express.json());

// CORS middleware
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

// Mock data para pruebas
let formations = [];
let positions = [];

// Rutas de formaciones
app.get('/api/formations', (req, res) => {
  res.json(formations);
});

app.post('/api/formations', (req, res) => {
  const formation = {
    id: req.body.id || `formation_${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  formations.push(formation);
  res.status(201).json(formation);
});

app.get('/api/formations/:id', (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation not found' });
  }
  res.json(formation);
});

app.put('/api/formations/:id', (req, res) => {
  const index = formations.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Formation not found' });
  }
  formations[index] = { ...formations[index], ...req.body, updatedAt: new Date() };
  res.json(formations[index]);
});

app.delete('/api/formations/:id', (req, res) => {
  const index = formations.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Formation not found' });
  }
  formations.splice(index, 1);
  positions = positions.filter(p => p.formationId !== req.params.id);
  res.status(204).send();
});

app.get('/api/formations/:id/details', (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation not found' });
  }
  
  const formationPositions = positions.filter(p => p.formationId === req.params.id);
  const startersCount = formationPositions.filter(p => p.positionType === 'starter').length;
  const substitutesCount = formationPositions.filter(p => p.positionType === 'substitute').length;
  
  res.json({
    ...formation,
    positions: formationPositions,
    startersCount,
    substitutesCount
  });
});

app.get('/api/formations/:id/positions', (req, res) => {
  const formationPositions = positions.filter(p => p.formationId === req.params.id);
  res.json(formationPositions);
});

app.post('/api/formations/:id/positions', (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation not found' });
  }
  
  // Validación de límites
  const starters = positions.filter(p => p.formationId === req.params.id && p.positionType === 'starter').length;
  if (req.body.positionType === 'starter' && starters >= 11) {
    return res.status(400).json({ error: 'Cannot add more than 11 starters' });
  }
  
  const position = {
    id: `pos_${Date.now()}`,
    formationId: req.params.id,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  positions.push(position);
  res.status(201).json(position);
});

app.put('/api/formations/:id/positions/:positionId', (req, res) => {
  const index = positions.findIndex(p => p.id === req.params.positionId && p.formationId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Position not found' });
  }
  positions[index] = { ...positions[index], ...req.body, updatedAt: new Date() };
  res.json(positions[index]);
});

app.delete('/api/formations/:id/positions/:positionId', (req, res) => {
  const index = positions.findIndex(p => p.id === req.params.positionId && p.formationId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Position not found' });
  }
  positions.splice(index, 1);
  res.status(204).send();
});

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hockey Management System API - Formations Module (Mock)',
    status: 'active',
    formations: formations.length,
    positions: positions.length,
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
app.use((err, req, res, next) => {
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

const PORT = parseInt(process.env.PORT || '3001');

console.log('🚀 Iniciando servidor mock de formaciones...');
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

server.on('error', (err) => {
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
