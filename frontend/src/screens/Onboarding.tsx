import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/Avatar';
import { CandleIcon, HeartIcon, GamepadIcon, MailIcon, SparklesIcon } from '../components/Icons';
import type { Partner } from '../api/types';
import './Onboarding.css';

export function Onboarding() {
  const { partner, login } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (partner) {
      navigate('/', { replace: true });
    }
  }, [partner, navigate]);

  useEffect(() => {
    authAPI.getPartners().then((res) => {
      setPartners(res.data);
    }).catch(() => {
      // Seed default fallback partners
    });
  }, []);

  const handleSeatClick = (role: string) => {
    setSelectedRole(role);
    setPin('');
    setError('');
    setTimeout(() => pinInputRef.current?.focus(), 100);
  };

  const handlePinSubmit = async (pinValue = pin) => {
    if (pinValue.length < 4 || !selectedRole || isLoading) return;

    setIsLoading(true);
    setError('');

    const result = await login(selectedRole, pinValue);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Wrong PIN code. (Default PIN: 1234)');
      setPin('');
      setIsLoading(false);
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    } else if (e.key === 'Escape') {
      setSelectedRole(null);
      setPin('');
      setError('');
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4 || isLoading) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      handlePinSubmit(newPin);
    }
  };

  const maulik = partners.find(p => p.role === 'boyfriend');
  const seema = partners.find(p => p.role === 'girlfriend');

  return (
    <div className="onboarding-landing">
      {/* Background Subtle Radial Glow */}
      <div className="landing-bg-glow" />

      {/* Editorial Navigation Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <CandleIcon size={22} color="#E8A94C" />
          <span>Us.</span>
        </div>
        <div className="landing-tagline-pill">
          <span>Private Co-op Sanctuary</span>
        </div>
      </header>

      {/* Main Landing Content Wrapper */}
      <main className="landing-main">
        {/* Hero Banner */}
        <section className="landing-hero animate-fade-in-up">
          <div className="landing-hero__badge">
            <SparklesIcon size={14} color="#E8A94C" />
            <span>Built exclusively for two</span>
          </div>

          <h1 className="landing-hero__title">
            Your Private Lounge for <span className="text-amber">Co-op Gaming</span> & <span className="text-rose">Quiet Moments</span>.
          </h1>

          <p className="landing-hero__subtitle">
            Play real-time chess, roll 3D dice in Ludo, exchange hidden love notes, and connect across the distance in a warm dark sanctuary.
          </p>
        </section>

        {/* Seat Selection Landing Module */}
        <section className="landing-entrance-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="entrance-card__header">
            <CandleIcon size={18} color="#E8A94C" />
            <span>Select Your Seat to Enter</span>
          </div>

          <div className="onboarding__seats">
            {/* Maulik's seat */}
            <button
              className={`seat ${selectedRole === 'boyfriend' ? 'seat--selected' : ''}`}
              onClick={() => handleSeatClick('boyfriend')}
              disabled={isLoading}
            >
              <Avatar
                name={maulik?.name || 'Maulik'}
                avatar={maulik?.avatar}
                haloColor="#E8A94C"
                isOnline={maulik?.is_online}
                showStatus
                size="xl"
              />
              <div className="seat__info">
                <span className="seat__name">{maulik?.name || 'Maulik'}</span>
                <span className="seat__role text-amber">Partner 1</span>
              </div>
              <span className="seat__cta">Take Seat →</span>
            </button>

            {/* Divider */}
            <div className="onboarding__divider">
              <span className="divider-line" />
              <div className="divider-icon">
                <HeartIcon size={16} color="#E8A94C" fill="rgba(232, 169, 76, 0.2)" />
              </div>
              <span className="divider-line" />
            </div>

            {/* Seema's seat */}
            <button
              className={`seat ${selectedRole === 'girlfriend' ? 'seat--selected' : ''}`}
              onClick={() => handleSeatClick('girlfriend')}
              disabled={isLoading}
            >
              <Avatar
                name={seema?.name || 'Seema'}
                avatar={seema?.avatar}
                haloColor="#C97B84"
                isOnline={seema?.is_online}
                showStatus
                size="xl"
              />
              <div className="seat__info">
                <span className="seat__name">{seema?.name || 'Seema'}</span>
                <span className="seat__role text-rose">Partner 2</span>
              </div>
              <span className="seat__cta">Take Seat →</span>
            </button>
          </div>

          <div className="entrance-card__hint">
            <span>PIN security active • Default PIN: <strong>6767</strong></span>
          </div>
        </section>

        {/* Product Features Grid */}
        <section className="landing-features-grid animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="feature-card">
            <div className="feature-card__icon">
              <GamepadIcon size={24} color="#E8A94C" />
            </div>
            <h3 className="feature-card__title">9 Real-Time Co-op Games</h3>
            <p className="feature-card__desc">From tactical Chess and Battleship to Ludo and Connect 4, built with WebSockets for instant synchronization.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <SparklesIcon size={24} color="#E8A94C" />
            </div>
            <h3 className="feature-card__title">3D WebGL Dice Stage</h3>
            <p className="feature-card__desc">Interactive 3D rounded die with contact shadows and realistic tumbling animation for game nights.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <MailIcon size={24} color="#C97B84" />
            </div>
            <h3 className="feature-card__title">Private Love Notes & Pings</h3>
            <p className="feature-card__desc">Leave gentle notes for your partner to wake up to, or send a warm instant ping anytime.</p>
          </div>
        </section>

        {/* PIN Pad Modal Overlay */}
        {selectedRole && (
          <div className="pin-overlay animate-fade-in-scale">
            <div className="pin-card">
              <button className="pin-card__close" onClick={() => { setSelectedRole(null); setPin(''); setError(''); }}>
                &times;
              </button>

              <div className="pin-card__header-icon">
                <CandleIcon size={24} color="#E8A94C" />
              </div>

              <p className="pin-card__label">
                Enter PIN for <strong>{selectedRole === 'boyfriend' ? maulik?.name || 'Maulik' : seema?.name || 'Seema'}</strong>
              </p>

              <div className="pin-dots">
                {[0, 1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`}
                    style={i < pin.length ? {
                      backgroundColor: selectedRole === 'boyfriend' ? '#E8A94C' : '#C97B84'
                    } : undefined}
                  />
                ))}
              </div>

              {error && <p className="pin-card__error">{error}</p>}

              {/* Hidden input for physical keyboard */}
              <input
                ref={pinInputRef}
                className="pin-hidden-input"
                type="tel"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  if (val.length === 4) {
                    handlePinSubmit(val);
                  }
                }}
                onKeyDown={handlePinKeyDown}
                autoFocus
              />

              {/* Visual Numpad */}
              <div className="pin-numpad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(key => (
                  <button
                    key={key}
                    className={`pin-key ${key === 'del' || key === 'ok' ? 'pin-key--action' : ''}`}
                    style={key === 'ok' ? { background: 'var(--strawberry-500)', color: '#fff', fontWeight: 'bold' } : undefined}
                    onClick={() => {
                      if (key === 'del') {
                        setPin(p => p.slice(0, -1));
                      } else if (key === 'ok') {
                        handlePinSubmit();
                      } else {
                        handlePinDigit(key);
                      }
                    }}
                    disabled={isLoading || (key === 'ok' && pin.length === 0)}
                  >
                    {key === 'del' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                        <line x1="18" y1="9" x2="12" y2="15" />
                        <line x1="12" y1="9" x2="18" y2="15" />
                      </svg>
                    ) : key === 'ok' ? 'OK' : key}
                  </button>
                ))}
              </div>

              {isLoading && <div className="pin-card__loading">Unlocking Sanctuary...</div>}
            </div>
          </div>
        )}
      </main>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <span>a private little sanctuary, crafted for two</span>
      </footer>
    </div>
  );
}
