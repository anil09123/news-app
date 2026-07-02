import { useEffect, useMemo, useState } from 'react';
import { Navbar, Container, Nav, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const categories = [
  { label: 'Home', path: '/' },
  { label: 'Technology', path: '/category/technology' },
  { label: 'Business', path: '/category/business' },
  { label: 'Sports', path: '/category/sports' },
  { label: 'Health', path: '/category/health' },
  { label: 'Science', path: '/category/science' },
];

function NavigationBar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentSearchQuery = useMemo(() => {
    const match = location.pathname.match(/^\/search\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : '';
  }, [location.pathname]);

  useEffect(() => {
    setSearch(currentSearchQuery);
  }, [currentSearchQuery]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      navigate('/');
      return;
    }

    navigate(`/search/${encodeURIComponent(trimmedSearch)}`);
  };

  return (
    <Navbar expand="lg" fixed="top" className={scrolled ? 'app-navbar is-scrolled' : 'app-navbar'}>
      <Container fluid className="nav-container">
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          <span className="brand-icon">N</span>
          <span>NewsPulse</span>
          <small className="brand-live">LIVE</small>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="category-nav me-auto">
            {categories.map((item) => (
              <Nav.Link key={item.path} as={NavLink} to={item.path} end={item.path === '/'}>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <Form className="search-box" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search politics, tech, sports..."
              aria-label="Search news"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" className="search-button">
              Go
            </Button>
          </Form>

          <Button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            <span className="theme-icon" aria-hidden="true">
              {isDarkMode ? '☼' : '☾'}
            </span>
            <span className="theme-text">{isDarkMode ? 'Light' : 'Dark'}</span>
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
