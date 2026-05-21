/**
 * RAG (Retrieval-Augmented Generation) layer for RoadWatch chatbot.
 *
 * Architecture:
 *  1. DocumentBuilder  — converts live store data into searchable text chunks
 *  2. BM25Retriever    — scores each chunk against the user query
 *  3. QueryExpander    — adds domain synonyms so "pothole" also hits "complaint", etc.
 *  4. buildRagContext  — top-level export: retrieve + format context for the LLM
 */

import { store } from './store.js';

// ─── Stopwords (minimal domain-appropriate set) ──────────────────────────────
const STOPWORDS = new Set([
  'the','a','an','is','in','on','at','to','of','for','and','or','but',
  'with','from','by','this','that','was','are','has','have','had','be',
  'it','its','as','not','no','so','if','do','will','can','road','roads',
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[₹,.\-()\/:\\]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// ─── Query Expansion ─────────────────────────────────────────────────────────
const EXPANSIONS = {
  pothole:     ['complaint', 'pothole', 'hole', 'damage', 'repair', 'issue'],
  budget:      ['budget', 'sanctioned', 'spent', 'funds', 'money', 'crore', 'lakh', 'amount'],
  contractor:  ['contractor', 'company', 'builder', 'engineer', 'responsible', 'performance', 'score'],
  complaint:   ['complaint', 'issue', 'report', 'problem', 'token', 'status', 'track'],
  flood:       ['flooding', 'waterlogging', 'drainage', 'water'],
  score:       ['score', 'performance', 'rating', 'quality', 'band', 'excellent', 'poor'],
  repair:      ['repair', 'maintenance', 'relayed', 'resurfacing', 'patching', 'reconstruction'],
  route:       ['route', 'routing', 'authority', 'nhai', 'pwd', 'municipal', 'district', 'panchayat'],
  nh:          ['national', 'highway', 'nh'],
  sh:          ['state', 'highway', 'sh'],
  mdr:         ['district', 'mdr', 'major'],
};

function expandQuery(query) {
  const lower = query.toLowerCase();
  const extra = [];
  for (const [key, synonyms] of Object.entries(EXPANSIONS)) {
    if (lower.includes(key)) extra.push(...synonyms);
  }
  return [...tokenize(query), ...extra];
}

// ─── BM25 Retriever ──────────────────────────────────────────────────────────
class BM25 {
  constructor(docs, k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b  = b;
    this.docs = docs;
    this.avgDocLen = docs.reduce((s, d) => s + d.tokens.length, 0) / (docs.length || 1);
    this.idf = this._buildIdf(docs);
  }

  _buildIdf(docs) {
    const df = {};
    for (const doc of docs) {
      for (const term of new Set(doc.tokens)) df[term] = (df[term] || 0) + 1;
    }
    const N = docs.length;
    const idf = {};
    for (const [term, freq] of Object.entries(df)) {
      idf[term] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
    }
    return idf;
  }

  score(queryTerms, doc) {
    const tf = {};
    for (const t of doc.tokens) tf[t] = (tf[t] || 0) + 1;
    const dl = doc.tokens.length;
    let s = 0;
    for (const term of queryTerms) {
      if (!tf[term]) continue;
      const idf = this.idf[term] || 0;
      const num = tf[term] * (this.k1 + 1);
      const den = tf[term] + this.k1 * (1 - this.b + this.b * dl / this.avgDocLen);
      s += idf * (num / den);
      // Title match bonus
      if (doc.title.toLowerCase().includes(term)) s += 2;
    }
    return s;
  }

  retrieve(query, topK = 5) {
    const terms = expandQuery(query);
    return this.docs
      .map(doc => ({ doc, score: this.score(terms, doc) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.doc);
  }
}

// ─── Document Builders ───────────────────────────────────────────────────────
function buildRoadDoc(road) {
  const contractor = store.getContractorById(road.contractor_id);
  const engineer   = store.getUserById(road.engineer_id);
  const budgets    = store.getBudgetsByRoadId(road.id);
  const repairLogs = store.getRepairLogsByRoadId(road.id);
  const complaints = store.getComplaints().filter(c => c.road_id === road.id);
  const open       = complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length;

  const budgetText = budgets.map(b =>
    `FY ${b.financial_year}: ${b.work_type} — sanctioned ₹${(b.amount_sanctioned/100000).toFixed(1)} lakh, ` +
    `spent ₹${(b.amount_spent/100000).toFixed(1)} lakh. Source: ${b.source} (${b.source_scheme}), Authority: ${b.authority}.`
  ).join(' ');

  const repairText = repairLogs.map(r =>
    `${r.work_type} (${r.start_date}–${r.end_date || 'ongoing'}): ${r.work_description}. Quality rating: ${r.quality_rating}/5.`
  ).join(' ');

  const text = [
    `Road: ${road.road_name}. Type: ${road.road_type}. Code: ${road.road_code}.`,
    `Location: ${road.district}, ${road.state}, ${road.country}.`,
    `Length: ${road.length_km} km. Lanes: ${road.lane_count}. Surface: ${road.surface_type}.`,
    `Status: ${road.status}. Designed lifespan: ${road.design_lifespan_years} years.`,
    `Constructed: ${road.constructed_date}. Last relayed: ${road.last_relayed_date}. Next maintenance: ${road.next_maintenance_due}.`,
    contractor ? `Contractor: ${contractor.name} (Reg: ${contractor.registration_no}, State: ${contractor.state}, Score: ${contractor.performance_score}/100).` : 'No contractor assigned.',
    engineer   ? `Responsible Engineer: ${engineer.name}, ${engineer.designation}.` : '',
    budgetText ? `Budget: ${budgetText}` : 'No budget data.',
    repairText ? `Repair history: ${repairText}` : 'No repair history.',
    `Complaints: ${complaints.length} total, ${open} open.`,
  ].filter(Boolean).join(' ');

  return {
    id: `road_${road.id}`,
    type: 'road',
    title: road.road_name,
    text,
    tokens: tokenize(text),
    snippet: `${road.road_name} (${road.road_type}, ${road.status}) — ${road.district}, ${road.state}. ` +
             `Contractor: ${contractor?.name || 'N/A'}. Last relayed: ${road.last_relayed_date}. Open complaints: ${open}.`,
  };
}

function buildComplaintDoc(complaint) {
  const road = store.getRoadById(complaint.road_id);
  const text = [
    `Complaint token: ${complaint.tracking_token}.`,
    `Category: ${complaint.category}. Severity: ${complaint.severity}. Status: ${complaint.status}.`,
    `Road: ${road?.road_name || complaint.road_id} (${road?.road_type || ''}, ${road?.district || ''}).`,
    `Description: ${complaint.description}`,
    `Filed on: ${complaint.created_at}. Seen: ${complaint.seen_at || 'Not yet'}.`,
    complaint.engineer_reply ? `Engineer reply: ${complaint.engineer_reply}` : 'No reply yet.',
    complaint.resolved_at ? `Resolved on ${complaint.resolved_at}. Note: ${complaint.resolution_note}` : '',
    complaint.escalated ? 'ESCALATED to admin.' : '',
  ].filter(Boolean).join(' ');

  return {
    id: `complaint_${complaint.id}`,
    type: 'complaint',
    title: `${complaint.category} complaint on ${road?.road_name || 'unknown road'} (${complaint.tracking_token})`,
    text,
    tokens: tokenize(text),
    snippet: `Token ${complaint.tracking_token}: ${complaint.category} (${complaint.severity}) on ${road?.road_name}. Status: ${complaint.status}.`,
  };
}

function buildContractorDoc(contractor) {
  const roads      = store.getRoads().filter(r => r.contractor_id === contractor.id);
  const complaints = store.getComplaints().filter(c => c.routed_to === contractor.auth_user_id);
  const resolved   = complaints.filter(c => c.status === 'Resolved').length;

  const text = [
    `Contractor: ${contractor.name}. Registration: ${contractor.registration_no}.`,
    `State: ${contractor.state}. Country: ${contractor.country}.`,
    `Contact: ${contractor.contact_email || 'N/A'}, ${contractor.contact_phone || 'N/A'}.`,
    `Performance score: ${contractor.performance_score}/100.`,
    `Manages ${roads.length} roads: ${roads.map(r => r.road_name).join(', ')}.`,
    `Complaints: ${complaints.length} total, ${resolved} resolved, ${complaints.length - resolved} open.`,
    `Account active: ${contractor.account_active}.`,
  ].join(' ');

  return {
    id: `contractor_${contractor.id}`,
    type: 'contractor',
    title: `${contractor.name} — Contractor Profile`,
    text,
    tokens: tokenize(text),
    snippet: `${contractor.name} (${contractor.state}): Score ${contractor.performance_score}/100. ` +
             `Manages ${roads.length} roads. ${resolved}/${complaints.length} complaints resolved.`,
  };
}

function buildAnalyticsDoc() {
  const roads       = store.getRoads();
  const complaints  = store.getComplaints();
  const contractors = store.getContractors();

  const byCategory = {};
  const byStatus   = {};
  const byRoad     = {};
  for (const c of complaints) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byStatus[c.status]     = (byStatus[c.status]     || 0) + 1;
    byRoad[c.road_id]      = (byRoad[c.road_id]      || 0) + 1;
  }

  const topRoad = Object.entries(byRoad)
    .sort((a,b) => b[1]-a[1])[0];
  const topRoadName = topRoad ? store.getRoadById(topRoad[0])?.road_name : 'N/A';

  const resolved     = complaints.filter(c => c.status === 'Resolved');
  const avgResHrs    = resolved.length
    ? Math.round(resolved.reduce((s,c) => s + (new Date(c.resolved_at) - new Date(c.created_at)) / 3_600_000, 0) / resolved.length)
    : null;

  const text = [
    `RoadWatch system analytics:`,
    `Total roads: ${roads.length}. Good: ${roads.filter(r=>r.status==='Good').length}, Fair: ${roads.filter(r=>r.status==='Fair').length}, Poor: ${roads.filter(r=>r.status==='Poor').length}, Critical: ${roads.filter(r=>r.status==='Critical').length}.`,
    `Total complaints: ${complaints.length}. Open: ${complaints.filter(c=>!['Resolved','Closed'].includes(c.status)).length}. Resolved: ${resolved.length}. Escalated: ${complaints.filter(c=>c.escalated).length}.`,
    `Average resolution time: ${avgResHrs != null ? avgResHrs + ' hours' : 'N/A'}.`,
    `Complaints by category: ${Object.entries(byCategory).map(([k,v])=>`${k}:${v}`).join(', ')}.`,
    `Most complained road: ${topRoadName} (${topRoad?.[1] || 0} complaints).`,
    `Contractors: ${contractors.length}. Scores: ${contractors.map(c=>`${c.name} ${c.performance_score}`).join(', ')}.`,
  ].join(' ');

  return {
    id: 'analytics_summary',
    type: 'analytics',
    title: 'RoadWatch System Analytics Summary',
    text,
    tokens: tokenize(text),
    snippet: text,
  };
}

function buildRoutingDoc() {
  const rules = store.getRoutingRules();
  const text = [
    'Complaint routing rules in RoadWatch:',
    ...rules.map(r => `${r.road_type} roads in ${r.country} → ${r.authority}.`),
    'If no rule matches, complaint goes to admin queue for manual routing.',
    'SLA thresholds: Critical — seen within 4 hours, resolved within 48 hours.',
    'High — seen within 12 hours, resolved within 7 days (168 hours).',
    'Medium — seen within 48 hours, resolved within 14 days (336 hours).',
    'Low — seen within 7 days, resolved within 30 days (720 hours).',
    'Unresolved complaints past SLA are automatically escalated.',
    'Citizens receive a unique alphanumeric tracking token (e.g. RW-2026-XJKP) on submission.',
    'Citizens can track complaint status using this token without creating an account.',
  ].join(' ');

  return {
    id: 'routing_guide',
    type: 'routing',
    title: 'Complaint Routing and SLA Guide',
    text,
    tokens: tokenize(text),
    snippet: 'NH → NHAI/MoRTH. SH → State PWD. MDR → District authority. Urban → Municipal Corp. VR → Panchayat/PMGSY.',
  };
}

function buildFaqDocs() {
  return [
    {
      id: 'faq_how_to_complain',
      type: 'faq',
      title: 'How to file a road complaint',
      text: 'To report a road issue, go to the Report an Issue section. Select the road on the map or from the dropdown list. Choose a category such as Pothole, Flooding, Structural damage, Signage, or Encroachment. Set the severity from Low to Critical. Write a description of the problem. You do not need to create an account or provide your name, phone number, or email address. Complaints are completely anonymous. After submission you receive a unique tracking token like RW-2026-XJKP. Use this token in Track Complaint to check the status of your complaint and read any replies from the engineer.',
      tokens: tokenize('report pothole complaint file issue anonymous token track status'),
      snippet: 'File complaints anonymously via Report an Issue. You receive a tracking token to check status.',
    },
    {
      id: 'faq_budget',
      type: 'faq',
      title: 'Budget transparency and public spending',
      text: 'RoadWatch shows complete budget transparency for every road. Budget sources include Central government (via MoRTH, under schemes like NHDP, PMGSY, CRIF), State government (via State PWD, State Roads Development Fund), and Municipal bodies (KMC, CMDA). Each budget entry shows the amount sanctioned, amount spent, financial year, type of work done, the source scheme name, and the authority that sanctioned the funds. Unutilised budget and overspending are both visible. Budget data is entered by administrators.',
      tokens: tokenize('budget sanctioned spent lakh crore funds central state municipal nhdp pmgsy authority transparency'),
      snippet: 'Budget shows sanctioned vs spent per road, source (Central/State/Municipal), scheme name, and authority.',
    },
    {
      id: 'faq_contractor_score',
      type: 'faq',
      title: 'How contractor performance scores work',
      text: 'Contractor performance scores are computed algorithmically from 5 components. Component 1: Resolution rate score (0-25 points) based on percentage of complaints resolved. Component 2: Response time score (0-25 points) based on whether complaints were resolved within SLA. Component 3: Road longevity score (0-25 points) based on whether roads are lasting their designed lifespan without failure. Component 4: Repeat complaint penalty (0 to -15 points) for multiple complaints on the same road within 90 days. Component 5: Loyalty bonus (0-10 points) for years assigned to the same roads. Score bands: 80-100 Excellent, 60-79 Good, 40-59 Below Average, 20-39 Poor, 0-19 Critical.',
      tokens: tokenize('score contractor performance resolution response time longevity repeat penalty loyalty band'),
      snippet: 'Score = resolution rate (25) + response time (25) + road longevity (25) - repeat penalty (15) + loyalty (10).',
    },
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────
let _retriever = null;
let _lastBuilt = 0;

function getRetriever() {
  const now = Date.now();
  // Rebuild index every 5 minutes so live complaint/score changes are reflected
  if (!_retriever || now - _lastBuilt > 300_000) {
    const roads       = store.getRoads().map(buildRoadDoc);
    const complaints  = store.getComplaints().map(buildComplaintDoc);
    const contractors = store.getContractors().map(buildContractorDoc);
    const analytics   = [buildAnalyticsDoc()];
    const routing     = [buildRoutingDoc()];
    const faqs        = buildFaqDocs();

    const corpus = [...roads, ...complaints, ...contractors, ...analytics, ...routing, ...faqs];
    _retriever  = new BM25(corpus);
    _lastBuilt  = now;
  }
  return _retriever;
}

/**
 * Retrieve the most relevant document chunks for a query and return them
 * formatted as a context string to inject into the system prompt.
 *
 * @param {string} query   - User's message
 * @param {number} [topK]  - Number of chunks to retrieve (default 6)
 * @returns {{ context: string, sources: string[] }}
 */
export function buildRagContext(query, topK = 6) {
  const retriever = getRetriever();

  // Always include analytics + routing as baseline context
  const baseline = retriever.retrieve('analytics summary routing rules sla', 2);
  const relevant = retriever.retrieve(query, topK);

  // Deduplicate
  const seen = new Set();
  const docs  = [];
  for (const d of [...relevant, ...baseline]) {
    if (!seen.has(d.id)) { seen.add(d.id); docs.push(d); }
  }

  const context = docs.map((d, i) =>
    `[${i+1}] [${d.type.toUpperCase()}] ${d.title}\n${d.snippet}`
  ).join('\n\n');

  const sources = docs.map(d => d.type);
  return { context, sources };
}

/** Expose for diagnostics */
export function getCorpusStats() {
  const r = getRetriever();
  return { total_docs: r.docs.length, types: r.docs.reduce((acc, d) => { acc[d.type] = (acc[d.type]||0)+1; return acc; }, {}) };
}
