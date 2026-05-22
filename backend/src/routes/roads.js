/**
 * Roads API — backed by live OpenStreetMap Overpass API.
 * Administrative details (budget, contractor, engineer) are served from the
 * in-memory store only when admin has explicitly entered them. Otherwise the
 * response includes an explicit `data_note` explaining what is missing and why.
 */

import { Router }        from 'express';
import { v4 as uuid }    from 'uuid';
import { queryRoadsNear, getRoadByOsmId } from '../services/osm.js';
import { reverseGeocode }                 from '../services/geocoding.js';
import { getWeather }                     from '../services/weather.js';
import { store }                          from '../services/store.js';
import { requireAuth, requireRole }       from '../middleware/auth.js';

const router = Router();

// GET /api/roads?lat=X&lng=Y&radius=5000
router.get('/', async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng query params required' });
  }

  const clat = parseFloat(lat);
  const clng = parseFloat(lng);

  // Fetch real roads from OSM
  const osmRoads = await queryRoadsNear(clat, clng, parseInt(radius, 10));

  if (osmRoads.length === 0) {
    return res.json({
      roads: [],
      meta: {
        source: 'OpenStreetMap Overpass API',
        note: 'Road data temporarily unavailable — public Overpass mirrors may be rate-limited. ' +
              'This resolves automatically within 1–2 hours. ' +
              'The map, weather, analytics, complaints, and chatbot continue to work normally.',
      },
    });
  }

  // Reverse-geocode the center location once for district/state
  const geo = await reverseGeocode(clat, clng);

  // Enrich each road with complaint count and admin-entered data (if any)
  const enriched = osmRoads.map(road => {
    const osmId = road.osm_id;
    const budgets   = store.getBudgetsByOsmId(osmId);
    const complaints= store.getComplaintsByOsmId(osmId);
    const openCount = complaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length;

    return {
      ...road,
      state:           road.state    ?? geo?.state    ?? null,
      district:        road.district ?? geo?.district ?? null,
      open_complaints: openCount,
      total_complaints:complaints.length,
      has_admin_data:  budgets.length > 0,
    };
  });

  res.json({
    roads: enriched,
    meta: {
      source:        'OpenStreetMap Overpass API',
      location:      geo,
      fetched_at:    new Date().toISOString(),
      total_returned: enriched.length,
      note: 'Road geometry and type from OSM. Budget, contractor, and maintenance data shown only when admin has entered it.',
    },
  });
});

// GET /api/roads/:osmId — single road detail
router.get('/:osmId', async (req, res) => {
  const { osmId } = req.params;

  // Fetch from OSM
  const road = await getRoadByOsmId(osmId.replace('osm_', ''));
  if (!road) {
    return res.status(404).json({ error: 'Road not found in OpenStreetMap data' });
  }

  // Reverse geocode for state/district
  const geo = await reverseGeocode(road.lat, road.lng);
  road.state    = road.state    ?? geo?.state    ?? null;
  road.district = road.district ?? geo?.district ?? null;

  // Weather at road location
  const weather = await getWeather(road.lat, road.lng);

  // Admin-entered data from store
  const budgets     = store.getBudgetsByOsmId(osmId.replace('osm_', ''));
  const repairLogs  = store.getRepairLogsByOsmId(osmId.replace('osm_', ''));
  const complaints  = store.getComplaintsByOsmId(osmId.replace('osm_', ''));

  res.json({
    ...road,
    weather,
    budgets,
    repair_logs: repairLogs,
    complaints_summary: {
      total:    complaints.length,
      open:     complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    },
    admin_data_available: {
      budget:     budgets.length > 0,
      repair_log: repairLogs.length > 0,
    },
    data_note: 'Budget, contractor, and maintenance data are available only when an admin enters them from official sources (NHAI / State PWD / PFMS). Use RTI (rtionline.gov.in) to request this data officially.',
    sources: {
      road_geometry: 'OpenStreetMap (openstreetmap.org)',
      weather:       'Open-Meteo (open-meteo.com)',
      location:      'Nominatim / OpenStreetMap',
      admin_data:    'RoadWatch Admin (manually entered)',
    },
  });
});

// POST /api/roads — admin creates a manual road record (when OSM is incomplete)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const road = { id: uuid(), ...req.body, created_at: new Date().toISOString(), data_source: 'admin-manual' };
  // Store in a separate admin-created list (not OSM)
  // For now just echo back — full DB persistence is a post-MVP item
  res.status(201).json({ road, note: 'Manual road record created. For persistent storage, connect a database.' });
});

export default router;
