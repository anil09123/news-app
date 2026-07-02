const NEWS_API_BASE = 'https://newsapi.org/v2';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: 'error',
        message: 'NEWS_API_KEY is missing. Add it in Vercel Project Settings > Environment Variables.',
      });
    }

    const endpoint = req.query.endpoint || 'top-headlines';
    const allowedEndpoints = new Set(['top-headlines', 'everything']);

    if (!allowedEndpoints.has(endpoint)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid news endpoint.',
      });
    }

    const upstreamParams = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
      if (key === 'endpoint' || value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => upstreamParams.append(key, item));
      } else {
        upstreamParams.set(key, value);
      }
    });

    upstreamParams.set('apiKey', apiKey);

    const response = await fetch(`${NEWS_API_BASE}/${endpoint}?${upstreamParams.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NewsPulse/1.0 (+https://github.com/anil09123/news-app)',
      },
    });
    const data = await response.json();

    res.setHeader('Cache-Control', response.ok ? 's-maxage=120, stale-while-revalidate=300' : 'no-store');
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({
      status: 'error',
      message: 'Unable to reach NewsAPI right now. Please try again later.',
    });
  }
}
