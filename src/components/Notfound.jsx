import { Link } from 'react-router-dom';
import '../styles/Notfound.css';

function Notfound() {
  return (
    <section className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>The story you are looking for moved, expired, or never existed.</p>
        <Link to="/" className="not-found-link">
          Back to headlines
        </Link>
      </div>
    </section>
  );
}

export default Notfound;
