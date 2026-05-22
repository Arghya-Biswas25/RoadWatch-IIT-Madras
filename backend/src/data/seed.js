/**
 * Seed data for RoadWatch demo.
 *
 * Roads are NOT seeded here — they are fetched live from OpenStreetMap Overpass API.
 * Only data that RoadWatch itself owns and manages is stored here:
 *  - Demo user accounts  (for hackathon judge login)
 *  - Demo complaint records (showing the complaint workflow)
 *  - Routing rules (configurable by admin)
 *  - Optionally: contractor profiles entered by admin
 *
 * All budget, repair history, and contractor-road assignments come from admin input,
 * NOT from fabricated values.
 */

import bcrypt from 'bcryptjs';

const passwordHash = bcrypt.hashSync('demo1234', 10);

// ── Demo Users (engineers + admin) ─────────────────────────────────────────
export const users = [
  {
    id: 'eng1',
    email: 'engineer.wb@roadwatch.demo',
    password_hash: passwordHash,
    role: 'engineer',
    contractor_id: 'c1',
    name: 'Er. Rajesh Kumar',
    designation: 'Executive Engineer, NHAI Kolkata Zone',
  },
  {
    id: 'eng2',
    email: 'engineer.tn@roadwatch.demo',
    password_hash: passwordHash,
    role: 'engineer',
    contractor_id: 'c2',
    name: 'Er. Priya Venkatesh',
    designation: 'Divisional Engineer, State PWD Tamil Nadu',
  },
  {
    id: 'admin1',
    email: 'admin@roadwatch.demo',
    password_hash: passwordHash,
    role: 'admin',
    contractor_id: null,
    name: 'Admin User',
    designation: 'System Administrator, RoadWatch',
  },
];

// ── Demo Contractor Profiles (admin-entered, not from any scraping) ──────────
export const contractors = [
  {
    id: 'c1',
    name: 'Example Contractor A (Demo)',
    registration_no: 'DEMO-2024-001',
    contact_email: 'contractor.a@example.com',
    contact_phone: null,
    state: 'West Bengal',
    country: 'India',
    type: 'Contractor',
    role: 'Engineer',
    auth_user_id: 'eng1',
    performance_score: null, // computed from complaint data — not hardcoded
    account_active: true,
    note: 'This is a placeholder contractor profile for demo purposes. Real contractor data must be entered by an admin from official government contractor registration databases.',
  },
  {
    id: 'c2',
    name: 'Example Contractor B (Demo)',
    registration_no: 'DEMO-2024-002',
    contact_email: 'contractor.b@example.com',
    contact_phone: null,
    state: 'Tamil Nadu',
    country: 'India',
    type: 'Contractor',
    role: 'Engineer',
    auth_user_id: 'eng2',
    performance_score: null,
    account_active: true,
    note: 'Placeholder. Real contractor data from eProcure (eprocure.gov.in) or state PWD contractor registries.',
  },
];

// ── Routing Rules (configurable, based on Indian authority structure) ────────
export const routingRules = [
  { road_type: 'NH',    country: 'India', authority: 'NHAI / MoRTH',                 default_engineer_id: 'eng1' },
  { road_type: 'SH',    country: 'India', authority: 'State PWD',                     default_engineer_id: 'eng1' },
  { road_type: 'MDR',   country: 'India', authority: "District Collector's Office",   default_engineer_id: 'eng2' },
  { road_type: 'ODR',   country: 'India', authority: "District Collector's Office",   default_engineer_id: 'eng2' },
  { road_type: 'Urban', country: 'India', authority: 'Municipal Corporation',          default_engineer_id: 'eng2' },
  { road_type: 'VR',    country: 'India', authority: 'Panchayati Raj / PMGSY',         default_engineer_id: 'eng1' },
  { road_type: 'Other', country: 'India', authority: 'Relevant local authority',       default_engineer_id: 'admin1' },
  // International routing rules
  { road_type: 'Motorway', country: 'UK',  authority: 'National Highways',            default_engineer_id: 'admin1' },
  { road_type: 'A_road',   country: 'UK',  authority: 'Local Highway Authority',       default_engineer_id: 'admin1' },
  { road_type: 'Interstate',country: 'USA', authority: 'FHWA / State DOT',            default_engineer_id: 'admin1' },
];

// ── Demo Complaints ─────────────────────────────────────────────────────────
// These demonstrate the complaint tracking workflow.
// road_name is stored (not a fake internal road_id) — matched to OSM roads by name.
export const complaints = [
  {
    id: 'comp1',
    tracking_token: 'RW-2026-DEMO1',
    road_name: null,       // Filed via map — road matched by GPS
    road_osm_id: null,     // Will be set if user selects OSM road
    category: 'Pothole',
    description: 'Demo complaint: Large pothole causing issues for two-wheelers. (This is a sample complaint to demonstrate the workflow.)',
    severity: 'High',
    latitude: 22.481,
    longitude: 88.391,
    status: 'InProgress',
    routed_to: 'eng1',
    routed_at: '2026-05-10T09:15:00Z',
    seen_at: '2026-05-10T11:30:00Z',
    resolved_at: null,
    resolution_note: null,
    engineer_reply: 'Complaint received. Repair team scheduled. (Demo response)',
    escalated: false,
    escalated_at: null,
    created_at: '2026-05-10T09:15:00Z',
    updated_at: '2026-05-11T10:00:00Z',
  },
  {
    id: 'comp2',
    tracking_token: 'RW-2026-DEMO2',
    road_name: null,
    road_osm_id: null,
    category: 'Flooding',
    description: 'Demo complaint: Water logging after heavy rain, drainage blocked. (Sample complaint)',
    severity: 'High',
    latitude: 13.083,
    longitude: 80.271,
    status: 'Submitted',
    routed_to: 'eng2',
    routed_at: '2026-05-18T14:22:00Z',
    seen_at: null,
    resolved_at: null,
    resolution_note: null,
    engineer_reply: null,
    escalated: false,
    escalated_at: null,
    created_at: '2026-05-18T14:22:00Z',
    updated_at: '2026-05-18T14:22:00Z',
  },
  {
    id: 'comp3',
    tracking_token: 'RW-2026-DEMO3',
    road_name: null,
    road_osm_id: null,
    category: 'Flooding',
    description: 'Demo complaint: Drainage blockage. (Sample resolved complaint)',
    severity: 'Medium',
    latitude: 22.573,
    longitude: 88.364,
    status: 'Resolved',
    routed_to: 'eng1',
    routed_at: '2026-04-20T08:00:00Z',
    seen_at: '2026-04-20T09:00:00Z',
    resolved_at: '2026-04-25T16:00:00Z',
    resolution_note: 'Drainage cleared. (Demo resolution)',
    engineer_reply: 'Issue resolved. (Demo reply)',
    escalated: false,
    escalated_at: null,
    created_at: '2026-04-20T08:00:00Z',
    updated_at: '2026-04-25T16:00:00Z',
  },
];

// No roads, budgets, or repair logs seeded.
// Roads → OpenStreetMap Overpass API (live)
// Budgets → Admin-entered via /api/admin/budgets
// Repair logs → Admin-entered via /api/admin/repair-logs
export const roads = [];
export const budgets = [];
export const repairLogs = [];
