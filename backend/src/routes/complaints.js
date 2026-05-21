import { Router } from 'express';
import { store } from '../services/store.js';
import { routeComplaint, checkSLA } from '../services/routing.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/complaints — anonymous citizen files a complaint
router.post('/', (req, res) => {
  const { road_id, category, description, severity, latitude, longitude } = req.body;
  if (!road_id || !category || !description) {
    return res.status(400).json({ error: 'road_id, category and description are required' });
  }

  // Warn if possible PII detected
  const piiPattern = /\b(\d{10}|\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
  if (piiPattern.test(description)) {
    return res.status(400).json({ error: 'Please remove personal information (phone number, email, etc.) from the description.' });
  }

  try {
    const complaint = routeComplaint({ road_id, category, description, severity, latitude: latitude || 0, longitude: longitude || 0 });
    res.status(201).json({
      tracking_token: complaint.tracking_token,
      status: complaint.status,
      routed_to_authority: store.getUserById(complaint.routed_to)?.designation,
      message: 'Your complaint has been submitted and routed to the responsible authority.',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/complaints/track/:token — citizen tracks complaint
router.get('/track/:token', (req, res) => {
  const complaint = store.getComplaintByToken(req.params.token);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found. Check your token.' });

  const road = store.getRoadById(complaint.road_id);
  const sla = checkSLA(complaint);

  res.json({
    tracking_token: complaint.tracking_token,
    road_name: road?.road_name,
    category: complaint.category,
    severity: complaint.severity,
    status: complaint.status,
    submitted_at: complaint.created_at,
    seen_at: complaint.seen_at,
    resolved_at: complaint.resolved_at,
    engineer_reply: complaint.engineer_reply,
    resolution_note: complaint.resolution_note,
    escalated: complaint.escalated,
    sla_info: sla,
  });
});

// GET /api/complaints — engineer gets their complaints
router.get('/', requireAuth, requireRole('engineer', 'admin'), (req, res) => {
  let complaints;
  if (req.user.role === 'admin') {
    complaints = store.getComplaints();
  } else {
    complaints = store.getComplaintsByEngineer(req.user.id);
  }

  const enriched = complaints.map(c => {
    const road = store.getRoadById(c.road_id);
    const sla = checkSLA(c);
    return { ...c, road_name: road?.road_name, road_type: road?.road_type, sla_info: sla };
  });

  enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(enriched);
});

// PUT /api/complaints/:id/status — engineer updates complaint status
router.put('/:id/status', requireAuth, requireRole('engineer', 'admin'), (req, res) => {
  const { status, resolution_note, engineer_reply } = req.body;
  const complaint = store.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (req.user.role === 'engineer' && complaint.routed_to !== req.user.id) {
    return res.status(403).json({ error: 'This complaint is not assigned to you' });
  }

  const patch = { status };
  if (status === 'Seen' && !complaint.seen_at) patch.seen_at = new Date().toISOString();
  if (status === 'Resolved') {
    patch.resolved_at = new Date().toISOString();
    if (resolution_note) patch.resolution_note = resolution_note;
  }
  if (engineer_reply) patch.engineer_reply = engineer_reply;

  const updated = store.updateComplaint(req.params.id, patch);
  res.json(updated);
});

// PUT /api/complaints/:id/assign — admin reassigns complaint
router.put('/:id/assign', requireAuth, requireRole('admin'), (req, res) => {
  const { engineer_id } = req.body;
  const updated = store.updateComplaint(req.params.id, { routed_to: engineer_id, status: 'Routed', routed_at: new Date().toISOString() });
  if (!updated) return res.status(404).json({ error: 'Complaint not found' });
  res.json(updated);
});

// PUT /api/complaints/:id/escalate — admin escalates
router.put('/:id/escalate', requireAuth, requireRole('admin'), (req, res) => {
  const updated = store.updateComplaint(req.params.id, {
    status: 'Escalated',
    escalated: true,
    escalated_at: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Complaint not found' });
  res.json(updated);
});

export default router;
