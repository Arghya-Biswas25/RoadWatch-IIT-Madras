// In-memory store — works without Supabase for demo purposes
import { roads, contractors, users, budgets, repairLogs, complaints, routingRules } from '../data/seed.js';

// Deep clone so mutations don't corrupt the original seed
let _roads = roads.map(r => ({ ...r }));
let _contractors = contractors.map(c => ({ ...c }));
let _users = users.map(u => ({ ...u }));
let _budgets = budgets.map(b => ({ ...b }));
let _repairLogs = repairLogs.map(r => ({ ...r }));
let _complaints = complaints.map(c => ({ ...c }));
let _routingRules = routingRules.map(r => ({ ...r }));

export const store = {
  // Roads
  getRoads: () => _roads,
  getRoadById: (id) => _roads.find(r => r.id === id),
  updateRoad: (id, patch) => {
    const idx = _roads.findIndex(r => r.id === id);
    if (idx === -1) return null;
    _roads[idx] = { ..._roads[idx], ...patch };
    return _roads[idx];
  },
  createRoad: (road) => { _roads.push(road); return road; },

  // Contractors
  getContractors: () => _contractors,
  getContractorById: (id) => _contractors.find(c => c.id === id),
  updateContractor: (id, patch) => {
    const idx = _contractors.findIndex(c => c.id === id);
    if (idx === -1) return null;
    _contractors[idx] = { ..._contractors[idx], ...patch };
    return _contractors[idx];
  },

  // Users (auth)
  getUserByEmail: (email) => _users.find(u => u.email === email),
  getUserById: (id) => _users.find(u => u.id === id),

  // Budgets
  getBudgets: () => _budgets,
  getBudgetsByRoadId: (roadId) => _budgets.filter(b => b.road_id === roadId),
  createBudget: (b) => { _budgets.push(b); return b; },

  // Repair logs
  getRepairLogsByRoadId: (roadId) => _repairLogs.filter(r => r.road_id === roadId),
  createRepairLog: (log) => { _repairLogs.push(log); return log; },

  // Complaints
  getComplaints: () => _complaints,
  getComplaintById: (id) => _complaints.find(c => c.id === id),
  getComplaintByToken: (token) => _complaints.find(c => c.tracking_token === token),
  getComplaintsByEngineer: (engId) => _complaints.filter(c => c.routed_to === engId),
  createComplaint: (complaint) => { _complaints.push(complaint); return complaint; },
  updateComplaint: (id, patch) => {
    const idx = _complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    _complaints[idx] = { ..._complaints[idx], ...patch, updated_at: new Date().toISOString() };
    return _complaints[idx];
  },

  // Routing rules
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
