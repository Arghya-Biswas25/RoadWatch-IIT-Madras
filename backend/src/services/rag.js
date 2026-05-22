/**
 * RAG (Retrieval-Augmented Generation) layer.
 *
 * Document sources — all real, all cited:
 *  1. Live complaints from RoadWatch store
 *  2. Admin-entered contractor profiles
 *  3. National road statistics (MoRTH/NHAI public reports)
 *  4. Routing rules and SLA guide
 *  5. FAQ documents (how to use RoadWatch)
 *  6. Data portal directory (where citizens can find more info)
 *  7. Live weather context (injected per-query)
 *  8. Live news headlines (injected per-query)
 *  9. OSM road data for user area (injected per-query from the calling route)
 *
 * OSM roads are NOT pre-indexed — they're too dynamic and location-specific.
 * They are injected as live context in buildSystemPrompt().
 */

import { store }                         from './store.js';
import { getNationalStatsText, NATIONAL_STATS } from './national-stats.js';

// ─── BM25 Tokenizer ──────────────────────────────────────────────────────────
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

const EXPANSIONS = {
  pothole:    ['complaint','pothole','hole','damage','repair','issue'],
  budget:     ['budget','sanctioned','spent','funds','money','crore','lakh','amount','pfms'],
  contractor: ['contractor','company','builder','engineer','responsible','performance','score'],
  complaint:  ['complaint','issue','report','problem','token','status','track'],
  flood:      ['flooding','waterlogging','drainage','water'],
  score:      ['score','performance','rating','quality','band','excellent','poor'],
  repair:     ['repair','maintenance','relayed','resurfacing','patching'],
  route:      ['route','routing','authority','nhai','pwd','municipal','district','panchayat'],
  nh:         ['national','highway','nh','nhai'],
  sh:         ['state','highway','sh','pwd'],
  mdr:        ['district','mdr','major'],
  pmgsy:      ['pmgsy','rural','village','gram','sadak'],
  rti:        ['rti','right','information','request'],
  news:       ['news','latest','recent','update','accident','project'],
  stats:      ['statistics','stats','total','length','km','network','india'],
};

function expandQuery(query) {
  const lower = query.toLowerCase();
  const extra = [];
  for (const [key, syns] of Object.entries(EXPANSIONS)) {
    if (lower.includes(key)) extra.push(...syns);
  }
  return [...tokenize(query), ...extra];
}

