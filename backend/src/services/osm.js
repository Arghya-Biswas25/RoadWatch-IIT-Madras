/**
 * OpenStreetMap Overpass API integration.
 * Returns real road data for any lat/lng — no fabrication, no seeds.
 *
 * Uses multiple public mirrors with automatic fallback.
 * Results cached for 1 hour to stay within public rate limits.
 */

import axios from 'axios';

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const CACHE = new Map();
const CACHE_TTL_MS = 60 * 60_000; // 1 hour

const HIGHWAY_TO_TYPE = {
  motorway: 'NH', motorway_link: 'NH', trunk: 'NH', trunk_link: 'NH',
  primary: 'SH', primary_link: 'SH',
  secondary: 'MDR', secondary_link: 'MDR',
  tertiary: 'ODR', tertiary_link: 'ODR',
  residential: 'Urban', living_street: 'Urban', service: 'Urban',
  unclassified: 'Other', road: 'Other',
};

const TYPE_AUTHORITY = {
  NH: 'NHAI / MoRTH', SH: 'State PWD',
  MDR: "District Collector's Office", ODR: "District Collector's Office",
  Urban: 'Municipal Corporation', VR: 'Panchayati Raj / PMGSY',
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
    || `${(tags.highway || 'road').replace(/_/g, ' ')} (unnamed)`;

  return {
    id:                    `osm_${way.id}`,
    osm_id:                way.id,
    road_name:             name,
    road_type:             type,
    road_code:             tags.ref || null,
    state:                 null,
    district:              null,
    country:               'India',
    lat, lng,
    surface_type:          tags.surface || null,
    lane_count:            tags.lanes ? parseInt(tags.lanes, 10) : null,
    max_speed_kmh:         tags.maxspeed?.replace(/[^0-9]/g, '') || null,
    oneway:                tags.oneway === 'yes',
    access:                tags.access || null,
    status:                'Unknown',
    contractor_id:         null,
    engineer_id:           null,
    last_relayed_date:     null,
    constructed_date:      null,
    next_maintenance_due:  null,
    design_lifespan_years: null,
    budget_data:           null,
    responsible_authority: TYPE_AUTHORITY[type] || TYPE_AUTHORITY.Other,
    data_source:           'OpenStreetMap',
    data_note:             'Budget, contractor, and maintenance data are not available in public APIs. ' +
                           'File an RTI at https://rtionline.gov.in/ or check https://pfms.nic.in/ for expenditure data.',
  };
}

async function fetchFromOverpass(query, timeoutMs = 20_000) {
  let lastErr;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const { data } = await axios.get(mirror, {
        params: { data: query },
        timeout: timeoutMs,
      });
      return data;
    } catch (err) {
      lastErr = err;
      console.warn(`[OSM] Mirror ${mirror.split('/')[2]} failed: ${err.message}`);
    }
  }
  console.error('[OSM] All mirrors failed:', lastErr?.message);
  return null;
}

export async function queryRoadsNear(lat, lng, radius = 5000) {
  const key = cacheKey(lat, lng, radius);
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const query = `[out:json][timeout:20];(way["highway"]["name"](around:${radius},${lat},${lng});way["highway"]["ref"](around:${radius},${lat},${lng}););out center tags qt;`;

  const data = await fetchFromOverpass(query);
  if (!data) return [];

  const roads = (data.elements || [])
    .filter(el => el.type === 'way')
    .map(normalizeRoad)
    .filter((r, i, arr) =>
      arr.findIndex(x => x.road_name === r.road_name && x.road_type === r.road_type) === i
    )
    .sort((a, b) => {
      const p = { NH: 0, SH: 1, MDR: 2, ODR: 3, Urban: 4, Other: 5 };
      return (p[a.road_type] ?? 5) - (p[b.road_type] ?? 5);
    })
    .slice(0, 50);

  CACHE.set(key, { data: roads, expiry: Date.now() + CACHE_TTL_MS });
  return roads;
}

export async function getRoadByOsmId(osmId) {
  for (const { data } of CACHE.values()) {
    const found = data.find(r => String(r.osm_id) === String(osmId));
    if (found) return found;
  }
  const query = `[out:json][timeout:10];way(${osmId});out center tags;`;
  const data = await fetchFromOverpass(query, 12_000);
  if (!data) return null;
  const el = (data.elements || [])[0];
  return el ? normalizeRoad(el) : null;
}

export function clearOsmCache() { CACHE.clear(); }
