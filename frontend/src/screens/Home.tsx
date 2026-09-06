import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/Avatar';
import { gamesAPI, socialAPI, authAPI } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';
import { Navbar } from '../components/Navbar';
import { GameCarousel } from '../components/GameCarousel';
import {
  CandleIcon,
  FlameIcon,
  GamepadIcon,
  CrossIcon,
  HeartIcon,
  SparklesIcon,
  MailIcon,
  ChatIcon,
  ShipIcon,
  BrainIcon,
} from '../components/Icons';
import type { Partner, Streak, GameRoom as GameRoomType } from '../api/types';
import './Home.css';

// 6 Core Co-op Games with Unique Tactile Visual Identities
const TACTILE_GAMES = [
  { id: 'chess', title: 'Chess', category: 'Deep Strategy', desc: 'Tactical 8x8 battle of foresight and quiet decision-making.', path: '/games/chess', icon: CrossIcon, variant: 'feature' },
  { id: 'ludo', title: 'Ludo', category: 'Roll & Race', desc: 'Race 4 tokens home with interactive 3D WebGL dice rolls.', path: '/games/ludo', icon: SparklesIcon, variant: 'playful' },
  { id: 'uno', title: 'Uno', category: 'Quick Cards', desc: 'Match colors and numbers to clear your hand first.', path: '/games/uno', icon: GamepadIcon, variant: 'cards' },
  { id: 'connect4', title: 'Connect 4', category: 'Grid Alignment', desc: 'Drop discs vertically to align four tokens in a row.', path: '/games/connect4', icon: GamepadIcon, variant: 'grid' },
  { id: 'battleship', title: 'Battleship', category: 'Naval Warfare', desc: 'Deploy missile coordinates on radar naval grid.', path: '/games/battleship', icon: ShipIcon, variant: 'naval' },
  { id: 'gofish', title: 'Go Fish', category: 'Silly Co-op', desc: 'Ask for matching card suits in turn.', path: '/games/gofish', icon: BrainIcon, variant: 'memory' },
];

// Memory Stream Items
const MEMORY_STREAM = [
  { day: 'TODAY', game: 'Chess', record: 'Tied 4–4', winner: 'Draw', time: '25m ago', icon: CrossIcon },
  { day: 'TODAY', game: 'Ludo', record: 'Seema leads 6–4', winner: 'Seema Won', time: '2h ago', icon: SparklesIcon },
  { day: 'YESTERDAY', game: 'Connect 4', record: 'Maulik leads 5–3', winner: 'Maulik Won', time: 'Yesterday', icon: GamepadIcon },
];

// Love Notes Preview
const LOVE_NOTES = [
  { id: 1, author: 'Seema', text: "Can't wait for our game night tonight! Get ready to lose at Ludo", time: '3h ago' },
  { id: 2, author: 'Maulik', text: "Thinking of you while working today. Hope your day is gentle and soft", time: 'Yesterday' },
];

// Timeline Events
const TIMELINE_EVENTS = [
  { id: 1, text: 'Seema rolled a 6 in Ludo', time: '25m ago', icon: SparklesIcon },
  { id: 2, text: 'Maulik left a new Love Note', time: '2h ago', icon: MailIcon },
  { id: 3, text: 'Seema logged in to sanctuary', time: '3h ago', icon: CandleIcon },
  { id: 4, text: 'Chess match ended in a draw', time: 'Yesterday', icon: CrossIcon },
];

