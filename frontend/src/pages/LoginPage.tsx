import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, UserCheck, Delete, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'boyfriend' | 'girlfriend' | null>(null);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && role) {
      if (lockedUntil && Date.now() < lockedUntil) return;
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handlePinSubmit = async (enteredPin: string) => {
    if (!enteredPin || enteredPin.length < 1) {
      setError('Please enter your passcode');
      return;
    }
    setError(null);
    const res = await login(role!, enteredPin);
    if (res.success) {
      navigate('/');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 60000);
        setError('Too many failed attempts. Locked for 60s.');
      } else {
        setError('Wrong PIN code, try again');
      }
    }
  };

  const name = role === 'boyfriend' ? 'Maulik' : 'Seema';
  const isLocked = lockedUntil ? Date.now() < lockedUntil : false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-app)', color: 'var(--ink-deep)' }}>
      <h1 className="us-display" style={{ color: 'var(--strawberry-500)', fontSize: '2.75rem', marginBottom: '1.5rem', fontWeight: 700 }}>
        Ice Cream
      </h1>

      {!role ? (
        <div style={{ display: 'flex', gap: '1.25rem', width: '100%', maxWidth: '360px' }}>
          <div className="card-surface" onClick={() => setRole('boyfriend')} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '1.5rem 1rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--strawberry-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: '2px solid var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}>
              <User size={26} />
            </div>
            <h3 className="us-display" style={{ fontSize: '1.2rem', color: 'var(--ink-deep)' }}>Maulik</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 700 }}>Boyfriend seat</span>
          </div>

          <div className="card-surface" onClick={() => setRole('girlfriend')} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '1.5rem 1rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#F59E0B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: '2px solid var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}>
              <UserCheck size={26} />
            </div>
            <h3 className="us-display" style={{ fontSize: '1.2rem', color: 'var(--ink-deep)' }}>Seema</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 700 }}>Girlfriend seat</span>
          </div>
        </div>
      ) : (
        <div className={`card-surface ${isShaking ? 'animate-shake' : ''}`} style={{ width: '100%', maxWidth: '340px', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--ink-deep)', fontWeight: 700 }}>
            Hi, {name} 👋
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
            Enter your passcode to unlock
          </p>

          {/* Passcode Bullets (Mobile Phone Style) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2, 3].map((i) => {
              const isFilled = pin.length > i;
              return (
                <div
                  key={i}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid var(--strawberry-500)',
                    background: isFilled ? 'var(--strawberry-500)' : 'transparent',
                    boxShadow: isFilled ? '0 0 12px rgba(232, 86, 125, 0.5)' : 'none',
                    transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              );
            })}
          </div>

          {error && <p style={{ color: 'var(--danger-500)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>{error}</p>}

          {/* Phone Passcode Numpad Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((key) => {
              if (key === 'del') {
                return (
                  <button
                    key="del"
                    disabled={isLocked || pin.length === 0}
                    onClick={() => setPin((p) => p.slice(0, -1))}
                    style={{
                      padding: '0.85rem 0',
                      fontSize: '1rem',
                      borderRadius: 'var(--radius-card)',
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--ink-deep)',
                      cursor: pin.length > 0 ? 'pointer' : 'default',
                      opacity: pin.length > 0 ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Delete size={20} />
                  </button>
                );
              }

              if (key === 'ok') {
                return (
                  <button
                    key="ok"
                    disabled={isLocked || pin.length === 0}
                    onClick={() => handlePinSubmit(pin)}
                    style={{
                      padding: '0.85rem 0',
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-card)',
                      background: 'var(--strawberry-500)',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: 'var(--shadow-cta-strawberry)',
                    }}
                  >
                    OK <CheckCircle2 size={16} />
                  </button>
                );
              }

              return (
                <button
                  key={key}
                  disabled={isLocked || pin.length >= 4}
                  onClick={() => setPin((p) => (p.length < 4 ? p + key : p))}
                  style={{
                    padding: '0.85rem 0',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-card)',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--ink-deep)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setRole(null); setPin(''); setError(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--strawberry-500)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}
          >
            ← Switch User Seat
          </button>
        </div>
      )}
    </div>
  );
}

