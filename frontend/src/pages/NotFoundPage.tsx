import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--pink-primary)', marginBottom: '0.75rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>
        There’s nothing here.
      </h2>
      <button className="btn-primary" onClick={() => navigate('/')}>
        Back home
      </button>
    </div>
  );
}
