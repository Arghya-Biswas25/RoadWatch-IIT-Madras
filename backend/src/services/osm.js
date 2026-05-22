/**
 * OpenStreetMap Overpass API integration.
 * Returns real road data for any lat/lng — no fabrication, no seeds.
 * Rate limit: Overpass public instances ask for ≤1 req/2 sec per IP.
 * We cache aggressively (30 min) to stay within limits.
 */

import axios from 'axios';

// overpass-api.de returns 406 in some environments; kumi.systems is a stable public mirror
const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';
const CACHE = new Map();          // key → { data, expiry }
const CACHE_TTL_MS = 30 * 60_000; // 30 min

// OSM highway tag → our road type
const HIGHWAY_TO_TYPE = {
  motorway:       'NH',
  motorway_link:  'NH',
  trunk:          'NH',
  trunk_link:     'NH',
  primary:        'SH',
  primary_link:   'SH',
  secondary:      'MDR',
  secondary_link: 'MDR',
  tertiary:       'ODR',
  tertiary_link:  'ODR',
  residential:    'Urban',
  living_street:  'Urban',
  service:        'Urban',
  unclassified:   'Other',
  road:           'Other',
};

const TYPE_AUTHORITY = {
  NH:    'NHAI / MoRTH',
  SH:    'State PWD',
  MDR:   "District Collector's Office",
  ODR:   "District Collector's Office",
  Urban: 'Municipal Corporation',
  VR:    'Panchayati Raj / PMGSY',
  Other: 'Relevant local authority',
};

function cacheKey(lat, lng, radius) {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
}

function normalizeRoad(way) {
  const tags = way.tags || {};
  const lat  = way.center?.lat ?? way.lat;
  const lng  = way.center?.lon ?? way.lon;
  const type = HIGHWAY_TO_TYPE[tags.highway] || 'Other';
  const name = tags.name || tags['name:en'] || tags.ref
    || `${tags.highway?.replace(/_/g, ' ')} road (unnamed)`;

  return {
    id:                   `osm_${way.id}`,
    osm_id:               way.id,
    road_name:            name,
    road_type:            type,
    road_code:            tags.ref || null,
    state:                null,   // filled by caller via reverse geocode
    district:             null,
    country:              'India',
    lat,
    lng,
    surface_type:         tags.surface || null,
    lane_count:           tags.lanes ? parseInt(tags.lanes, 10) : null,
    max_speed_kmh:        tags.maxspeed?.replace(/[^0-9]/g, '') || null,
    oneway:               tags.oneway === 'yes',
    access:               tags.access || null,
    status:               'Unknown',   // OSM does not publish condition ratings
    // Administrative fields — not in any public API
    contractor_id:        null,
    engineer_id:          null,
    last_relayed_date:    null,
    constructed_date:     null,
    next_maintenance_due: null,
    design_lifespan_years:null,
    budget_data:          null,
    // Responsible authority derived from road type
    responsible_authority: TYPE_AUTHORITY[type] || TYPE_AUTHORITY.Other,
    data_source:          'OpenStreetMap',
    data_note:            'Budget, contractor, and maintenance data are not available in public APIs. ' +
                          'File an RTI at https://rtionline.gov.in/ or check https://pfms.nic.in/ for expenditure data.',
  };
}

/**
 * Query OSM Overpass for roads within `radius` metres of (lat, lng).
 * Returns an array of normalised road objects.
 */
export async function queryRoadsNear(lat, lng, radius = 5000) {
  const key = cacheKey(lat, lng, radius);
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const query = `
[out:json][timeout:20];
(
  way["highway"]["name"](around:${radius},${lat},${lng});
  way["highway"]["ref"](around:${radius},${lat},${lng});
);
out center tags qt;`.trim();

  try {
    const { data } = await axios.get(OVERPASS_URL, {
      params: { data: query },
      timeout: 25_000,
    });

    const roads = (data.elements || [])
      .filter(el => el.type === 'way')
      .map(normalizeRoad)
      // Deduplicate by name + type (one entry per named road segment)
      .filter((r, i, arr) =>
        arr.findIndex(x => x.road_name === r.road_name && x.road_type === r.road_type) === i
      )
      .sort((a, b) => {
        // Surface roads and named NHs first
        const priority = { NH: 0, SH: 1, MDR: 2, ODR: 3, Urban: 4, Other: 5 };
        return (priority[a.road_type] ?? 5) - (priority[b.road_type] ?? 5);
      })
      .slice(0, 50); // cap at 50 per area

    CACHE.set(key, { data: roads, expiry: Date.now() + CACHE_TTL_MS });
    return roads;
  } catch (err) {
    console.error('[OSM] Overpass error:', err.message);
    return [];
  }
}

/**
 * Look up a single OSM way by ID.
 * Checks all cached results first, then fetches if needed.
 */
export async function getRoadByOsmId(osmId) {
  // Search all cache buckets
  for (const { data } of CACHE.values()) {
    const found = data.find(r => String(r.osm_id) === String(osmId));
    if (found) return found;
  }
  // Direct lookup
  const query = `[out:json][timeout:10];way(${osmId});out center tags;`;
  try {
    const { data } = await axios.get(OVERPASS_URL, {
      params: { data: query },
      timeout: 12_000,
    });
    const el = (data.elements || [])[0];
    return el ? normalizeRoad(el) : null;
  } catch {
    return null;
  }
}

export function clearOsmCache() {
  CACHE.clear();
}
