import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { HomeShell } from '@/components/home/shared';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <HomeShell>
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 96 }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="sec-index" style={{ marginBottom: 18 }}>Error / 404</div>
          <h1 className="page-title" style={{ marginBottom: 20 }}>
            Page <span className="serif">not found</span>
          </h1>
          <p style={{ color: 'var(--ink-dim)', maxWidth: '42ch', margin: '0 auto 32px' }}>
            The page you were looking for isn't here — it may have moved, or never existed.
          </p>
          <Link to="/" className="btn btn-fill magnetic" data-cursor="home">
            <span>Return home</span>
          </Link>
        </div>
      </section>
    </HomeShell>
  );
};

export default NotFound;
