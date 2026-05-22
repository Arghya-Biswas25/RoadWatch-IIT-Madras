/**
 * Open-Meteo weather integration — free, no API key required.
 * https://open-meteo.com/en/docs
 */

import axios from 'axios';

const CACHE = new Map();
const CACHE_TTL_MS = 15 * 60_000; // 15 min — weather changes often

// WMO weather interpretation codes
const WMO_DESC = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Heavy drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

function roadRisk(code, precipitation_mm, windspeed) {
  if (code >= 95) return { level: 'High', note: 'Thunderstorm — severely reduced visibility and flooding risk' };
  if (code >= 80 || precipitation_mm > 5) return { level: 'High', note: 'Heavy rain — flooding and pothole risk elevated' };
  if (code >= 61 || precipitation_mm > 1) return { level: 'Medium', note: 'Rain — wet road surface, reduced grip' };
  if ([45, 48].includes(code)) return { level: 'Medium', note: 'Fog — reduced visibility' };
  if (windspeed > 40) return { level: 'Medium', note: 'High winds — debris possible on road' };
  return { level: 'Low', note: 'Conditions normal' };
}

export async function getWeather(lat, lng) {
  const key = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'temperature_2m,precipitation,weathercode,windspeed_10m,rain,relative_humidity_2m',
        hourly: 'precipitation_probability',
        forecast_days: 1,
        timezone: 'Asia/Kolkata',
      },
      timeout: 8_000,
    });

    const c = data.current;
    const code = c.weathercode;
    const precip = c.precipitation ?? 0;
    const wind = c.windspeed_10m ?? 0;
    const risk = roadRisk(code, precip, wind);

    const result = {
      temperature_c:    Math.round(c.temperature_2m ?? 0),
      description:      WMO_DESC[code] ?? 'Unknown',
      precipitation_mm: Math.round(precip * 10) / 10,
      wind_kmh:         Math.round(wind),
      humidity_pct:     c.relative_humidity_2m ?? null,
      weather_code:     code,
      road_risk:        risk,
      source:           'Open-Meteo (open-meteo.com)',
      fetched_at:       new Date().toISOString(),
    };

    CACHE.set(key, { data: result, expiry: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (err) {
    console.error('[Weather] Open-Meteo error:', err.message);
    return null;
  }
}
