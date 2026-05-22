/**
 * GDELT Project news API — completely free, no key.
 * https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
 * Returns road / infrastructure news relevant to RoadWatch.
 */

import axios from 'axios';

const CACHE = new Map();
const CACHE_TTL_MS = 60 * 60_000; // 1 hour — avoids GDELT 429 rate limits

const QUERIES = {
  infrastructure: 'road infrastructure India pothole',
  accidents:      'road accident India highway',
  budget:         'road budget India ministry transport MoRTH',
  nhai:           'NHAI national highway India project',
};

export async function fetchNews(topic = 'infrastructure', maxRecords = 8) {
  const key = `${topic}_${maxRecords}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const query = QUERIES[topic] || QUERIES.infrastructure;

  try {
    const { data } = await axios.get('https://api.gdeltproject.org/api/v2/doc/doc', {
      params: {
        query:      query,
        mode:       'artlist',
        maxrecords: maxRecords,
        format:     'json',
        timespan:   '7d',
        lang:       'eng',
        sort:       'DateDesc',
      },
      timeout: 15_000,
    });

    const articles = (data?.articles || []).map(a => ({
      title:     a.title,
      url:       a.url,
      source:    a.domain,
      published: a.seendate ? new Date(
        a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')
      ).toISOString() : null,
      language:  a.language,
    }));

    const result = {
      topic,
      query,
      articles,
      fetched_at: new Date().toISOString(),
      source: 'GDELT Project (gdeltproject.org)',
    };

    CACHE.set(key, { data: result, expiry: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (err) {
    console.error('[News] GDELT error:', err.message);
    return { topic, articles: [], error: 'News service temporarily unavailable' };
  }
}

export async function fetchAllNews() {
  const [infra, accidents, budget] = await Promise.allSettled([
    fetchNews('infrastructure', 6),
    fetchNews('accidents', 4),
    fetchNews('budget', 4),
  ]);
  return {
    infrastructure: infra.status === 'fulfilled' ? infra.value : null,
    accidents:      accidents.status === 'fulfilled' ? accidents.value : null,
    budget:         budget.status === 'fulfilled' ? budget.value : null,
  };
}
