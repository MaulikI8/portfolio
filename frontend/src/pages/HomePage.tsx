import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useNudgeSocket } from '../hooks/useSocket';
import { ContentFooter } from '../components/ContentFooter';
import { GirlfriendWelcomeModal } from '../components/GirlfriendWelcomeModal';
import { FloatingPetalsAndHearts } from '../components/FloatingPetalsAndHearts';
import { LoveJar } from '../components/LoveJar';
import {
  Heart,
  Flame,
  Clock,
  Check,
  Circle,
  ChevronRight,
  Sparkles,
  Mail,
  Layers,
  Dices,
  X,
  Smile,
  Coffee,
  Gamepad2,
  Tv,
  Calendar,
} from 'lucide-react';

const RELATIONSHIP_START_DATE = '2026-04-09';

function calculateRelationshipDays(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const difference = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(difference / 86400000) + 1);
}

export function HomePage() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const { sendNudge } = useNudgeSocket();
  
  // Real Database Fetching from Backend Endpoints
  const { data: streakData, loading: sLoading } = useFetch<any>('/api/social/streak');
  const { data: notesData } = useFetch<any[]>('/api/social/notes');
  const { data: memoriesData } = useFetch<any[]>('/api/social/memories');
  const { data: gamesHistory } = useFetch<any[]>('/api/games/history');
  const { data: activeRoom } = useFetch<any>('/api/games/rooms/active');

  const [showMomentModal, setShowMomentModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [pingToast, setPingToast] = useState<string | null>(null);

  const partnerName = partner?.role === 'boyfriend' ? 'Seema' : 'Maulik';
  const isGirlfriend = partner?.role === 'girlfriend';
  const relationshipDays = calculateRelationshipDays(RELATIONSHIP_START_DATE);

  useEffect(() => {
    if (isGirlfriend) {
      const alreadySeen = localStorage.getItem('seema_welcome_intro_seen') === 'true';
      if (!alreadySeen) {
        setShowWelcomeModal(true);
      } else {
        setShowWelcomeModal(false);
      }
    } else {
      setShowWelcomeModal(false);
    }
  }, [isGirlfriend]);

  // Dynamic real DB stats
  const currentStreak = streakData?.current ?? 0;
  const totalGamesPlayed = gamesHistory?.length ?? 0;
  const totalNotesExchanged = notesData?.length ?? 0;
  const totalMemoriesShared = memoriesData?.length ?? 0;

  const MOMENT_OPTIONS = [
    { label: 'Miss you', icon: Heart, emoji: '💖', color: 'var(--strawberry-500)' },
    { label: 'Morning coffee?', icon: Coffee, emoji: '☕', color: 'var(--vanilla-muted)' },
    { label: 'Make me laugh', icon: Smile, emoji: '😄', color: 'var(--pistachio-accent)' },
    { label: 'Thinking of you', icon: Sparkles, emoji: '🤗', color: 'var(--strawberry-500)' },
    { label: 'Challenge me', icon: Flame, emoji: '🔥', color: 'var(--strawberry-500)' },
  ];

  const handleSendMoment = (opt: { label: string; emoji?: string }) => {
    const emoji = opt.emoji || '✨';
    sendNudge(emoji, opt.label);
    setPingToast(`Sent '${opt.label}' moment to ${partnerName}!`);
    setShowMomentModal(false);
    setTimeout(() => setPingToast(null), 3500);
  };

  if (sLoading) {
    return (
      <div style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '140px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '80px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '120px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem 0 2rem 0', position: 'relative' }}>
      <FloatingPetalsAndHearts />

      <GirlfriendWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onPlayUno={() => navigate('/games/uno')}
      />

      {pingToast && (
        <div
          className="card-surface"
          style={{
            background: 'var(--strawberry-500)',
            color: 'var(--vanilla-50)',
            padding: '0.75rem 1.25rem',
            textAlign: 'center',
            marginBottom: '1rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-cta-strawberry)',
            borderRadius: '99px',
          }}
        >
          {pingToast}
        </div>
      )}

      {/* 1. "TODAY TOGETHER" SECTION */}
      <div
        className="card-surface"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '24px',
          background: 'var(--surface-card)',
          border: '1.5px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          boxShadow: 'var(--shadow-level-1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 700, color: 'var(--ink-deep)', margin: 0 }}>
              In love with {partnerName} since {relationshipDays} days
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', background: 'var(--strawberry-500-08)', border: '1px solid var(--border-subtle)', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--strawberry-500)' }}>
            <Flame size={14} color="var(--strawberry-500)" />
            <span>{relationshipDays} days together</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--vanilla-muted)' }}>
            <Clock size={14} color="var(--vanilla-muted)" />
            <span>Last talked: 2h ago</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => setShowMomentModal(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '99px',
              background: 'var(--strawberry-500)',
              color: 'var(--vanilla-50)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-cta-strawberry)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} color="var(--vanilla-50)" fill="var(--vanilla-50)" />
            <span>Send Love</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/games/uno')}
            style={{
              flex: 1,
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '99px',
              border: '1.5px solid var(--strawberry-500)',
              color: 'var(--strawberry-500)',
              background: 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Layers size={16} color="var(--strawberry-500)" />
            <span>Play UNO</span>
          </button>
        </div>
      </div>

      {/* REASONS I LOVE YOU JAR */}
      <LoveJar role={partner?.role} />

      {/* 2. COUPLE CONNECTION STREAK SYSTEM */}
      <div
        className="card-surface"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '24px',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-level-1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Flame size={24} color="var(--strawberry-500)" />
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
              {currentStreak} Day Connection Streak
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--pistachio-accent)', background: 'var(--pistachio-accent-15)', padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1px solid rgba(143, 174, 126, 0.3)' }}>
            Active Connection
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600, color: totalGamesPlayed > 0 ? 'var(--ink-deep)' : 'var(--vanilla-muted)' }}>
            {totalGamesPlayed > 0 ? <Check size={16} color="var(--pistachio-accent)" /> : <Circle size={16} color="var(--vanilla-muted)" />}
            <span>Played {totalGamesPlayed} games</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600, color: totalNotesExchanged > 0 ? 'var(--ink-deep)' : 'var(--vanilla-muted)' }}>
            {totalNotesExchanged > 0 ? <Check size={16} color="var(--pistachio-accent)" /> : <Circle size={16} color="var(--vanilla-muted)" />}
            <span>Sent {totalNotesExchanged} notes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600, color: totalMemoriesShared > 0 ? 'var(--ink-deep)' : 'var(--vanilla-muted)' }}>
            {totalMemoriesShared > 0 ? <Check size={16} color="var(--pistachio-accent)" /> : <Circle size={16} color="var(--vanilla-muted)" />}
            <span>Shared {totalMemoriesShared} memories</span>
          </div>
        </div>
      </div>

      {/* 3. REDESIGNED UNO BATTLE CARD */}
      <div
        className="card-surface card-interactive"
        onClick={() => navigate('/games/uno')}
        style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid rgba(232, 86, 125, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-banner-strawberry)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--vanilla-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
            <Layers size={28} color="var(--strawberry-600)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--vanilla-50)' }}>
              UNO Battle
            </div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(251, 243, 231, 0.9)', marginTop: '0.15rem' }}>
              {activeRoom?.game_type ? `Active ${activeRoom.game_type.toUpperCase()} match with ${partnerName}` : `${partnerName} is waiting...`}
            </div>
            <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--vanilla-50)', color: 'var(--strawberry-600)', padding: '0.2rem 0.65rem', borderRadius: '99px', marginTop: '0.4rem' }}>
              Your turn
            </span>
          </div>
        </div>
        <button className="btn-primary" style={{ padding: '0.65rem 1.35rem', fontSize: '0.9rem', background: 'var(--vanilla-50)', color: 'var(--strawberry-600)', fontWeight: 800, border: 'none', borderRadius: '99px' }}>
          Continue Game →
        </button>
      </div>

      {/* 4. RECENT MOMENTS TIMELINE */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 2px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
            Recent Moments
          </h2>
          <button className="btn-quiet" onClick={() => navigate('/notes')} style={{ color: 'var(--strawberry-500)', fontWeight: 600 }}>
            View all →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {memoriesData && memoriesData.length > 0 ? (
            memoriesData.slice(0, 3).map((mem) => (
              <div key={mem.id} className="card-surface" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--strawberry-500-15)', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--pistachio-accent)' }}>{mem.date}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink-deep)' }}>{mem.title}</div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="card-surface" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--strawberry-500-15)', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Gamepad2 size={18} color="var(--strawberry-500)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--strawberry-500)' }}>Today</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink-deep)' }}>You played UNO Battle together</div>
                </div>
              </div>

              <div className="card-surface" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--pistachio-accent-15)', color: 'var(--pistachio-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--pistachio-accent)' }}>Yesterday</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink-deep)' }}>New shared memory added</div>
                </div>
              </div>

              <div className="card-surface" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--strawberry-500-15)', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--strawberry-500)' }}>Monday</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink-deep)' }}>{partnerName} sent a paper love note</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. YOUR RELATIONSHIP STATS */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-deep)', marginBottom: '12px' }}>
          Together Stats
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
          <div className="card-surface" style={{ padding: '1.1rem', borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-subtle)' }}>
            <Gamepad2 size={24} color="var(--strawberry-500)" />
            <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-deep)' }}>{totalGamesPlayed}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Games played</span>
          </div>
          <div className="card-surface" style={{ padding: '1.1rem', borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-subtle)' }}>
            <Mail size={24} color="var(--strawberry-500)" />
            <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-deep)' }}>{totalNotesExchanged}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Notes exchanged</span>
          </div>
          <div className="card-surface" style={{ padding: '1.1rem', borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-subtle)' }}>
            <Sparkles size={24} color="var(--pistachio-accent)" />
            <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-deep)' }}>{totalMemoriesShared}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Memories shared</span>
          </div>
          <div className="card-surface" style={{ padding: '1.1rem', borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={24} color="var(--strawberry-500)" />
            <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-deep)' }}>{relationshipDays}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Days together</span>
          </div>
        </div>
      </div>

      {/* Pick a Game Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 14px 2px' }}>
        <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
          Pick a Game
        </h2>
        <button className="btn-quiet" onClick={() => navigate('/games')} style={{ color: 'var(--strawberry-500)', fontWeight: 600 }}>
          View all →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '1.75rem' }}>
        {/* Uno Card */}
        <div
          className="card-surface card-interactive"
          onClick={() => navigate('/games/uno')}
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '160px', border: '1px solid var(--border-subtle)' }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--strawberry-500-15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} color="var(--strawberry-500)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink-deep)' }}>
              Uno Classic
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--vanilla-muted)', marginTop: '0.2rem' }}>
              Your turn, {partnerName} is waiting
            </div>
          </div>
        </div>

        {/* Ludo Card */}
        <div
          className="card-surface card-interactive"
          onClick={() => navigate('/games/ludo')}
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '160px', border: '1px solid var(--border-subtle)' }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--pistachio-accent-15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dices size={22} color="var(--pistachio-accent)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink-deep)' }}>
              Ludo Classic
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--vanilla-muted)', marginTop: '0.2rem' }}>
              Last played yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Movie Night Banner */}
      <div
        className="card-surface card-interactive"
        onClick={() => navigate('/movie-night')}
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          background: 'var(--surface-card)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--ink-deep)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--strawberry-500-15)', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={22} />
          </div>
          <div>
            <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink-deep)' }}>
              Movie Night Cinema
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--vanilla-muted)', fontWeight: 500 }}>
              Live Screen Share & Audio Call for two
            </div>
          </div>
        </div>
        <button className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', border: '1px solid var(--strawberry-500)', color: 'var(--strawberry-500)', borderRadius: '99px', background: 'transparent' }}>
          Watch Together
        </button>
      </div>

      {/* Featured Games Collection Banner */}
      <div
        className="card-surface card-interactive"
        onClick={() => navigate('/games')}
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          background: 'var(--surface-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--strawberry-500-15)', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
              Full Games Collection
            </div>
          </div>
        </div>
        <ChevronRight size={22} color="var(--strawberry-500)" />
      </div>

      {/* INTERACTIVE "SEND A LITTLE MOMENT" MODAL */}
      {showMomentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 5, 18, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowMomentModal(false)}
        >
          <div
            className="card-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '24px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Heart size={20} color="var(--coral-primary)" fill="var(--coral-primary)" />
                <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
                  Send a little moment
                </h3>
              </div>
              <button
                onClick={() => setShowMomentModal(false)}
                style={{ background: 'var(--border-subtle)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="var(--ink-muted)" />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
              Pick a quick moment to send to {partnerName}:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOMENT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSendMoment(opt)}
                    className="card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.9rem 1.25rem',
                      borderRadius: '16px',
                      background: 'var(--surface-paper)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--ink-deep)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <IconComponent size={22} color={opt.color} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ContentFooter />
    </div>
  );
}
