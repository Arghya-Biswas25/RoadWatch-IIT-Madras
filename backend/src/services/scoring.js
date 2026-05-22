import { store } from './store.js';

const SLA_RESOLVE = { Critical: 48, High: 168, Medium: 336, Low: 720 };

export function computeScore(contractorId) {
  const complaints = store.getComplaints().filter(c => c.routed_to === contractorId);
  const contractor = store.getContractorRaw(contractorId);  // raw — avoids circular call
  if (!contractor) return null;

  const total = complaints.length || 1;
  const resolved = complaints.filter(c => c.status === 'Resolved');
  const resolvedCount = resolved.length;

  // Component 1: Resolution Rate (0-25)
  const resolutionRateScore = (resolvedCount / total) * 25;

  // Component 2: Response Time (0-25)
  let responsePoints = 0;
  for (const c of resolved) {
    const slaHours = SLA_RESOLVE[c.severity] || 336;
    const resolvedAt = new Date(c.resolved_at);
    const createdAt = new Date(c.created_at);
    const hrs = (resolvedAt - createdAt) / 3_600_000;
    if (hrs <= slaHours) responsePoints += 1;
    else if (hrs <= slaHours * 2) responsePoints += 0.5;
  }
  const responseTimeScore = resolvedCount > 0 ? (responsePoints / resolvedCount) * 25 : 12.5;

  // Component 3: Road Longevity (0-25)
  const assignedRoads = store.getRoads().filter(r => r.contractor_id === contractorId);
  let longevityScore = 12.5;
  if (assignedRoads.length > 0) {
    let total_longevity = 0;
    for (const road of assignedRoads) {
      if (!road.constructed_date || !road.design_lifespan_years) { total_longevity += 12.5; continue; }
      const ageYears = (Date.now() - new Date(road.constructed_date)) / (365.25 * 24 * 3_600_000);
      const ratio = ageYears / road.design_lifespan_years;
      const roadComplaints = complaints.filter(c => c.road_id === road.id).length;
      const threshold = 3;
      let pts = 12.5;
      if (ratio < 0.5 && roadComplaints > threshold) pts = 5;
      else if (ratio > 1.0 && roadComplaints < threshold) pts = 25;
      else pts = 12.5 - (roadComplaints > threshold ? 5 : 0);
      total_longevity += pts;
    }
    longevityScore = total_longevity / assignedRoads.length;
  }

  // Component 4: Repeat Complaint Penalty (0 to -15)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3_600_000);
  const recentByRoad = {};
  for (const c of complaints) {
    if (new Date(c.created_at) > ninetyDaysAgo) {
      recentByRoad[c.road_id] = (recentByRoad[c.road_id] || 0) + 1;
    }
  }
  let penalty = 0;
  for (const count of Object.values(recentByRoad)) {
    if (count > 2) penalty += (count - 2) * 1;
  }
  const repeatPenalty = Math.min(penalty, 15);

  // Component 5: Tenure Bonus (0-10)
  const createdAt = new Date(contractor.created_at || '2020-01-01');
  const tenureYears = (Date.now() - createdAt) / (365.25 * 24 * 3_600_000);
  const loyaltyBonus = Math.min(tenureYears, 10);

  const raw = resolutionRateScore + responseTimeScore + longevityScore - repeatPenalty + loyaltyBonus;
  const maxPossible = 25 + 25 + 25 - 0 + 10; // 85
  const normalised = Math.min(100, Math.max(0, (raw / maxPossible) * 100));

  return {
    overall_score: Math.round(normalised * 10) / 10,
    resolution_rate_score: Math.round(resolutionRateScore * 10) / 10,
    response_time_score: Math.round(responseTimeScore * 10) / 10,
    longevity_score: Math.round(longevityScore * 10) / 10,
    repeat_penalty: repeatPenalty,
    loyalty_bonus: Math.round(loyaltyBonus * 10) / 10,
    total_complaints: complaints.length,
    resolved_complaints: resolvedCount,
    open_complaints: complaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length,
    resolution_rate: Math.round((resolvedCount / total) * 100),
  };
}

export function scoreBand(score) {
  if (score >= 80) return { label: 'Excellent', color: 'green' };
  if (score >= 60) return { label: 'Good', color: 'yellow' };
  if (score >= 40) return { label: 'Below Average', color: 'orange' };
  if (score >= 20) return { label: 'Poor', color: 'red' };
  return { label: 'Critical', color: 'black' };
}
