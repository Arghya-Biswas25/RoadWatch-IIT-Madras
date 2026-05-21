import { Router } from 'express';
import { store } from '../services/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { computeScore, scoreBand } from '../services/scoring.js';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/contractors — all contractors with scores
router.get('/contractors', (req, res) => {
  const contractors = store.getContractors();
  const withScores = contractors.map(c => {
    const score = computeScore(c.id);
    return { ...c, score_breakdown: score, band: scoreBand(score?.overall_score || 0) };
  });
  res.json(withScores);
});

// GET /api/admin/routing-rules
router.get('/routing-rules', (req, res) => {
  res.json(store.getRoutingRules());
});

// PUT /api/admin/routing-rules
router.put('/routing-rules', (req, res) => {
  const { road_type, country, authority, default_engineer_id } = req.body;
  store.updateRoutingRule(road_type, country || 'India', { authority, default_engineer_id });
  res.json({ ok: true });
});

// GET /api/admin/engineers — list all engineers
router.get('/engineers', (req, res) => {
  const engineers = store.getContractors();
  res.json(engineers);
});

// POST /api/admin/budgets — add budget record
router.post('/budgets', (req, res) => {
  const budget = { id: uuid(), ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  store.createBudget(budget);
  res.status(201).json(budget);
});

// POST /api/admin/repair-logs — add repair log
router.post('/repair-logs', (req, res) => {
  const log = { id: uuid(), ...req.body, created_at: new Date().toISOString() };
  store.createRepairLog(log);
  res.status(201).json(log);
});

export default router;
