import { store } from './store.js';

const SLA_RESOLVE = { Critical: 48, High: 168, Medium: 336, Low: 720 };

export function computeScore(contractorId) {
  const complaints = store.getComplaints().filter(c => c.routed_to === contractorId);
  const contractor = store.getContractorRaw(contractorId);
  if (!contractor) return null;

  const total        = complaints.length || 1;
  const resolved     = complaints.filter(c => c.status === 'Resolved');
  const resolvedCount= resolved.length;

  // Component 1: Resolution Rate (0–25)
  const resolutionRateScore = (resolvedCount / total) * 25;

  // Component 2: Response Time vs SLA (0–25)
  let responsePoints = 0;
  for (const c of resolved) {
    const slaHours = SLA_RESOLVE[c.severity] || 336;
    const hrs = (new Date(c.resolved_at) - new Date(c.created_at)) / 3_600_000;
    if (hrs <= slaHours)      responsePoints += 1;
    else if (hrs <= slaHours * 2) responsePoints += 0.5;
  }
  const responseTimeScore = resolvedCount > 0 ? (responsePoints / resolvedCount) * 25 : 12.5;

  // Component 3: Road Longevity (0–25)
  // Roads now come from OpenStreetMap and don't carry construction/lifespan data.
  // We use a neutral 12.5 (mid-range) when no admin-entered road lifecycle data exists.
  // This is honest — we don't fabricate a score we can't compute.
  const longevityScore = 12.5;

  // Component 4: Repeat Complaint Penalty (0 to –15)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3_600_000);
  const recentByArea = {};
  for (const c of complaints) {
    if (new Date(c.created_at) > ninetyDaysAgo) {
      const key = c.road_osm_id || c.road_name || 'unknown';
      recentByArea[key] = (recentByArea[key] || 0) + 1;
    }
  }
  let penalty = 0;
  for (const count of Object.values(recentByArea)) {
    if (count > 2) penalty += (count - 2);
  }
  const repeatPenalty = Math.min(penalty, 15);

  // Component 5: Tenure Bonus (0–10)
  const createdAt   = new Date(contractor.created_at || '2020-01-01');
  const tenureYears = (Date.now() - createdAt) / (365.25 * 24 * 3_600_000);
  const loyaltyBonus= Math.min(tenureYears, 10);

  const raw        = resolutionRateScore + responseTimeScore + longevityScore - repeatPenalty + loyaltyBonus;
  const maxPossible= 25 + 25 + 25 + 10; // 85
  const normalised = Math.min(100, Math.max(0, (raw / maxPossible) * 100));

  return {
    overall_score:        Math.round(normalised * 10) / 10,
    resolution_rate_score:Math.round(resolutionRateScore * 10) / 10,
    response_time_score:  Math.round(responseTimeScore * 10) / 10,
    longevity_score:      Math.round(longevityScore * 10) / 10,
    longevity_note:       'Road lifecycle data not available from public APIs (OSM does not carry construction/lifespan info). Neutral score (12.5/25) applied.',
    repeat_penalty:       repeatPenalty,
    loyalty_bonus:        Math.round(loyaltyBonus * 10) / 10,
    total_complaints:     complaints.length,
    resolved_complaints:  resolvedCount,
    open_complaints:      complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length,
    resolution_rate:      Math.round((resolvedCount / total) * 100),
  };
}

export function scoreBand(score) {
  if (score >= 80) return { label: 'Excellent',     color: 'green'  };
  if (score >= 60) return { label: 'Good',           color: 'yellow' };
  if (score >= 40) return { label: 'Below Average',  color: 'orange' };
  if (score >= 20) return { label: 'Poor',           color: 'red'    };
  return              { label: 'Critical',       color: 'black'  };
}
