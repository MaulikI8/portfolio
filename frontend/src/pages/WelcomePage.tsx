import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingHearts } from '../components/FloatingHearts';

export function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('has_onboarded') === 'true';
    if (hasOnboarded) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem('has_onboarded', 'true');
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <FloatingHearts />
      <h1
        className="us-display"
        style={{
          fontSize: '3.5rem',
          color: 'var(--coral)',
          marginBottom: '0.5rem',
          fontWeight: 700,
        }}
      >
        Ice Cream
      </h1>
      <h2 style={{ fontSize: '1.75rem', color: 'var(--plum)', marginBottom: '0.75rem', fontWeight: 700 }}>
        A little world for two.
      </h2>
      <p style={{ color: 'var(--plum-soft)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '360px', fontWeight: 700 }}>
        Just you and Seema. No one else gets in.
      </p>

      <button className="btn-primary" onClick={handleStart} style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
        Get started
      </button>

      <span style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--plum-soft)', fontWeight: 700 }}>
        Built by Maulik, for us.
      </span>
    </div>
  );
}
