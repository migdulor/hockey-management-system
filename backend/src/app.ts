import express from 'express';
import playerRoutes from './interfaces/http/routes/playerRoutes.js';
import teamRoutes from './interfaces/http/routes/teamRoutes.js';
import matchRoutes from './interfaces/http/routes/matchRoutes.js';
import formationRoutes from './interfaces/http/routes/formationRoutes.js';
import attendanceRoutes from './interfaces/http/routes/attendanceRoutes.js';
import authRoutes from './interfaces/http/routes/authRoutes.js';
import reportRoutes from './interfaces/http/routes/reportRoutes.js';
import statisticRoutes from './interfaces/http/routes/statisticRoutes.js';
import whatsappRoutes from './interfaces/http/routes/whatsappRoutes.js';
import paymentRoutes from './interfaces/http/routes/paymentRoutes.js';
import mlRoutes from './interfaces/http/routes/mlRoutes.js';

const app = express();
app.use(express.json());


app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ml', mlRoutes);

app.get('/', (req, res) => {
  res.send('Hockey Management System API');
});

export default app;