// ─── BM25 ────────────────────────────────────────────────────────────────────
class BM25 {
  constructor(docs, k1 = 1.5, b = 0.75) {
    this.k1 = k1; this.b = b; this.docs = docs;
    this.avgLen = docs.reduce((s, d) => s + d.tokens.length, 0) / (docs.length || 1);
    this.idf    = this._idf(docs);
  }
  _idf(docs) {
    const df = {};
    for (const d of docs) for (const t of new Set(d.tokens)) df[t] = (df[t]||0)+1;
    const N = docs.length, idf = {};
    for (const [t, f] of Object.entries(df)) idf[t] = Math.log((N-f+0.5)/(f+0.5)+1);
    return idf;
  }
  score(terms, doc) {
    const tf = {}; for (const t of doc.tokens) tf[t] = (tf[t]||0)+1;
    let s = 0;
    for (const t of terms) {
      if (!tf[t]) continue;
      const idf = this.idf[t]||0, dl = doc.tokens.length;
      s += idf * (tf[t]*(this.k1+1)) / (tf[t]+this.k1*(1-this.b+this.b*dl/this.avgLen));
      if (doc.title.toLowerCase().includes(t)) s += 2;
    }
    return s;
  }
  retrieve(query, topK = 5) {
    const terms = expandQuery(query);
    return this.docs
      .map(d => ({ d, s: this.score(terms, d) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, topK).map(x => x.d);
  }
}

// ─── Document Builders ───────────────────────────────────────────────────────
function buildComplaintDocs() {
  return store.getComplaints().map(c => {
    const text = [
      `Complaint token: ${c.tracking_token}.`,
      `Category: ${c.category}. Severity: ${c.severity}. Status: ${c.status}.`,
      c.road_name ? `Road: ${c.road_name}.` : `Location: (${c.latitude}, ${c.longitude}).`,
      `Description: ${c.description}`,
      `Filed: ${c.created_at}. Seen: ${c.seen_at||'Not yet'}.`,
      c.engineer_reply ? `Engineer reply: ${c.engineer_reply}` : 'No engineer reply yet.',
      c.resolved_at   ? `Resolved: ${c.resolved_at}. Note: ${c.resolution_note}` : '',
      c.escalated     ? 'ESCALATED to admin.' : '',
    ].filter(Boolean).join(' ');
    return {
      id: `complaint_${c.id}`, type: 'complaint',
      title: `${c.category} complaint (${c.tracking_token}) — Status: ${c.status}`,
      text, tokens: tokenize(text),
      snippet: `Token ${c.tracking_token}: ${c.category} (${c.severity}), status: ${c.status}. ${c.engineer_reply ? 'Engineer replied.' : 'No reply yet.'}`,
    };
  });
}

function buildContractorDocs() {
  return store.getContractors().map(c => {
    const text = [
      `Contractor: ${c.name}. Registration: ${c.registration_no}.`,
      `State: ${c.state}. Account active: ${c.account_active}.`,
      c.performance_score != null
        ? `Performance score: ${c.performance_score}/100.`
        : 'Performance score: not yet computed (no complaints assigned).',
      c.note || '',
    ].join(' ');
    return {
      id: `contractor_${c.id}`, type: 'contractor',
      title: `${c.name} — Contractor Profile`,
      text, tokens: tokenize(text),
      snippet: `${c.name} (${c.state}): Score ${c.performance_score ?? 'N/A'}/100.`,
    };
  });
}

function buildAnalyticsDoc() {
  const complaints = store.getComplaints();
  const byCategory = {}, byStatus = {};
  for (const c of complaints) {
    byCategory[c.category] = (byCategory[c.category]||0)+1;
    byStatus[c.status]     = (byStatus[c.status]    ||0)+1;
  }
  const resolved  = complaints.filter(c => c.resolved_at);
  const avgResHrs = resolved.length
    ? Math.round(resolved.reduce((s,c) => s + (new Date(c.resolved_at)-new Date(c.created_at))/3_600_000, 0) / resolved.length)
    : null;
  const text = [
    `RoadWatch complaint analytics:`,
    `Total complaints: ${complaints.length}. Open: ${complaints.filter(c=>!['Resolved','Closed'].includes(c.status)).length}. Resolved: ${resolved.length}. Escalated: ${complaints.filter(c=>c.escalated).length}.`,
    `Average resolution time: ${avgResHrs != null ? avgResHrs+' hours' : 'N/A'}.`,
    `By category: ${Object.entries(byCategory).map(([k,v])=>`${k}:${v}`).join(', ')}.`,
    `By status: ${Object.entries(byStatus).map(([k,v])=>`${k}:${v}`).join(', ')}.`,
    `Note: Road data comes from OpenStreetMap (live). Budget and contractor data shown only when admin has entered it.`,
  ].join(' ');
  return {
    id: 'analytics_summary', type: 'analytics',
    title: 'RoadWatch Complaint Analytics',
    text, tokens: tokenize(text), snippet: text,
  };
}

function buildNationalStatsDocs() {
  const statsText = getNationalStatsText();
  const docs = [{
    id: 'national_stats_india', type: 'national_stats',
    title: 'India National Road Statistics (MoRTH/NHAI verified data)',
    text: statsText, tokens: tokenize(statsText),
    snippet: `India road network: ${NATIONAL_STATS.road_network.total_km.toLocaleString()} km total. NHs: ${NATIONAL_STATS.road_network.national_highways_km.toLocaleString()} km. Deaths 2022: ${NATIONAL_STATS.accidents.total_deaths.toLocaleString()}. Budget 2024-25: ₹2,78,000 crore.`,
  }];

  // One doc per road type with full authority info
  for (const [type, info] of Object.entries(NATIONAL_STATS.road_types_india)) {
    const text = `${type} road (${info.full_name}): Authority: ${info.authority}. Complaint channel: ${info.complaint_channel}. Total length in India: ${info.total_km?.toLocaleString() ?? 'not separately reported'} km.`;
    docs.push({
      id: `road_type_${type.toLowerCase()}`, type: 'road_type',
      title: `${type} — ${info.full_name}`,
      text, tokens: tokenize(text), snippet: text,
    });
  }
  return docs;
}

function buildRoutingDoc() {
  const rules = store.getRoutingRules();
  const text = [
    'Complaint routing rules in RoadWatch:',
    ...rules.map(r => `${r.road_type} roads in ${r.country} → ${r.authority}.`),
    'If no rule matches, complaint goes to admin queue.',
    'SLA: Critical — seen 4h, resolved 48h. High — 12h/7d. Medium — 48h/14d. Low — 7d/30d.',
    'Unresolved past SLA → auto-escalated.',
    'Citizen receives a tracking token (RW-YYYY-XXXX) on submission.',
    'Citizens track via Track Complaint — no account needed.',
  ].join(' ');
  return {
    id: 'routing_guide', type: 'routing',
    title: 'Complaint Routing and SLA Guide',
    text, tokens: tokenize(text),
    snippet: 'NH→NHAI/MoRTH. SH→State PWD. MDR→District. Urban→Municipal Corp. VR→Panchayat/PMGSY.',
  };
}

function buildDataSourceDocs() {
  return NATIONAL_STATS.data_portals.map(p => ({
    id: `datasource_${p.name.replace(/\s+/g,'_').toLowerCase()}`,
    type: 'data_source',
    title: `Data Source: ${p.name}`,
    text: `${p.name} (${p.url}): ${p.data}. Accessible at ${p.url}.`,
    tokens: tokenize(`${p.name} ${p.data}`),
    snippet: `${p.name}: ${p.data} — ${p.url}`,
  }));
}

function buildFaqDocs() {
  return [
    {
      id: 'faq_complaint', type: 'faq',
      title: 'How to file a road complaint',
      text: 'To report a road issue, go to "Report an Issue". Select the road on the map. Choose a category: Pothole, Flooding, Structural, Signage, Encroachment, or Other. Set severity. Write description. No account needed — completely anonymous. You get a tracking token like RW-YYYY-XXXX. Use Track Complaint to check status.',
      tokens: tokenize('report complaint file pothole anonymous token track'),
      snippet: 'File complaints anonymously. Get a tracking token. No account needed.',
    },
    {
      id: 'faq_data_availability', type: 'faq',
      title: 'What data is available and what is not',
      text: 'RoadWatch shows: Road names and types from OpenStreetMap (live). Current weather from Open-Meteo (live). Complaint status from RoadWatch (live). National statistics from MoRTH/NHAI public reports. Budget and contractor data is NOT available in any public API — it requires RTI filing at rtionline.gov.in or checking pfms.nic.in for expenditure data. Road condition ratings (Good/Fair/Poor) are not in OSM — these require official surveys. Contractor names and assignments are not in any public API.',
      tokens: tokenize('data available not available budget contractor rti pfms public api'),
      snippet: 'Road geometry from OSM (real). Budget/contractor data NOT in public APIs — file RTI or check PFMS.',
    },
    {
      id: 'faq_rti', type: 'faq',
      title: 'How to get road budget and contractor data via RTI',
      text: 'To get specific budget and contractor information for a road: File an RTI (Right to Information) request at rtionline.gov.in. Address it to the PWD/NHAI officer for your state. Ask for: contractor name and registration, contract value, amount spent, work completion date. RTI responses come within 30 days. Fee: ₹10. Alternatively, check PFMS (pfms.nic.in) for scheme-wise expenditure data, or eProcure (eprocure.gov.in) for tender and contractor bid information.',
      tokens: tokenize('rti budget contractor information right information fee days'),
      snippet: 'File RTI at rtionline.gov.in (₹10 fee, 30-day response) to get budget/contractor details.',
    },
    {
      id: 'faq_score', type: 'faq',
      title: 'Contractor performance score methodology',
      text: 'Contractor performance scores are computed from: Resolution rate (0-25 points), Response time vs SLA (0-25 points), Road longevity vs design lifespan (0-25 points), Repeat complaint penalty (up to -15 points), Loyalty/tenure bonus (0-10 points). Score bands: 80-100 Excellent, 60-79 Good, 40-59 Below Average, 20-39 Poor, 0-19 Critical. Scores are computed from real complaint data in RoadWatch — not manually entered.',
      tokens: tokenize('score contractor performance resolution response longevity penalty loyalty band'),
      snippet: 'Score = resolution(25) + response_time(25) + longevity(25) - repeat_penalty(15) + loyalty(10).',
    },
  ];
}

// ─── Retriever cache ─────────────────────────────────────────────────────────
let _retriever = null;
let _lastBuilt = 0;

function getRetriever() {
  const now = Date.now();
  if (!_retriever || now - _lastBuilt > 300_000) {
    const corpus = [
      ...buildComplaintDocs(),
      ...buildContractorDocs(),
      buildAnalyticsDoc(),
      ...buildNationalStatsDocs(),
      buildRoutingDoc(),
      ...buildDataSourceDocs(),
      ...buildFaqDocs(),
    ];
    _retriever = new BM25(corpus);
    _lastBuilt = now;
  }
  return _retriever;
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function buildRagContext(query, topK = 6) {
  const ret = getRetriever();
  const baseline = ret.retrieve('analytics routing rules national statistics data portals', 3);
  const relevant = ret.retrieve(query, topK);
  const seen = new Set(), docs = [];
  for (const d of [...relevant, ...baseline]) {
    if (!seen.has(d.id)) { seen.add(d.id); docs.push(d); }
  }
  return {
    context: docs.map((d,i) => `[${i+1}] [${d.type.toUpperCase()}] ${d.title}\n${d.snippet}`).join('\n\n'),
    sources: docs.map(d => d.type),
  };
}

export function getCorpusStats() {
  const r = getRetriever();
  return {
    total_docs: r.docs.length,
    types: r.docs.reduce((acc,d) => { acc[d.type]=(acc[d.type]||0)+1; return acc; }, {}),
    sources: ['RoadWatch complaints', 'MoRTH/NHAI national stats', 'OpenStreetMap (via routes)', 'Open-Meteo (via routes)', 'GDELT news (via routes)', 'Routing rules', 'FAQ'],
  };
}

export function invalidateCache() { _retriever = null; }