export function Home() {
  const { partner } = useAuth();
  const navigate = useNavigate();
  const [otherPartner, setOtherPartner] = useState<Partner | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [activeGame, setActiveGame] = useState<GameRoomType | null>(null);
  const [showThinkingPing, setShowThinkingPing] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    authAPI.getPartners().then(res => {
      const other = res.data.find((p: Partner) => p.role !== partner?.role);
      if (other) {
        setOtherPartner(other);
        setPartnerOnline(other.is_online);
        setLastSeen(other.last_seen);
      }
    });

    socialAPI.streak().then(res => setStreak(res.data));

    gamesAPI.activeRoom().then(res => {
      if (res.data.room) setActiveGame(res.data.room);
    });
  }, [partner]);

  // Presence WebSocket
  const { sendMessage } = useWebSocket({
    url: 'ws/presence/',
    onMessage: useCallback((data: any) => {
      if (data.type === 'presence' && data.role !== partner?.role) {
        setPartnerOnline(data.status === 'online');
      }
      if (data.type === 'thinking_of_you') {
        setShowThinkingPing(true);
        setTimeout(() => setShowThinkingPing(false), 3500);
      }
    }, [partner]),
  });

  const handleThinkingOfYou = () => {
    sendMessage({ type: 'thinking_of_you' });
    const btn = document.querySelector('.thinking-btn');
    btn?.classList.add('thinking-btn--sent');
    setTimeout(() => btn?.classList.remove('thinking-btn--sent'), 1000);
  };

  const formatLastSeen = (iso: string | null) => {
    if (!iso) return 'never';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const otherName = otherPartner?.name || 'Seema';
  const otherColor = otherPartner?.halo_color || '#C98A98';

  return (
    <div className="sanctuary-dashboard">
      <div className="grain-overlay" />

      {/* Atmospheric Top Navigation Bar */}
      <header className="sanctuary-header">
        <div className="sanctuary-brand">
          <CandleIcon size={20} color="#D6A85A" />
          <span>Us.</span>
        </div>

        <div className="header-center-presence">
          <span className={`status-dot ${partnerOnline ? 'status-dot--online' : ''}`} />
          <span className="presence-label">
            {otherName} is {partnerOnline ? 'online' : `seen ${formatLastSeen(lastSeen)}`}
          </span>
        </div>

        {streak && streak.current_streak > 0 ? (
          <div className="sanctuary-streak">
            <FlameIcon size={14} color="#E8A94C" />
            <span>{streak.current_streak} DAY STREAK</span>
          </div>
        ) : (
          <span className="sanctuary-streak-invitation">
            Play today to start a streak
          </span>
        )}
      </header>

      {/* Main Sanctuary Content Container (Max 1280px) */}
      <main className="sanctuary-main">
        {/* Thinking of You Ping Alert */}
        {showThinkingPing && (
          <div className="ping-banner animate-fade-in-up">
            <HeartIcon size={16} color="#C97B84" fill="#C97B84" />
            <span>{otherName} sent you a warm ping right now!</span>
          </div>
        )}

        {/* SECTION 1: HERO */}
        <section className="sanctuary-section">
          <GameCarousel partnerName={otherName} isPartnerOnline={partnerOnline} />
        </section>

        {/* SECTION 2: REBUILT SEAT CARD (Maulik <---> Seema) */}
        <section className="presence-organic-stage">
          <div className="presence-seat presence-seat--active">
            <Avatar
              name={partner?.name || 'You'}
              avatar={partner?.avatar}
              haloColor="#E8A94C"
              isOnline={true}
              size="md"
            />
            <div className="seat-meta">
              <span className="seat-name">{partner?.name || 'Maulik'}</span>
              <span className="seat-status"><span className="dot dot--online" /> Active now</span>
            </div>
          </div>

          <div className="presence-connection-beam">
            <button className="thinking-btn" onClick={handleThinkingOfYou}>
              <HeartIcon size={12} color="#C97B84" fill="#C97B84" />
              <span>THINKING OF YOU</span>
            </button>
          </div>

          <div className={`presence-seat ${partnerOnline ? 'presence-seat--active' : ''}`}>
            <Avatar
              name={otherName}
              avatar={otherPartner?.avatar}
              haloColor={partnerOnline ? "#E8A94C" : "rgba(246, 239, 224, 0.15)"}
              isOnline={partnerOnline}
              size="md"
            />
            <div className="seat-meta">
              <span className="seat-name">{otherName}</span>
              <span className="seat-status">
                <span className={`dot ${partnerOnline ? 'dot--online' : ''}`} />
                {partnerOnline ? 'Online now' : `Seen ${formatLastSeen(lastSeen)}`}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: TACTILE GAME GALLERY */}
        <section className="sanctuary-section">
          <div className="section-header-editorial">
            <div className="header-title-group">
              <span className="eyebrow-accent">GAME GALLERY</span>
              <h2 className="editorial-heading">Quick Co-op Play</h2>
            </div>
            <span className="link-action" onClick={() => navigate('/games')}>
              VIEW ALL 9 GAMES →
            </span>
          </div>

          {activeGame && (
            <div className="tactile-card tactile-card--feature" onClick={() => navigate(`/room/${activeGame.id}`)}>
              <div className="tactile-card__icon-badge">
                <SparklesIcon size={22} color="#D6A85A" />
              </div>
              <div className="tactile-card__content">
                <span className="tactile-card__tag">LIVE MATCH IN PROGRESS</span>
                <h3 className="tactile-card__title">{activeGame.game_type_display}</h3>
                <p className="tactile-card__desc">
                  {activeGame.turn_partner?.role === partner?.role
                    ? "It's your turn! Tap to play your move"
                    : `Waiting for ${activeGame.turn_partner?.name || otherName}'s turn`}
                </p>
              </div>
            </div>
          )}

          <div className="tactile-gallery-grid">
            {TACTILE_GAMES.map((g) => {
              const IconComp = g.icon;
              return (
                <div
                  key={g.id}
                  className={`tactile-card tactile-card--${g.variant}`}
                  onClick={() => navigate(g.path)}
                >
                  <div className="tactile-card__icon-badge">
                    <IconComp size={22} color="#D6A85A" />
                  </div>
                  <div className="tactile-card__content">
                    <span className="tactile-card__tag">{g.category}</span>
                    <h3 className="tactile-card__title">{g.title}</h3>
                    <p className="tactile-card__desc">{g.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: CHRONOLOGICAL MEMORY STREAM (Recent Games) */}
        <section className="sanctuary-section">
          <div className="section-header-editorial">
            <div className="header-title-group">
              <span className="eyebrow-accent">MATCH HISTORY</span>
              <h2 className="editorial-heading">Recent Sessions</h2>
            </div>
            <span className="link-action" onClick={() => navigate('/games')}>
              VIEW HISTORY →
            </span>
          </div>

          <div className="memory-stream-container">
            {MEMORY_STREAM.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div key={idx} className="memory-stream-item">
                  <div className="stream-day-tag">{m.day}</div>
                  <div className="stream-item-card">
                    <div className="stream-icon-box">
                      <IconComp size={16} color="#F3E9DC" />
                    </div>
                    <div className="stream-info">
                      <span className="stream-game-name">{m.game}</span>
                      <span className="stream-record">{m.record}</span>
                    </div>
                    <span className="stream-result-badge">{m.winner}</span>
                    <span className="stream-time">{m.time}</span>
                    <button className="stream-rematch-btn" onClick={() => navigate('/games')}>
                      Rematch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: PEOPLE & CONNECTIONS */}
        <section className="sanctuary-section">
          <div className="section-header-editorial">
            <div className="header-title-group">
              <span className="eyebrow-accent">SANCTUARY PARTNERS</span>
              <h2 className="editorial-heading">People</h2>
            </div>
            <span className="link-action" onClick={() => navigate('/chat')}>
              SEE EVERYONE →
            </span>
          </div>

          <div className="people-row">
            <div className="person-identity-card">
              <Avatar name={partner?.name || 'You'} avatar={partner?.avatar} haloColor="#D6A85A" isOnline={true} size="md" />
              <div className="person-details">
                <span className="person-name">{partner?.name || 'Maulik'}</span>
                <span className="person-role">You • Partner 1</span>
              </div>
              <span className="online-pill">Active</span>
            </div>

            <div className="person-identity-card">
              <Avatar name={otherName} avatar={otherPartner?.avatar} haloColor={otherColor} isOnline={partnerOnline} size="md" />
              <div className="person-details">
                <span className="person-name">{otherName}</span>
                <span className="person-role">Partner 2</span>
              </div>
              <button className="person-chat-btn" onClick={() => navigate('/chat')}>
                <ChatIcon size={14} color="#D6A85A" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 6: LOVE NOTES (Letter Experience) */}
        <section className="sanctuary-section love-notes-editorial">
          <div className="section-header-editorial">
            <div className="header-title-group">
              <span className="eyebrow-accent">QUIET MOMENTS</span>
              <h2 className="editorial-heading">Love Notes</h2>
              <p className="editorial-subheading">"Little things worth leaving behind."</p>
            </div>
            <span className="link-action" onClick={() => navigate('/notes')}>
              VIEW ALL NOTES →
            </span>
          </div>

          <div className="paper-notes-grid">
            {LOVE_NOTES.map((note) => (
              <div key={note.id} className="paper-note-card" onClick={() => navigate('/notes')}>
                <span className="note-author">{note.author}</span>
                <p className="note-body">"{note.text}"</p>
                <span className="note-time">{note.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: ACTIVITY TIMELINE */}
        <section className="sanctuary-section">
          <div className="section-header-editorial">
            <div className="header-title-group">
              <span className="eyebrow-accent">RELATIONSHIP LOG</span>
              <h2 className="editorial-heading">Activity</h2>
            </div>
            <span className="link-action" onClick={() => navigate('/chat')}>
              SEE ACTIVITY →
            </span>
          </div>

          <div className="timeline-node-list">
            {TIMELINE_EVENTS.map((ev) => {
              const IconComp = ev.icon;
              return (
                <div key={ev.id} className="timeline-node-item">
                  <div className="node-marker">
                    <IconComp size={13} color="#D6A85A" />
                  </div>
                  <div className="node-content">
                    <span className="node-text">{ev.text}</span>
                    <span className="node-time">{ev.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: DRAMATIC BATTLESHIP SPOTLIGHT */}
        <section className="sanctuary-section dramatic-spotlight">
          <div className="spotlight-bg-grid" />
          <div className="spotlight-content">
            <span className="spotlight-eyebrow">FEATURED SPOTLIGHT</span>
            <h2 className="spotlight-title">Naval Grid Warfare & Radar Strikes</h2>
            <p className="spotlight-desc">
              Deploy your fleet on hidden coordinates. Take turns firing radar strikes across encrypted WebSocket turns.
            </p>
            <button className="spotlight-cta" onClick={() => navigate('/games/battleship')}>
              PLAY BATTLESHIP →
            </button>
          </div>
        </section>

        {/* SECTION 9: MINIMAL SANCTUARY FOOTER */}
        <footer className="minimal-footer">
          <div className="footer-brand">
            <CandleIcon size={15} color="#D6A85A" />
            <span>Us. Sanctuary • A private digital room for two</span>
          </div>
          <div className="footer-meta">
            <span>Version 1.0</span> • <span>Real-Time Sync Active</span>
          </div>
        </footer>
      </main>

      {/* Floating Translucent Dock Navigation */}
      <Navbar />
    </div>
  );
}
