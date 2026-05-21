import { Router } from 'express';
import { store } from '../services/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

// GET /api/roads — list all roads (with optional lat/lng filter)
router.get('/', (req, res) => {
  const { lat, lng, radius = 50, state, road_type } = req.query;
  let roads = store.getRoads();

  if (state) roads = roads.filter(r => r.state?.toLowerCase() === state.toLowerCase());
  if (road_type) roads = roads.filter(r => r.road_type === road_type);

  if (lat && lng) {
    const clat = parseFloat(lat), clng = parseFloat(lng);
    roads = roads.filter(r => {
      const dist = Math.sqrt((r.lat - clat) ** 2 + (r.lng - clng) ** 2) * 111;
      return dist <= parseFloat(radius);
    });
  }

  const contractors = store.getContractors();
  const complaints = store.getComplaints();

  const enriched = roads.map(r => {
    const contractor = contractors.find(c => c.id === r.contractor_id);
    const budgets = store.getBudgetsByRoadId(r.id);
    const latestBudget = budgets.sort((a, b) => b.financial_year.localeCompare(a.financial_year))[0];
    const openComplaints = complaints.filter(c => c.road_id === r.id && !['Resolved', 'Closed'].includes(c.status)).length;

    return {
      ...r,
      contractor_name: contractor?.name,
      contractor_score: contractor?.performance_score,
      engineer_name: store.getUserById(r.engineer_id)?.name,
      engineer_designation: store.getUserById(r.engineer_id)?.designation,
      latest_budget: latestBudget ? {
        year: latestBudget.financial_year,
        work_type: latestBudget.work_type,
        sanctioned: latestBudget.amount_sanctioned,
        spent: latestBudget.amount_spent,
        source: latestBudget.source,
        scheme: latestBudget.source_scheme,
      } : null,
      open_complaints: openComplaints,
    };
  });

  res.json(enriched);
});

// GET /api/roads/:id — single road detail
router.get('/:id', (req, res) => {
  const road = store.getRoadById(req.params.id);
  if (!road) return res.status(404).json({ error: 'Road not found' });

  const contractor = store.getContractorById(road.contractor_id);
  const budgets = store.getBudgetsByRoadId(road.id);
  const repairLogs = store.getRepairLogsByRoadId(road.id);
  const complaints = store.getComplaints().filter(c => c.road_id === road.id);
  const engineer = store.getUserById(road.engineer_id);

  res.json({
    ...road,
    contractor,
    engineer: engineer ? { name: engineer.name, designation: engineer.designation } : null,
    budgets,
    repair_logs: repairLogs,
    complaints_summary: {
      total: complaints.length,
      open: complaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    },
  });
});

// POST /api/roads — admin creates a road
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const road = { id: uuid(), ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  store.createRoad(road);
  res.status(201).json(road);
});

// PUT /api/roads/:id — admin updates a road
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const updated = store.updateRoad(req.params.id, { ...req.body, updated_at: new Date().toISOString() });
  if (!updated) return res.status(404).json({ error: 'Road not found' });
  res.json(updated);
});

export default router;
