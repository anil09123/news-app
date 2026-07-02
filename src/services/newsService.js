import axios from 'axios';

const DIRECT_NEWS_API_BASE = 'https://newsapi.org/v2';
const PROXY_NEWS_API_BASE = '/api/news';
const DEFAULT_PAGE_SIZE = 12;

function getEndpoint({ query }) {
  return query ? 'everything' : 'top-headlines';
}

function buildParams({ category = 'general', query = '', page = 1, pageSize = DEFAULT_PAGE_SIZE }) {
  const endpoint = getEndpoint({ query });
  const params = new URLSearchParams();

  params.set('pageSize', String(pageSize));
  params.set('page', String(page));

  if (query) {
    params.set('q', query);
    params.set('language', 'en');
    params.set('sortBy', 'publishedAt');
  } else {
    params.set('country', 'us');
    params.set('category', category || 'general');
  }

  return { endpoint, params };
}

function getRequestUrl(endpoint, params) {
  const clientKey = import.meta.env.VITE_NEWS_API_KEY;

  // Local development can still use NewsAPI directly if a Vite env key exists.
  // Production should use the server-side proxy so the API key is never exposed.
  if (import.meta.env.DEV && clientKey) {
    params.set('apiKey', clientKey);
    return `${DIRECT_NEWS_API_BASE}/${endpoint}?${params.toString()}`;
  }

  params.set('endpoint', endpoint);
  return `${PROXY_NEWS_API_BASE}?${params.toString()}`;
}

export async function fetchNews({ category = 'general', query = '', page = 1, pageSize = DEFAULT_PAGE_SIZE, signal } = {}) {
  const safeQuery = query.trim();
  const { endpoint, params } = buildParams({ category, query: safeQuery, page, pageSize });
  const url = getRequestUrl(endpoint, params);

  const response = await axios.get(url, { signal });
  const payload = response.data;

  if (payload?.status === 'error') {
    throw new Error(payload.message || 'Unable to fetch news right now.');
  }

  return {
    articles: Array.isArray(payload?.articles) ? payload.articles : [],
    totalResults: Number(payload?.totalResults || 0),
  };
}

export { DEFAULT_PAGE_SIZE };
