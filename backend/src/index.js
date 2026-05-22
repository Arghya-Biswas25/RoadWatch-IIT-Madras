import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes      from './routes/auth.js';
import roadsRoutes     from './routes/roads.js';
import complaintsRoutes from './routes/complaints.js';
import analyticsRoutes from './routes/analytics.js';
import chatbotRoutes   from './routes/chatbot.js';
import adminRoutes     from './routes/admin.js';
import externalRoutes  from './routes/external.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  service: 'RoadWatch API',
  version: '2.0.0',
  data_sources: {
    roads:    'OpenStreetMap Overpass API (live)',
    weather:  'Open-Meteo (live, no key needed)',
    geocoding:'Nominatim / OpenStreetMap (live)',
    news:     'GDELT Project (live, no key needed)',
    stats:    'MoRTH/NHAI public reports (embedded)',
    complaints:'RoadWatch in-memory store',
  },
}));

app.use('/api/auth',      authRoutes);
app.use('/api/roads',     roadsRoutes);
app.use('/api/complaints',complaintsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot',   chatbotRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/external',  externalRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🛣️  RoadWatch API v2.0 — http://localhost:${PORT}`);
  console.log(`   Roads:   OpenStreetMap (live)`);
  console.log(`   Weather: Open-Meteo (live)`);
  console.log(`   News:    GDELT Project (live)`);
  console.log(`   AI:      Kimi K2.6 via NVIDIA + BM25 RAG`);
  console.log(`\n📋  Demo credentials (password: demo1234):`);
  console.log(`    Admin:    admin@roadwatch.demo`);
  console.log(`    Engineer: engineer.wb@roadwatch.demo`);
  console.log(`    Engineer: engineer.tn@roadwatch.demo\n`);
});
