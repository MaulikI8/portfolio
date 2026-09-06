import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { Flame, Bell, User, Mail, Sparkles, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const IceCreamIcon = ({ size = 20, color = 'var(--strawberry-500)' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 11 4.18 9.29a2 2 0 0 0 3.64 0L19 11" />
    <path d="M5.14 11a4.5 4.5 0 1 1 7.72-3.17A4.5 4.5 0 0 1 18.86 11Z" />
  </svg>
);

export function Header({ partnerOnline }: { partnerOnline?: boolean }) {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const { data: streak } = useFetch<any>('/api/social/streak');
  const { data: notifications } = useFetch<any[]>('/api/notifications');
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const myName = partner?.name || (partner?.role === 'boyfriend' ? 'Maulik' : 'Seema');
  const partnerName = partner?.role === 'boyfriend' ? 'Seema' : 'Maulik';
  const streakCount = streak?.current ?? streak?.current_length ?? 0;
  const avatarUrl = partner?.avatar_url || partner?.avatar || localStorage.getItem(`icecream_avatar_${partner?.role}`);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <header className="app-header">
      <div className="header-inner" style={{ position: 'relative' }}>
        <Link to="/" className="header-logo font-serif" aria-label="Ice Cream Home" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IceCreamIcon size={22} color="var(--strawberry-500)" />
          <span>Ice Cream</span>
        </Link>

        <div className="header-couple-badge" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--ink-muted)' }}>
          <span className="header-presence-dot" style={{ background: partnerOnline ? 'var(--pistachio-accent)' : '#9CA3AF' }} />
          <span>Maulik & Seema</span>
          <span style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 600, color: partnerOnline ? 'var(--pistachio-accent)' : 'var(--ink-muted)' }}>
            • {partnerOnline ? 'online' : 'away'}
          </span>
        </div>

        <div className="header-actions">
          <ThemeToggle />

          <div className="streak-pill" title="Daily play streak" style={{ background: 'var(--strawberry-500-15)', border: '1px solid var(--border-subtle)', color: 'var(--strawberry-500)' }}>
            <Flame size={15} color="var(--strawberry-500)" fill="var(--strawberry-500)" />
            <span>{streakCount} {streakCount === 1 ? 'day' : 'days'}</span>
          </div>

          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Notifications"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
            >
              <Bell size={17} color="var(--ink-muted)" />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--strawberry-500)' }} />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifMenu && (
              <div
                className="card-surface animate-fade-in-scale"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '280px',
                  background: 'var(--surface-card)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '20px',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-hover)',
                  zIndex: 999,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-deep)' }}>Notifications</span>
                  <button onClick={() => setShowNotifMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    onClick={() => { setShowNotifMenu(false); navigate('/notes'); }}
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '12px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  >
                    <Mail size={16} color="var(--strawberry-500)" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-deep)' }}>New Love Note</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{partnerName} left a warm note</div>
                    </div>
                  </div>

                  <div
                    onClick={() => { setShowNotifMenu(false); navigate('/games/uno'); }}
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '12px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  >
                    <Sparkles size={16} color="var(--pistachio-accent)" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-deep)' }}>UNO Match Turn</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>It's your turn in UNO Battle</div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => { setShowNotifMenu(false); navigate('/notes'); }}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '99px', background: 'var(--strawberry-500)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/profile')}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--strawberry-500)',
              color: 'var(--vanilla-50)',
              border: '2px solid var(--surface-card)',
              boxShadow: 'var(--shadow-level-1)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            aria-label="Profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={myName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : myName ? (
              myName[0]
            ) : (
              <User size={16} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

