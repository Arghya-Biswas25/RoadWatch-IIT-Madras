import { store } from './store.js';
import { v4 as uuid } from 'uuid';

// Generate a RW-YYYY-XXXX style tracking token
function generateToken() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `RW-${year}-${suffix}`;
}

// Route a new complaint to the correct engineer based on road type
export function routeComplaint({ road_id, category, description, severity, latitude, longitude }) {
  const road = store.getRoadById(road_id);
  if (!road) throw new Error('Road not found');

  let routed_to = null;
  const rule = store.getRoutingRule(road.road_type, road.country || 'India');
  if (rule) {
    routed_to = rule.default_engineer_id;
  } else {
    // Fall back to the road's assigned engineer
    routed_to = road.engineer_id || 'admin1';
  }

  const now = new Date().toISOString();
  const complaint = {
    id: uuid(),
    tracking_token: generateToken(),
    road_id,
    category,
    description,
    severity: severity || 'Medium',
    latitude: Math.round(latitude * 1000) / 1000,   // ~100m precision
    longitude: Math.round(longitude * 1000) / 1000,
    status: 'Routed',
    routed_to,
    routed_at: now,
    seen_at: null,
    resolved_at: null,
    resolution_note: null,
    engineer_reply: null,
    escalated: false,
    escalated_at: null,
    created_at: now,
    updated_at: now,
  };

  store.createComplaint(complaint);
  return complaint;
}

// SLA thresholds in hours
const SLA = {
  Critical: { see: 4, resolve: 48 },
  High: { see: 12, resolve: 168 },
  Medium: { see: 48, resolve: 336 },
  Low: { see: 168, resolve: 720 },
};

export function checkSLA(complaint) {
  const sla = SLA[complaint.severity] || SLA.Medium;
  const createdAt = new Date(complaint.created_at);
  const now = new Date();
  const hoursElapsed = (now - createdAt) / 3_600_000;

  return {
    sla_breach: !complaint.resolved_at && hoursElapsed > sla.resolve,
    see_breach: !complaint.seen_at && hoursElapsed > sla.see,
    hours_elapsed: Math.round(hoursElapsed),
    sla_resolve_hours: sla.resolve,
  };
}
