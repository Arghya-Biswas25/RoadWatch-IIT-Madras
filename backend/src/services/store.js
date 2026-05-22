/**
 * In-memory store for data RoadWatch owns:
 *  - User accounts (for auth)
 *  - Contractor profiles (admin-entered)
 *  - Routing rules
 *  - Complaints (citizen-submitted + demo seeds)
 *  - Admin-entered budgets and repair logs
 *
 * Roads are NOT in this store — they are fetched live from OpenStreetMap.
 */

import { contractors, users, budgets, repairLogs, complaints, routingRules } from '../data/seed.js';
import { computeScore } from './scoring.js';

let _contractors  = contractors.map(c => ({ ...c }));
let _users        = users.map(u => ({ ...u }));
let _budgets      = budgets.map(b => ({ ...b }));
let _repairLogs   = repairLogs.map(r => ({ ...r }));
let _complaints   = complaints.map(c => ({ ...c }));
let _routingRules = routingRules.map(r => ({ ...r }));

// ── Contractors ──────────────────────────────────────────────────────────────
export const store = {
  // Raw lookup — no score computation (avoids circular dependency with scoring.js)
  getContractorRaw: (id) => _contractors.find(x => x.id === id) ?? null,
  getContractorsRaw: () => _contractors,

  // Scored versions — called by routes after scoring.js is safely imported
  getContractors: () => _contractors,      // routes inject score themselves
  getContractorById: (id) => _contractors.find(x => x.id === id) ?? null,
  updateContractor: (id, patch) => {
    const idx = _contractors.findIndex(c => c.id === id);
    if (idx === -1) return null;
    _contractors[idx] = { ..._contractors[idx], ...patch };
    return _contractors[idx];
  },

  // ── Users (auth) ──────────────────────────────────────────────────────────
  getUserByEmail: (email) => _users.find(u => u.email === email),
  getUserById:    (id)    => _users.find(u => u.id === id),

  // ── Budgets (admin-entered) ───────────────────────────────────────────────
  getBudgets: ()          => _budgets,
  getBudgetsByRoadId: (roadId) => _budgets.filter(b => b.road_id === roadId),
  getBudgetsByOsmId:  (osmId)  => _budgets.filter(b => b.osm_road_id === String(osmId)),
  createBudget: (b) => { _budgets.push(b); return b; },

  // ── Repair logs (admin-entered) ───────────────────────────────────────────
  getRepairLogsByOsmId: (osmId) => _repairLogs.filter(r => r.osm_road_id === String(osmId)),
  createRepairLog: (log) => { _repairLogs.push(log); return log; },

  // ── Complaints ────────────────────────────────────────────────────────────
  getComplaints: ()          => _complaints,
  getComplaintById: (id)     => _complaints.find(c => c.id === id),
  getComplaintByToken: (tok) => _complaints.find(c => c.tracking_token === tok),
  getComplaintsByEngineer: (engId)  => _complaints.filter(c => c.routed_to === engId),
  getComplaintsByOsmId:    (osmId)  => _complaints.filter(c => String(c.road_osm_id) === String(osmId)),
  createComplaint: (complaint) => { _complaints.push(complaint); return complaint; },
  updateComplaint: (id, patch) => {
    const idx = _complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    _complaints[idx] = { ..._complaints[idx], ...patch, updated_at: new Date().toISOString() };
    return _complaints[idx];
  },

  // ── Routing Rules ─────────────────────────────────────────────────────────
  getRoutingRules: () => _routingRules,
  getRoutingRule: (roadType, country = 'India') =>
    _routingRules.find(r => r.road_type === roadType && r.country === country),
  updateRoutingRule: (roadType, country, patch) => {
    const idx = _routingRules.findIndex(r => r.road_type === roadType && r.country === country);
    if (idx === -1) {
      _routingRules.push({ road_type: roadType, country, ...patch });
    } else {
      _routingRules[idx] = { ..._routingRules[idx], ...patch };
    }
  },
};
