import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import roadsRoutes from './routes/roads.js';
import complaintsRoutes from './routes/complaints.js';
import analyticsRoutes from './routes/analytics.js';
import chatbotRoutes from './routes/chatbot.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'RoadWatch API', version: '1.0.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/roads', roadsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🛣️  RoadWatch API running on http://localhost:${PORT}`);
  console.log(`📋  Demo credentials:`);
  console.log(`    Admin:    admin@roadwatch.demo / demo1234`);
  console.log(`    Engineer: engineer.abc@roadwatch.demo / demo1234`);
  console.log(`    Engineer: engineer.xyz@roadwatch.demo / demo1234\n`);
});
