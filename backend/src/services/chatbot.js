import { buildRagContext } from './rag.js';
import { getWeather }     from './weather.js';
import { fetchNews }      from './news.js';
import { queryRoadsNear } from './osm.js';
import { reverseGeocode } from './geocoding.js';

/**
 * Build the full system prompt for Kimi K2.6.
 * Context is RAG-retrieved from static corpus PLUS live external data:
 *   - Weather at user location (Open-Meteo)
 *   - Real roads near user (OpenStreetMap Overpass)
 *   - Recent news (GDELT)
 */
export async function buildSystemPrompt(query, lat, lng, role = 'citizen') {
  const { context: ragContext } = buildRagContext(query);

  // Live data — fetch in parallel, never block on failures
  const [weather, nearbyRoads, geo, news] = await Promise.allSettled([
    lat && lng ? getWeather(lat, lng)                : Promise.resolve(null),
    lat && lng ? queryRoadsNear(lat, lng, 4000)      : Promise.resolve([]),
    lat && lng ? reverseGeocode(lat, lng)            : Promise.resolve(null),
    fetchNews('infrastructure', 5),
  ]);

  const w  = weather.status      === 'fulfilled' ? weather.value      : null;
  const r  = nearbyRoads.status  === 'fulfilled' ? nearbyRoads.value  : [];
  const g  = geo.status          === 'fulfilled' ? geo.value          : null;
  const n  = news.status         === 'fulfilled' ? news.value         : null;

  const locationLine = lat && lng
    ? `User location: (${lat.toFixed(4)}, ${lng.toFixed(4)})${g ? ` — ${g.city || g.district || ''}, ${g.state || ''}, ${g.country || ''}`.replace(/^[ ,]+|[ ,]+$/g,'') : ''}.`
    : 'User location: not provided.';

  const roleNote = {
    admin:    'The user is an administrator with full system access.',
    engineer: 'The user is a road engineer managing complaints.',
    citizen:  'The user is a citizen using the public interface.',
  }[role] || 'The user is a citizen.';

  // Format nearby roads from OSM (real, live)
  const roadsSection = r.length > 0
    ? `NEARBY ROADS (from OpenStreetMap — verified real data):\n` +
      r.slice(0, 8).map(rd =>
        `• ${rd.road_name} (${rd.road_type}${rd.road_code ? ', '+rd.road_code : ''})` +
        (rd.surface_type ? ` — surface: ${rd.surface_type}` : '') +
        (rd.lane_count   ? `, ${rd.lane_count} lanes` : '') +
        `. Authority: ${rd.responsible_authority}.` +
        ' Budget/contractor: ' + rd.data_note.slice(0,80) + '…'
      ).join('\n')
    : 'NEARBY ROADS: Unable to fetch from OpenStreetMap for this location.';

  // Format weather
  const weatherSection = w
    ? `CURRENT WEATHER (Open-Meteo — live):\n${w.description}, ${w.temperature_c}°C, wind ${w.wind_kmh} km/h, rain ${w.precipitation_mm}mm.\nRoad risk: ${w.road_risk.level} — ${w.road_risk.note}`
    : 'WEATHER: Not available.';

  // Format news
  const newsSection = n?.articles?.length
    ? `RECENT ROAD/INFRASTRUCTURE NEWS (GDELT — last 7 days):\n` + n.articles.slice(0, 4).map(a => `• ${a.title} (${a.source})`).join('\n')
    : 'NEWS: Not available.';

  return `You are the RoadWatch Assistant — an AI that helps citizens understand road quality, public spending, and infrastructure accountability.

${locationLine} ${roleNote}

KNOWLEDGE BASE (RAG-retrieved from complaints, national stats, routing rules, FAQ):
${ragContext}

${roadsSection}

${weatherSection}

${newsSection}

CRITICAL RULES:
1. Only answer from the data provided above. Never invent road names, contractor names, budget figures, or dates.
2. If data is not in the context, say explicitly: "This information is not available in public APIs. [Suggest: file RTI at rtionline.gov.in / check pfms.nic.in / check nhai.gov.in]"
3. Budget and contractor data are NOT available from any free public API. If asked, explain this clearly and direct to RTI/PFMS.
4. Road condition (Good/Fair/Poor) is not in OSM. Say so if asked.
5. If a user wants to file a complaint, direct them to "Report an Issue" on the home screen.
6. If a user asks to track a complaint, ask for their RW-YYYY-XXXX token.
7. Cite your source when giving statistics (e.g., "according to MoRTH 2022 data").
8. Keep answers concise — 2-5 sentences unless detail is explicitly requested.
9. Format currency as ₹X lakh / ₹X crore (Indian notation).`;
}
