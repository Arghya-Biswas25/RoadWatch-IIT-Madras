import { Router }            from 'express';
import { store }             from '../services/store.js';
import { computeScore, scoreBand } from '../services/scoring.js';
import { NATIONAL_STATS }    from '../services/national-stats.js';
import { fetchAllNews }      from '../services/news.js';

const router = Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  const complaints  = store.getComplaints();
  const contractors = store.getContractors();

  // ── Complaint stats ──────────────────────────────────────────────────────
  const statusCounts   = {}, categoryCounts = {}, byLoc = {};
  for (const c of complaints) {
    statusCounts[c.status]     = (statusCounts[c.status]     || 0) + 1;
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    const area = c.road_name || `(${c.latitude?.toFixed(1)}, ${c.longitude?.toFixed(1)})`;
    byLoc[area] = (byLoc[area] || 0) + 1;
  }

  const topLocations = Object.entries(byLoc)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const resolved     = complaints.filter(c => c.resolved_at);
  const avgResHrs    = resolved.length
    ? Math.round(resolved.reduce((s, c) =>
        s + (new Date(c.resolved_at) - new Date(c.created_at)) / 3_600_000, 0) / resolved.length)
    : null;

  // Monthly volume (last 6 months)
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyVol = {};
  for (const c of complaints) {
    if (new Date(c.created_at) > sixMonthsAgo) {
      const m = c.created_at.slice(0, 7);
      monthlyVol[m] = (monthlyVol[m] || 0) + 1;
    }
  }

  // ── Contractor scores (computed live) ───────────────────────────────────
  const contractorScores = contractors.map(c => {
    const score = computeScore(c.id);
    const band  = scoreBand(score?.overall_score || 0);
    return { id: c.id, name: c.name, state: c.state, note: c.note, ...score, band };
  }).sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));

  // ── News (live from GDELT) ───────────────────────────────────────────────
  let news = null;
  try {
    news = await fetchAllNews();
  } catch { /* non-fatal */ }

  res.json({
    complaint_stats: {
      total:      complaints.length,
      open:       complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length,
      resolved:   resolved.length,
      escalated:  complaints.filter(c => c.escalated).length,
      avg_resolution_hours: avgResHrs,
      by_status:    Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      by_category:  Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      by_location:  topLocations,
      monthly_volume: Object.entries(monthlyVol).sort().map(([month, count]) => ({ month, count })),
    },
    contractor_scores: contractorScores,
    national_stats: {
      road_network:  NATIONAL_STATS.road_network,
      nh_network:    NATIONAL_STATS.nh_network,
      pmgsy:         NATIONAL_STATS.pmgsy,
      accidents:     NATIONAL_STATS.accidents,
      budget_2024_25:NATIONAL_STATS.budget_2024_25,
      as_of:         NATIONAL_STATS.as_of,
      disclaimer:    NATIONAL_STATS.disclaimer,
      data_portals:  NATIONAL_STATS.data_portals,
    },
    news,
    data_sources: {
      complaints:   'RoadWatch in-memory store (real citizen submissions + demo seeds)',
      national_stats:'MoRTH Road Transport Yearbook 2022-23, NHAI Annual Report 2023-24, PMGSY Dec 2024, MoRTH Accident Report 2022, Union Budget 2024-25',
      news:         'GDELT Project API (gdeltproject.org) — last 7 days',
      roads:        'OpenStreetMap Overpass API (served via /api/roads endpoint)',
    },
  });
});

export default router;
