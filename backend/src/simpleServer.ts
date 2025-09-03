import express from 'express';
import { PlayerService } from '../core/services/PlayerService.js';
import { PlayerRepositoryPostgres } from '../core/repositories/PlayerRepositoryPostgres.js';
import { PlayerController } from '../interfaces/http/controllers/PlayerController.js';

const app = express();
app.use(express.json());

// Configurar solo las rutas de players para la prueba
const playerRepo = new PlayerRepositoryPostgres();
const playerService = new PlayerService(playerRepo);
const playerController = new PlayerController(playerService);

app.post('/api/players', (req, res) => playerController.create(req, res));
app.get('/api/players', (req, res) => playerController.getAll(req, res));
app.get('/api/players/:id', (req, res) => playerController.getById(req, res));
app.put('/api/players/:id', (req, res) => playerController.update(req, res));
app.delete('/api/players/:id', (req, res) => playerController.delete(req, res));

app.get('/', (req, res) => {
  res.json({ 
    message: '� Hockey Management System API',
    version: '1.0.0',
    endpoints: {
      players: '/api/players'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📋 API disponible en http://localhost:${PORT}`);
});

export default app;
