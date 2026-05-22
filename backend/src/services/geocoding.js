/**
 * Nominatim (OpenStreetMap) reverse geocoding — free, no key.
 * https://nominatim.openstreetmap.org/
 * Rate limit: 1 req/sec per IP — we cache aggressively.
 */

import axios from 'axios';

const CACHE = new Map();
const CACHE_TTL_MS = 60 * 60_000; // 1 hour

const HEADERS = {
  'User-Agent': 'RoadWatch-IITMadras-Hackathon/1.0 (arghya6@gmail.com)',
  'Accept-Language': 'en',
};

function parseAddress(addr) {
  return {
    district:   addr.county || addr.city_district || addr.district || addr.city || null,
    state:      addr.state || null,
    country:    addr.country || null,
    country_code: addr.country_code?.toUpperCase() || null,
    postcode:   addr.postcode || null,
    city:       addr.city || addr.town || addr.village || null,
  };
}

export async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon: lng, addressdetails: 1, zoom: 10 },
      headers: HEADERS,
      timeout: 6_000,
    });
    const result = {
      display_name: data.display_name,
      ...parseAddress(data.address || {}),
      source: 'Nominatim / OpenStreetMap',
    };
    CACHE.set(key, { data: result, expiry: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (err) {
    console.error('[Geocoding] Nominatim error:', err.message);
    return null;
  }
}

export async function geocode(query) {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 5, addressdetails: 1, countrycodes: 'in' },
      headers: HEADERS,
      timeout: 6_000,
    });
    return (data || []).map(r => ({
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      type: r.type,
      ...parseAddress(r.address || {}),
    }));
  } catch (err) {
    console.error('[Geocoding] search error:', err.message);
    return [];
  }
}
