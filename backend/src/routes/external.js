/**
 * External data aggregation routes.
 * All sources are free/open and cited.
 */

import { Router }               from 'express';
import { getWeather }           from '../services/weather.js';
import { reverseGeocode, geocode } from '../services/geocoding.js';
import { fetchNews, fetchAllNews } from '../services/news.js';
import { NATIONAL_STATS, getNationalStatsText } from '../services/national-stats.js';

const router = Router();

// GET /api/external/weather?lat=X&lng=Y
router.get('/weather', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const weather = await getWeather(parseFloat(lat), parseFloat(lng));
  if (!weather) return res.status(503).json({ error: 'Weather service temporarily unavailable' });
  res.json(weather);
});

// GET /api/external/geocode/reverse?lat=X&lng=Y
router.get('/geocode/reverse', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
  if (!result) return res.status(503).json({ error: 'Geocoding service temporarily unavailable' });
  res.json(result);
});

// GET /api/external/geocode/search?q=Kolkata
router.get('/geocode/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q (query) required' });
  const results = await geocode(q);
  res.json(results);
});

// GET /api/external/news?topic=infrastructure
router.get('/news', async (req, res) => {
  const { topic, all } = req.query;
  if (all === 'true') {
    res.json(await fetchAllNews());
  } else {
    res.json(await fetchNews(topic || 'infrastructure'));
  }
});

// GET /api/external/national-stats
router.get('/national-stats', (_req, res) => {
  res.json(NATIONAL_STATS);
});

// GET /api/external/national-stats/text  (for RAG context)
router.get('/national-stats/text', (_req, res) => {
  res.type('text/plain').send(getNationalStatsText());
});

export default router;
