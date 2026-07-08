import { useLocation, Link } from 'react-router-dom';
import { HomeShell } from '@/components/home/shared';
import { SEO } from '@/components/SEO';

const NotFound = () => {
  const location = useLocation();
  const path = location.pathname || '/404';

  return (
    <HomeShell>
      <SEO
        path={path}
        title="Page not found — Adrian Idea"
        description="The page you're looking for isn't here. Return to the Adrian Idea homepage, browse our services, or get in touch."
        robots="noindex, follow"
      />
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 96 }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="sec-index" style={{ marginBottom: 18 }}>Error / 404</div>
          <h1 className="page-title" style={{ marginBottom: 20 }}>
            Page <span className="serif">not found</span>
          </h1>
          <p style={{ color: 'var(--ink-dim)', maxWidth: '42ch', margin: '0 auto 32px' }}>
            The page you were looking for isn't here — it may have moved, or never existed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-fill magnetic" data-cursor="home">
              <span>Return home</span>
            </Link>
            <Link to="/services" className="btn btn-line magnetic" data-cursor="go">
              <span>Our services</span>
            </Link>
            <Link to="/contact" className="btn btn-line magnetic" data-cursor="mail">
              <span>Contact us</span>
            </Link>
          </div>
        </div>
      </section>
    </HomeShell>
  );
};

export default NotFound;
