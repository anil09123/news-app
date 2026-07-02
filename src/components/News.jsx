import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import newsimg from '../assets/newsimg.jpg';
import Loader from './Loader';
import { DEFAULT_PAGE_SIZE, fetchNews } from '../services/newsService';

const categoryLabels = {
  general: 'Top Headlines',
  technology: 'Technology',
  business: 'Business',
  sports: 'Sports',
  health: 'Health',
  science: 'Science',
  entertainment: 'Entertainment',
};

const featuredCategories = ['technology', 'business', 'sports', 'health', 'science', 'entertainment'];
const trendingTopics = ['AI', 'Markets', 'Cricket', 'Startups', 'Climate'];

function safeDecode(value = '') {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function cleanArticles(articles) {
  const seenUrls = new Set();

  return articles
    .filter((article) => article?.title && article.title !== '[Removed]')
    .filter((article) => {
      if (!article.url || seenUrls.has(article.url)) return false;
      seenUrls.add(article.url);
      return true;
    });
}

function mergeArticles(previousArticles, nextArticles) {
  const seenUrls = new Set(previousArticles.map((article) => article.url).filter(Boolean));
  const cleanedNextArticles = cleanArticles(nextArticles);
  const uniqueNextArticles = cleanedNextArticles.filter((article) => {
    if (seenUrls.has(article.url)) return false;
    seenUrls.add(article.url);
    return true;
  });

  return {
    mergedArticles: [...previousArticles, ...uniqueNextArticles],
    newArticlesCount: uniqueNextArticles.length,
  };
}

function News() {
  const [newsData, setNewsData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [show, setShow] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const loaderRef = useRef(null);
  const { category = 'general', query = '' } = useParams();
  const decodedQuery = safeDecode(query || '');

  const pageTitle = decodedQuery ? `Search results for “${decodedQuery}”` : categoryLabels[category] || 'Top Headlines';
  const pageSubtitle = decodedQuery
    ? 'Latest matching stories from trusted publishers, arranged in a clean reading layout.'
    : 'A sharper live news dashboard with smooth cards, quick previews and zero clutter.';

  useEffect(() => {
    const controller = new AbortController();

    async function loadFirstPage() {
      setLoading(true);
      setLoadingMore(false);
      setErrorMessage('');
      setNewsData([]);
      setPage(1);
      setTotalResults(0);
      setHasMore(false);

      try {
        const payload = await fetchNews({
          category,
          query: decodedQuery,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          signal: controller.signal,
        });
        const articles = cleanArticles(payload.articles);
        setNewsData(articles);
        setTotalResults(payload.totalResults);
        setHasMore(articles.length >= DEFAULT_PAGE_SIZE && (!payload.totalResults || articles.length < payload.totalResults));
      } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        const message = error.response?.data?.message || error.message || 'Unable to fetch news right now.';
        setErrorMessage(message);
        setNewsData([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFirstPage();

    return () => controller.abort();
  }, [category, decodedQuery]);

  const loadMoreNews = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    setErrorMessage('');

    try {
      const payload = await fetchNews({
        category,
        query: decodedQuery,
        page: nextPage,
        pageSize: DEFAULT_PAGE_SIZE,
      });

      const { mergedArticles, newArticlesCount } = mergeArticles(newsData, payload.articles);
      const providerTotal = payload.totalResults || totalResults;

      setNewsData(mergedArticles);
      setTotalResults(providerTotal);
      setHasMore(newArticlesCount > 0 && mergedArticles.length < providerTotal);
      setPage(nextPage);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to load more news right now.';
      setErrorMessage(message);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [category, decodedQuery, hasMore, loading, loadingMore, newsData, page, totalResults]);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target || !hasMore || loading || loadingMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreNews();
      },
      { root: null, rootMargin: '420px 0px', threshold: 0.1 },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loadMoreNews, loading, loadingMore]);

  const leadArticle = newsData[0];
  const articleList = useMemo(() => (leadArticle ? newsData.slice(1) : newsData), [leadArticle, newsData]);
  const publisherCount = useMemo(
    () => new Set(newsData.map((article) => article.source?.name).filter(Boolean)).size,
    [newsData],
  );
  const latestUpdate = useMemo(() => {
    const validDates = newsData.map((article) => article.publishedAt).filter(Boolean).sort().reverse();
    return validDates[0] ? formatDate(validDates[0]) : 'Live';
  }, [newsData]);

  const loadedLabel = totalResults ? `${newsData.length} / ${totalResults}` : newsData.length;

  const handleClose = () => {
    setShow(false);
    setSelectedArticle(null);
  };

  const handleShow = (article) => {
    setSelectedArticle(article);
    setShow(true);
  };

  const handleCardPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  if (loading) return <Loader />;

  return (
    <div className="news-page">
      <section className="ticker-strip" aria-label="Trending topics">
        <span>Trending now</span>
        <div>
          {trendingTopics.map((topic) => (
            <Link key={topic} to={`/search/${encodeURIComponent(topic)}`}>
              #{topic}
            </Link>
          ))}
        </div>
      </section>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-orb hero-orb-one" />
          <span className="hero-orb hero-orb-two" />
          <span className="eyebrow">Live news dashboard</span>
          <h1>{pageTitle}</h1>
          <p>{pageSubtitle}</p>
          <div className="hero-actions">
            {featuredCategories.map((item) => (
              <Link key={item} to={`/category/${item}`} className={category === item ? 'topic-pill active' : 'topic-pill'}>
                {categoryLabels[item]}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-pulse">
            <span />
            <span />
            <span />
          </div>
          <span>Loaded</span>
          <strong>{newsData.length}</strong>
          <small>{hasMore ? 'scroll for more' : 'stories loaded'}</small>
        </div>
      </section>

      <section className="insight-row" aria-label="News stats">
        <div className="insight-card">
          <span>Stories</span>
          <strong>{loadedLabel}</strong>
        </div>
        <div className="insight-card">
          <span>Publishers</span>
          <strong>{publisherCount || '—'}</strong>
        </div>
        <div className="insight-card wide">
          <span>Latest update</span>
          <strong>{latestUpdate}</strong>
        </div>
      </section>

      {errorMessage && newsData.length === 0 && (
        <section className="status-card error-card">
          <h2>News fetch failed</h2>
          <p>{errorMessage}</p>
          <small>
            On live deployment, set NEWS_API_KEY on the server and use the included proxy route /api/news.
          </small>
        </section>
      )}

      {!errorMessage && newsData.length === 0 && (
        <section className="status-card empty-card">
          <h2>No news found</h2>
          <p>Try another keyword or category.</p>
        </section>
      )}

      {leadArticle && !errorMessage && (
        <section className="lead-story">
          <div className="lead-image-wrap">
            <img src={leadArticle.urlToImage || newsimg} alt={leadArticle.title} loading="eager" />
          </div>
          <div className="lead-content">
            <span className="source-badge">{leadArticle.source?.name || 'News source'}</span>
            <h2>{leadArticle.title}</h2>
            <p>{leadArticle.description || 'No description available for this story.'}</p>
            <div className="story-meta">
              <span>{formatDate(leadArticle.publishedAt)}</span>
              <span>{leadArticle.author || 'Editorial desk'}</span>
            </div>
            <div className="story-actions">
              <Button onClick={() => handleShow(leadArticle)} className="primary-action">
                Quick view
              </Button>
              <a href={leadArticle.url} target="_blank" rel="noopener noreferrer" className="secondary-action">
                Open source
              </a>
            </div>
          </div>
        </section>
      )}

      {!errorMessage && articleList.length > 0 && (
        <section className="news-grid" aria-label="News articles">
          {articleList.map((article, index) => (
            <article
              className="news-card"
              key={article.url || index}
              onMouseMove={handleCardPointerMove}
              style={{ '--delay': `${Math.min(index * 45, 450)}ms` }}
            >
              <div className="card-image-wrap">
                <img src={article.urlToImage || newsimg} alt={article.title} loading="lazy" />
                <span className="source-badge floating">{article.source?.name || 'News'}</span>
              </div>
              <div className="news-card-body">
                <span className="date-text">{formatDate(article.publishedAt)}</span>
                <h3>{article.title}</h3>
                <p>{article.description || 'No description available for this story.'}</p>
                <div className="card-footer-actions">
                  <Button onClick={() => handleShow(article)} className="read-more-btn">
                    Read more
                  </Button>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" aria-label={`Open article: ${article.title}`}>
                    ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!errorMessage && newsData.length > 0 && (
        <section className="load-more-wrap" ref={loaderRef} aria-live="polite">
          {loadingMore && (
            <div className="inline-loader">
              <span />
              <p>Loading more stories...</p>
            </div>
          )}
          {!loadingMore && hasMore && (
            <Button type="button" onClick={loadMoreNews} className="load-more-btn">
              Load more stories
            </Button>
          )}
          {!loadingMore && !hasMore && <p className="end-message">You are all caught up.</p>}
        </section>
      )}

      {errorMessage && newsData.length > 0 && (
        <section className="status-card error-card partial-error">
          <h2>More stories could not load</h2>
          <p>{errorMessage}</p>
        </section>
      )}

      <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="article-modal">
        <Modal.Header closeButton>
          <Modal.Title>{selectedArticle?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            className="modal-article-image"
            src={selectedArticle?.urlToImage || newsimg}
            alt={selectedArticle?.title || 'News article'}
          />
          <div className="modal-meta">
            <span>{selectedArticle?.source?.name || 'News source'}</span>
            <span>{formatDate(selectedArticle?.publishedAt)}</span>
          </div>
          <p>
            <strong>Author:</strong> {selectedArticle?.author || 'Unknown'}
          </p>
          <p>{selectedArticle?.description || 'No description available.'}</p>
          <p>{selectedArticle?.content || 'Full content preview is not available from the API.'}</p>
          <div className="modal-actions">
            <a href={selectedArticle?.url} target="_blank" rel="noopener noreferrer" className="modal-source-link">
              Read full article
            </a>
            <Button type="button" variant="light" onClick={handleClose} className="modal-close-link">
              Close preview
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default News;
