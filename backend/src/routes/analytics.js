import { Router } from 'express';
import { store } from '../services/store.js';
import { computeScore, scoreBand } from '../services/scoring.js';

const router = Router();

// GET /api/analytics — public analytics
router.get('/', (req, res) => {
  const complaints = store.getComplaints();
  const roads = store.getRoads();
  const contractors = store.getContractors();
  const budgets = store.getBudgets();

  // Complaints by status
  const statusCounts = {};
  for (const c of complaints) {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  }

  // Complaints by category
  const categoryCounts = {};
  for (const c of complaints) {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  }

  // Complaints by road (top 10)
  const byRoad = {};
  for (const c of complaints) {
    byRoad[c.road_id] = (byRoad[c.road_id] || 0) + 1;
  }
  const topRoads = Object.entries(byRoad)
    .map(([roadId, count]) => ({ road: store.getRoadById(roadId)?.road_name || roadId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Road quality distribution
  const qualityDist = {};
  for (const r of roads) {
    qualityDist[r.status] = (qualityDist[r.status] || 0) + 1;
  }

  // Budget utilisation by district
  const budgetByDistrict = {};
  for (const b of budgets) {
    const road = store.getRoadById(b.road_id);
    const district = road?.district || 'Unknown';
    if (!budgetByDistrict[district]) budgetByDistrict[district] = { sanctioned: 0, spent: 0 };
    budgetByDistrict[district].sanctioned += b.amount_sanctioned;
    budgetByDistrict[district].spent += b.amount_spent;
  }

  // Average resolution time
  const resolved = complaints.filter(c => c.resolved_at);
  const avgResolutionHrs = resolved.length > 0
    ? resolved.reduce((sum, c) => sum + (new Date(c.resolved_at) - new Date(c.created_at)) / 3_600_000, 0) / resolved.length
    : null;

  // Monthly complaint volume (last 6 months)
  const monthlyVolume = {};
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  for (const c of complaints) {
    if (new Date(c.created_at) > sixMonthsAgo) {
      const month = c.created_at.slice(0, 7); // YYYY-MM
      monthlyVolume[month] = (monthlyVolume[month] || 0) + 1;
    }
  }

  // Contractor scores
  const contractorScores = contractors.map(c => {
    const score = computeScore(c.id);
    const band = scoreBand(score?.overall_score || 0);
    return { id: c.id, name: c.name, state: c.state, ...score, band };
  }).sort((a, b) => b.overall_score - a.overall_score);

  res.json({
    summary: {
      total_complaints: complaints.length,
      total_roads: roads.length,
      total_contractors: contractors.length,
      resolved_complaints: resolved.length,
      open_complaints: complaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length,
      escalated_complaints: complaints.filter(c => c.escalated).length,
      avg_resolution_hours: avgResolutionHrs ? Math.round(avgResolutionHrs) : null,
      critical_roads: roads.filter(r => r.status === 'Critical').length,
    },
    complaints_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    complaints_by_category: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
    top_complaint_roads: topRoads,
    road_quality_distribution: Object.entries(qualityDist).map(([status, count]) => ({ status, count })),
    budget_by_district: Object.entries(budgetByDistrict).map(([district, data]) => ({ district, ...data })),
    monthly_volume: Object.entries(monthlyVolume).sort().map(([month, count]) => ({ month, count })),
    contractor_scores: contractorScores,
  });
});

export default router;
