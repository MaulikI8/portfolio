import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, ChevronRight, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useWebSocket } from './hooks/useWebSocket';
import { gamesAPI, socialAPI, authAPI } from './api/client';
import { Avatar } from './components/Avatar';
import { UnoBoard } from './components/games/UnoBoard';
import { LudoBoard } from './components/games/LudoBoard';
import { OBUS3DUI } from './components/games/OBUS3DUI';
import {
  UnoArtwork,
  LudoArtwork,
  ObusArtwork,
  SanctuaryHeartIcon,
  SanctuaryPlayIcon,
  SanctuaryLetterIcon,
  SanctuaryChatIcon,
} from './components/GameIllustrations';
import {
  CandleIcon,
  FlameIcon,
  HeartIcon,
  SparklesIcon,
  SendIcon,
} from './components/Icons';
import type { Partner, Streak } from './api/types';
import { GirlfriendWelcomeModal } from './components/GirlfriendWelcomeModal';
import { FloatingPetalsAndHearts } from './components/FloatingPetalsAndHearts';
import './SinglePageApp.css';

// Fixed Relationship Start Date (April 9, 2026 = Day 1)
const RELATIONSHIP_START_DATE = '2026-04-09';

function calculateRelationshipDays(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const difference = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(difference / 86400000) + 1);
}

// Interactive Co-op Games Catalog (UNO, Ludo & OBUS)
const CATALOG_GAMES = [
  { id: 'uno', name: 'UNO Classic', category: 'Card Game', desc: 'Match color or number. Play wild cards and call UNO!', Artwork: UnoArtwork, tagline: 'Color & number card matching', playable: true },
  { id: 'ludo', name: 'Ludo Classic', category: 'Board Game', desc: 'Roll 6 to exit home base! Bring 4 pawns home to win.', Artwork: LudoArtwork, tagline: 'Roll dice & capture pawns', playable: true },
  { id: 'obus', name: 'OBUS Bomb Defusal', category: 'Co-op Challenge', desc: 'Keep talking! Defuse wires & keypads using the manual.', Artwork: ObusArtwork, tagline: 'Coming soon my love', playable: false },
];

export function SinglePageApp() {
  const navigate = useNavigate();
  const { partner } = useAuth();

  // Dynamic Relationship Calculation
  const relationshipDays = calculateRelationshipDays(RELATIONSHIP_START_DATE);

  // Navigation tab state (table -> Home | games -> Play | room -> Stage | notes -> Letters | chat -> Us)
  const [activeTab, setActiveTab] = useState<'table' | 'games' | 'room' | 'notes' | 'chat'>('table');

  // Application Data States
  const [otherPartner, setOtherPartner] = useState<Partner | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [showThinkingPing, setShowThinkingPing] = useState(false);

  // User Mood & Interactive Moment Drawer State
  const [myMood, setMyMood] = useState<string>('😊 Happy');
  const [showMomentModal, setShowMomentModal] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [momentToast, setMomentToast] = useState<string | null>(null);

  const isGirlfriend = partner?.role === 'girlfriend';

  useEffect(() => {
    if (isGirlfriend) {
      const alreadySeen = localStorage.getItem('seema_welcome_intro_seen');
      if (!alreadySeen) {
        setShowWelcomeModal(true);
      }
    }
  }, [isGirlfriend]);

  const MOMENT_OPTIONS = [
    { label: 'Miss you', emoji: '💋' },
    { label: 'Morning coffee?', emoji: '☕' },
    { label: 'Make me laugh', emoji: '😂' },
    { label: 'Thinking of you', emoji: '🤗' },
    { label: 'Challenge me', emoji: '🔥' },
  ];

  // Active Game State
  const [activeGameId, setActiveGameId] = useState<string>('tictactoe');
  const [gameState, setGameState] = useState<any>(null);
  const [turn, setTurn] = useState<string | null>('boyfriend');
  const [status, setStatus] = useState<string>('active');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSoloDevMode] = useState<boolean>(true);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; icon: string; from: string; left: number }[]>([]);

  // Love Notes / Letters State
  const [notes, setNotes] = useState<any[]>([
    { id: 1, author: 'Seema', text: "Can't wait for our game night tonight! Get ready to play", time: '3h ago' },
    { id: 2, author: 'Maulik', text: "Thinking of you while working today. Hope your day is gentle and soft", time: 'Yesterday' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Chat Whispers State
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: 'Seema', body: 'Hey! Ready for a quick game tonight?', sent_at: '20m ago', isMe: false },
    { id: 2, sender: 'Maulik', body: 'Always ready! Setting up our room now', sent_at: '18m ago', isMe: true },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Time of day calculation
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Fetch Initial Data
  useEffect(() => {
    authAPI.getPartners().then((res) => {
      const other = res.data.find((p: Partner) => p.role !== partner?.role);
      if (other) {
        setOtherPartner(other);
        setPartnerOnline(other.is_online);
        setLastSeen(other.last_seen);
      }
    });

    socialAPI.streak().then((res) => setStreak(res.data));
  }, [partner]);

  // Presence WebSocket
  const { sendMessage: sendPresenceMsg } = useWebSocket({
    url: 'ws/presence/',
    onMessage: useCallback(
      (data: any) => {
        if (data.type === 'presence' && data.role !== partner?.role) {
          setPartnerOnline(data.status === 'online');
        }
        if (data.type === 'thinking_of_you') {
          setShowThinkingPing(true);
          setTimeout(() => setShowThinkingPing(false), 4000);
        }
      },
      [partner]
    ),
  });

  // Game Room WebSocket
  const handleGameMessage = useCallback((data: any) => {
    if (data.type === 'init' || data.type === 'state_update') {
      setGameState(data.state);
      if (data.turn) setTurn(data.turn);
      if (data.status) setStatus(data.status);
      if (data.state?.winner || data.winner) {
        setWinner(data.winner_name || data.state?.winner || data.winner);
      }
    } else if (data.type === 'game_over') {
      setStatus('finished');
      setWinner(data.winner_name || data.winner || 'Match finished');
      if (data.final_state) setGameState(data.final_state);
    } else if (data.type === 'reaction') {
      const newRx = {
        id: Date.now() + Math.random(),
        icon: data.emoji || 'heart',
        from: data.from || 'Partner',
        left: 20 + Math.random() * 60,
      };
      setFloatingReactions((prev) => [...prev, newRx]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== newRx.id));
      }, 2600);
    } else if (data.type === 'rematch') {
      setStatus('active');
      setWinner(null);
      setGameState(null);
    }
  }, []);

  const { sendMessage: sendGameMsg } = useWebSocket({
    url: `/ws/room/1/?partner_id=${partner?.id || 1}`,
    onMessage: handleGameMessage,
  });

  const handleThinkingOfYou = () => {
    sendPresenceMsg({ type: 'thinking_of_you' });
    const btn = document.querySelector('.thinking-ping-btn');
    btn?.classList.add('thinking-ping-btn--sent');
    setTimeout(() => btn?.classList.remove('thinking-ping-btn--sent'), 1000);
  };

  const handleSendMoment = (opt: { label: string; emoji: string }) => {
    handleThinkingOfYou();
    handleSendReaction(opt.emoji);
    setMomentToast(`Sent '${opt.emoji} ${opt.label}' to ${otherPartner?.name || 'Seema'}!`);
    setShowMomentModal(false);
    setTimeout(() => setMomentToast(null), 3500);
  };

  const handleSendReaction = (iconName: string) => {
    const newRx = {
      id: Date.now() + Math.random(),
      icon: iconName,
      from: partner?.name || 'You',
      left: 20 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, newRx]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newRx.id));
    }, 2600);
    sendGameMsg({ type: 'reaction', emoji: iconName });
  };

  const handleResetGame = () => {
    setStatus('active');
    setWinner(null);
    setTurn('boyfriend');
    if (activeGameId === 'tictactoe') {
      setGameState({ board: Array(9).fill(null), winning_line: null });
    } else if (activeGameId === 'connect4') {
      setGameState({ board: Array(6).fill(0).map(() => Array(7).fill(null)) });
    } else if (activeGameId === 'coin_flip') {
      setGameState({ caller_role: 'boyfriend', call: null, result: null, phase: 'call' });
    } else {
      setGameState(null);
    }
    sendGameMsg({ type: 'rematch' });
  };

  const handleMakeMove = (payload: any) => {
    const currentTurn = turn || partner?.role || 'boyfriend';
    const nextTurn = currentTurn === 'boyfriend' ? 'girlfriend' : 'boyfriend';

    sendGameMsg({
      type: 'move',
      payload: {
        ...payload,
        solo_dev: isSoloDevMode,
        as_role: isSoloDevMode ? currentTurn : partner?.role || 'boyfriend',
      },
    });

    if (payload.type === 'win') {
      const winnerNameStr = payload.role === 'boyfriend' ? (partner?.name || 'Maulik') : (otherPartner?.name || 'Seema');
      setStatus('finished');
      setWinner(winnerNameStr);
    } else {
      setTurn(nextTurn);
    }
  };

  const handleOpenGame = (gameId: string) => {
    setActiveGameId(gameId);
    setActiveTab('room');
    setStatus('active');
    setWinner(null);
    setGameState(null);
    gamesAPI.createRoom(gameId).catch(() => {});
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes([
      {
        id: Date.now(),
        author: partner?.name || 'You',
        text: newNoteText.trim(),
        time: 'Just now',
      },
      ...notes,
    ]);
    setNewNoteText('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        sender: partner?.name || 'You',
        body: chatInput.trim(),
        sent_at: 'Just now',
        isMe: true,
      },
    ]);
    setChatInput('');
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

  const myName = partner?.name || 'Maulik';
  const otherName = otherPartner?.name || 'Seema';
  const myRole = partner?.role || 'boyfriend';
  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';

  // Correct turn calculation fix
  const isMyTurn = isSoloDevMode || (status === 'active' && turn === myRole);

  // Render Rich SVG Game Artwork
  const renderGameIllustration = (gameId: string) => {
    switch (gameId) {
      case 'uno':
        return <UnoArtwork className="game-tile-artwork" />;
      case 'ludo':
        return <LudoArtwork className="game-tile-artwork" />;
      case 'obus':
      case 'obus_3d':
        return <ObusArtwork className="game-tile-artwork" />;
      default:
        return <UnoArtwork className="game-tile-artwork" />;
    }
  };

  return (
    <div className="sanctuary-dashboard">
      <div className="grain-overlay" />
      <FloatingPetalsAndHearts />

      <GirlfriendWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onPlayUno={() => handleOpenGame('uno')}
      />

      {/* Header */}
      {activeTab !== 'room' && (
        <header className="us-header">
          <div className="us-header-brand" onClick={() => setActiveTab('table')}>
            <div className="brand-title-group">
              <HeartIcon size={16} color="var(--rose-primary)" />
              <h1 className="brand-name">Us.</h1>
            </div>
            <span className="brand-subtitle">OUR LITTLE WORLD</span>
          </div>

          <div className="us-header-center">
            <span className={`header-presence-dot ${partnerOnline ? 'header-presence-dot--online' : ''}`} />
            <div className="header-partner-names">
              <span>{myName}</span>
              <span style={{ color: 'var(--rose-primary)', fontSize: '0.8rem' }}>·</span>
              <span>{otherName}</span>
            </div>
            <span className="header-status-label">
              • {partnerOnline ? `${otherName} is here` : `seen ${formatLastSeen(lastSeen)}`}
            </span>
          </div>

          <div className="us-header-right">
            {streak && streak.current_streak > 0 && (
              <div className="header-streak-badge" title="Current Daily Game Streak">
                <FlameIcon size={12} color="var(--amber-accent)" />
                <span>{streak.current_streak} DAY STREAK</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Stage */}
      <main className="sanctuary-main">
        {/* Thinking of You Ping Banner */}
        {showThinkingPing && (
          <div className="us-ping-banner animate-fade-in-up">
            <HeartIcon size={18} color="var(--rose-light)" fill="var(--rose-primary)" />
            <span>{otherName} sent you a warm ping right now</span>
          </div>
        )}

        {/* TAB 1: HOME (Hero with Single Plaque, Seat, Games & Notes) */}
        {/* TAB 1: HOME (Hero with Today Together, Streak, UNO Battle, Memories & Stats) */}
        {activeTab === 'table' && (
          <>
            {/* Girlfriend Romantic Construction Note Banner */}
            {isGirlfriend && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(232, 86, 125, 0.18) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(232, 86, 125, 0.4)',
                  borderRadius: '20px',
                  padding: '14px 22px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 30px rgba(232, 86, 125, 0.18)',
                }}
              >
                <HeartIcon size={20} color="var(--rose-primary)" fill="var(--rose-primary)" />
                <span style={{ color: 'var(--champagne-gold)', fontWeight: 700, fontSize: '0.96rem', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                  im sorry sanu its still under construction but i was excited to show it to you 💕
                </span>
              </div>
            )}

            {/* Moment Sent Toast Banner */}
            {momentToast && (
              <div className="us-ping-banner animate-fade-in-up">
                <HeartIcon size={18} color="var(--rose-light)" fill="var(--rose-primary)" />
                <span>{momentToast}</span>
              </div>
            )}

            {/* 1. "TODAY TOGETHER" CARD (Most Important Hero Section) */}
            <section className="us-today-card animate-fade-in-up">
              <div className="today-card-top">
                <div className="today-title-group">
                  <HeartIcon size={22} color="var(--rose-primary)" fill="var(--rose-primary)" />
                  <h2>Good {getGreetingTime()}, Today with {otherName}</h2>
                </div>
                <div className="today-mood-picker">
                  <span className="mood-label">Mood:</span>
                  <select value={myMood} onChange={(e) => setMyMood(e.target.value)} className="mood-select">
                    <option value="😊 Happy">😊 Happy</option>
                    <option value="❤️ Loved">❤️ Loved</option>
                    <option value="🥰 Cozy">🥰 Cozy</option>
                    <option value="☕ Relaxed">☕ Relaxed</option>
                    <option value="😴 Tired">😴 Tired</option>
                  </select>
                </div>
              </div>

              <div className="today-metrics">
                <div className="metric-tag">
                  <FlameIcon size={14} color="var(--amber-accent)" />
                  <span>{relationshipDays} days together</span>
                </div>
                <div className="metric-tag">
                  <Clock size={14} color="var(--champagne-muted)" />
                  <span>Last talked: {partnerOnline ? 'Online now' : formatLastSeen(lastSeen)}</span>
                </div>
              </div>

              <div className="today-card-actions">
                <button className="today-btn-moment" onClick={() => setShowMomentModal(true)}>
                  <HeartIcon size={15} color="#FFFFFF" fill="#FFFFFF" />
                  <span>Send Love</span>
                </button>
                <button className="today-btn-play" onClick={() => handleOpenGame('uno')}>
                  <SparklesIcon size={15} color="var(--bg-midnight)" />
                  <span>Play UNO</span>
                </button>
              </div>
            </section>

            {/* 2. COUPLE CONNECTION STREAK SYSTEM */}
            <section className="us-streak-card animate-fade-in-up">
              <div className="streak-card-header">
                <div className="streak-header-title">
                  <FlameIcon size={24} color="var(--amber-accent)" />
                  <h3>{relationshipDays} Day Connection Streak</h3>
                </div>
                <span className="streak-active-badge">Active Everyday</span>
              </div>

              <div className="streak-stats-list">
                <div className="streak-stat-item">
                  <Check size={16} color="#27AE60" />
                  <span>Played 8 games</span>
                </div>
                <div className="streak-stat-item">
                  <Check size={16} color="#27AE60" />
                  <span>Sent 24 notes</span>
                </div>
                <div className="streak-stat-item">
                  <Check size={16} color="#27AE60" />
                  <span>Shared 5 memories</span>
                </div>
              </div>

              <div className="milestones-block">
                <div className="milestones-top">
                  <span>Upcoming Relationship Milestones</span>
                  <span className="milestone-pct">{Math.min(100, Math.floor((relationshipDays / 14) * 100))}%</span>
                </div>
                
                <div className="milestone-track">
                  <div className="milestone-fill" style={{ width: `${Math.min(100, Math.floor((relationshipDays / 14) * 100))}%` }} />
                </div>

                <div className="milestones-steps">
                  <div className={`milestone-step ${relationshipDays >= 14 ? 'milestone-step--achieved' : ''}`}>
                    <span className="ms-emoji">🎨</span>
                    <span className="ms-name">14 Days</span>
                    <span className="ms-desc">Special Theme</span>
                  </div>
                  <div className={`milestone-step ${relationshipDays >= 30 ? 'milestone-step--achieved' : ''}`}>
                    <span className="ms-emoji">🏆</span>
                    <span className="ms-name">30 Days</span>
                    <span className="ms-desc">Couple Badge</span>
                  </div>
                  <div className={`milestone-step ${relationshipDays >= 100 ? 'milestone-step--achieved' : ''}`}>
                    <span className="ms-emoji">📖</span>
                    <span className="ms-name">100 Days</span>
                    <span className="ms-desc">Memory Book</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. DYNAMIC UNO BATTLE GAME CARD */}
            <section className="us-uno-battle-card animate-fade-in-up" onClick={() => handleOpenGame('uno')}>
              <div className="uno-battle-left">
                <div className="uno-battle-icon-badge">
                  <span className="uno-badge-text">🎴</span>
                </div>
                <div className="uno-battle-info">
                  <h3 className="uno-battle-title">UNO Battle</h3>
                  <p className="uno-battle-status">{partnerOnline ? `${otherName} is waiting...` : `Match ready with ${otherName}`}</p>
                  <span className="uno-turn-tag">{turn === myRole ? 'Your Turn' : `${otherName}'s Turn`}</span>
                </div>
              </div>

              <button className="uno-battle-play-btn">
                <span>Continue Game</span>
                <ChevronRight size={18} />
              </button>
            </section>

            {/* 4. RECENT MOMENTS TIMELINE */}
            <section className="us-moments-timeline-section animate-fade-in-up">
              <div className="us-section-header">
                <h2 className="us-section-title">Recent Moments</h2>
                <span className="us-link-action" onClick={() => setActiveTab('notes')}>OUR TIMELINE →</span>
              </div>

              <div className="moments-timeline-list">
                <div className="moment-timeline-item">
                  <div className="moment-icon-badge moment-icon-badge--rose">
                    <HeartIcon size={16} color="#FFFFFF" fill="#FFFFFF" />
                  </div>
                  <div className="moment-details">
                    <span className="moment-time-tag">Today</span>
                    <p className="moment-body-text">You played UNO Battle together</p>
                  </div>
                </div>

                <div className="moment-timeline-item">
                  <div className="moment-icon-badge moment-icon-badge--blue">
                    <SparklesIcon size={16} color="#FFFFFF" />
                  </div>
                  <div className="moment-details">
                    <span className="moment-time-tag">Yesterday</span>
                    <p className="moment-body-text">New memory photo added to gallery</p>
                  </div>
                </div>

                <div className="moment-timeline-item">
                  <div className="moment-icon-badge moment-icon-badge--green">
                    <SendIcon size={16} color="#FFFFFF" />
                  </div>
                  <div className="moment-details">
                    <span className="moment-time-tag">Monday</span>
                    <p className="moment-body-text">{otherName} sent a paper love note</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. YOUR RELATIONSHIP STATS */}
            <section className="us-stats-section animate-fade-in-up">
              <div className="us-section-header">
                <h2 className="us-section-title">Together Stats</h2>
              </div>

              <div className="rel-stats-grid">
                <div className="rel-stat-card">
                  <span className="rel-stat-icon">🎮</span>
                  <span className="rel-stat-number">42</span>
                  <span className="rel-stat-label">Games played</span>
                </div>
                <div className="rel-stat-card">
                  <span className="rel-stat-icon">💌</span>
                  <span className="rel-stat-number">87</span>
                  <span className="rel-stat-label">Notes exchanged</span>
                </div>
                <div className="rel-stat-card">
                  <span className="rel-stat-icon">😂</span>
                  <span className="rel-stat-number">214</span>
                  <span className="rel-stat-label">Laughs created</span>
                </div>
                <div className="rel-stat-card">
                  <span className="rel-stat-icon">❤️</span>
                  <span className="rel-stat-number">{relationshipDays}</span>
                  <span className="rel-stat-label">Days together</span>
                </div>
              </div>
            </section>

            {/* 6. PLAY TOGETHER QUICK GAMES GALLERY */}
            <section className="animate-fade-in-up">
              <div className="us-section-header">
                <div>
                  <h2 className="us-section-title">Quick Co-op Games</h2>
                </div>
                <span className="us-link-action" onClick={() => setActiveTab('games')}>
                  ALL 10 GAMES →
                </span>
              </div>

              <div className="us-games-grid">
                {CATALOG_GAMES.slice(0, 6).map((g) => (
                  <div key={g.id} className="game-tile" onClick={() => handleOpenGame(g.id)}>
                    <div className="tile-illustration-container">
                      {renderGameIllustration(g.id)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="tile-top-row">
                        <span className="tile-category">{g.category}</span>
                      </div>
                      <h3 className="tile-title">{g.name}</h3>
                      <p className="tile-desc">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: PLAY (Full Arcade) */}
        {activeTab === 'games' && (
          <section className="animate-fade-in-up">
            <div className="us-section-header">
              <div>
                <h2 className="us-section-title">All 10 Interactive Games</h2>
              </div>
            </div>

            <div className="us-games-grid">
              {CATALOG_GAMES.map((g) => (
                <div
                  key={g.id}
                  className="game-tile"
                  onClick={() => {
                    if (g.playable) {
                      handleOpenGame(g.id);
                    } else {
                      setMomentToast('Coming soon my love!');
                      setTimeout(() => setMomentToast(null), 3000);
                    }
                  }}
                  style={{ opacity: g.playable ? 1 : 0.8 }}
                >
                  <div className="tile-illustration-container">
                    {renderGameIllustration(g.id)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="tile-top-row">
                      <span className="tile-category">{g.category}</span>
                      {!g.playable && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--magenta-deep)', background: '#FFF0F5', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                          Coming soon my love
                        </span>
                      )}
                    </div>
                    <h3 className="tile-title">{g.name}</h3>
                    <p className="tile-desc">{g.playable ? g.tagline : 'Coming soon my love'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: SHARED TABLETOP GAME ROOM */}
        {activeTab === 'room' && (
          <section className="us-gameroom-container animate-fade-in-up">
            <div className="us-gameroom-header">
              <button className="us-btn-secondary" onClick={() => setActiveTab('games')}>
                ← Back to Play
              </button>
              <div className="gameroom-title-block">
                <h2>{activeGameId.replace('_', ' ').toUpperCase()}</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--champagne-muted)', fontStyle: 'italic' }}>
                  a little game between us
                </span>
              </div>
            </div>

            {/* Tabletop Player Seats */}
            <div className="us-tabletop-stage">
              <div className="us-players-tabletop">
                <div className={`tabletop-player-seat ${turn === myRole ? 'tabletop-player-seat--active' : ''}`}>
                  <Avatar name={myName} size="md" haloColor="var(--rose-primary)" isOnline={true} />
                  <div>
                    <span className="tabletop-player-name">{myName}</span>
                    {isMyTurn && <span className="tabletop-turn-tag" style={{ display: 'block' }}>your turn</span>}
                  </div>
                </div>

                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--champagne-muted)', fontSize: '1.2rem' }}>
                  vs
                </span>

                <div className={`tabletop-player-seat ${turn === opponentRole ? 'tabletop-player-seat--active' : ''}`}>
                  <Avatar name={otherName} size="md" haloColor={partnerOnline ? "var(--rose-primary)" : "rgba(246,239,228,0.15)"} isOnline={partnerOnline} />
                  <div>
                    <span className="tabletop-player-name">{otherName}</span>
                    {turn === opponentRole && !isSoloDevMode && <span className="tabletop-turn-tag" style={{ display: 'block' }}>{otherName} is choosing...</span>}
                  </div>
                </div>
              </div>

              {/* Game Over Banner */}
              {status === 'finished' && (
                <div className="game-over-panel">
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--champagne-primary)', marginBottom: '0.5rem' }}>
                    {winner === 'Draw' || winner === 'draw' ? "It's a Draw!" : winner ? `${winner} Won!` : 'Game Over!'}
                  </h3>
                  <p style={{ color: 'var(--champagne-muted)', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    Nice game.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="us-btn-primary" onClick={handleResetGame}>
                      Play Again
                    </button>
                    <button className="us-btn-secondary" onClick={() => setActiveTab('games')}>
                      Back to Play
                    </button>
                  </div>
                </div>
              )}

              {/* Game Stage Engine Component */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  {floatingReactions.map((r) => (
                    <div key={r.id} style={{ position: 'absolute', bottom: '20px', left: `${r.left}%`, animation: 'fadeSlideUp 2.5s ease-out forwards' }}>
                      <HeartIcon size={24} color="var(--rose-primary)" fill="var(--rose-primary)" />
                    </div>
                  ))}
                </div>

                {activeGameId === 'uno' && (
                  <UnoBoard state={gameState} myRole={myRole} isMyTurn={isMyTurn && status !== 'finished'} onMove={handleMakeMove} />
                )}
                {activeGameId === 'ludo' && (
                  <LudoBoard state={gameState} myRole={myRole} isMyTurn={isMyTurn && status !== 'finished'} onMove={handleMakeMove} />
                )}
                {(activeGameId === 'obus' || activeGameId === 'obus_3d') && (
                  <OBUS3DUI gameState={gameState} myRole={myRole} isMyTurn={isMyTurn && status !== 'finished'} onMakeMove={handleMakeMove} />
                )}
              </div>

              {/* Reaction Bar (Lucide Icons) */}
              <div className="reaction-bar">
                <button className="reaction-btn" onClick={() => handleSendReaction('heart')} title="Send Heart">
                  <HeartIcon size={18} color="var(--rose-primary)" fill="var(--rose-primary)" />
                </button>
                <button className="reaction-btn" onClick={() => handleSendReaction('flame')} title="Send Flame">
                  <FlameIcon size={18} color="var(--amber-accent)" />
                </button>
                <button className="reaction-btn" onClick={() => handleSendReaction('sparkles')} title="Send Sparkles">
                  <SparklesIcon size={18} color="var(--rose-light)" />
                </button>
                <button className="reaction-btn" onClick={() => handleSendReaction('candle')} title="Send Candle">
                  <CandleIcon size={18} color="var(--amber-accent)" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: LETTERS (Love Notes) */}
        {activeTab === 'notes' && (
          <section className="animate-fade-in-up">
            <div className="us-section-header">
              <div>
                <h2 className="us-section-title">Love Letters</h2>
              </div>
            </div>

            <form onSubmit={handleAddNote} className="us-chat-input-bar" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="us-chat-input-field"
                placeholder="Write a note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
              />
              <button type="submit" className="us-btn-primary">
                Leave note
              </button>
            </form>

            <div className="us-paper-grid">
              {notes.map((note) => (
                <div key={note.id} className="us-paper-card">
                  <span className="paper-author">{note.author}</span>
                  <p className="paper-body">"{note.text}"</p>
                  <span className="paper-time">{note.time} • Read</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: US (Whispers Chat) */}
        {activeTab === 'chat' && (
          <section className="animate-fade-in-up">
            <div className="us-section-header">
              <div>
                <h2 className="us-section-title">Whispers</h2>
              </div>
            </div>

            <div className="us-chat-room">
              <div className="us-chat-bubbles-container">
                {chatMessages.map((m) => (
                  <div key={m.id} className={`us-chat-bubble ${m.isMe ? 'us-chat-bubble--me' : 'us-chat-bubble--partner'}`}>
                    <span className="chat-sender">{m.sender}</span>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.94rem', lineHeight: '1.45' }}>{m.body}</p>
                    <span className="chat-time">{m.sent_at}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="us-chat-input-bar">
                <input
                  type="text"
                  className="us-chat-input-field"
                  placeholder="Send a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="us-chat-send-btn">
                  <SendIcon size={16} color="var(--bg-midnight)" />
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Minimal Footer */}
        {activeTab !== 'room' && (
          <footer className="us-footer-romantic">
            <HeartIcon size={16} color="var(--rose-primary)" className="footer-top-heart" />
            <div className="footer-main-quote">
              {myName} & {otherName}
            </div>
            <div className="footer-nav-links">
              <span className="footer-nav-link" onClick={() => setActiveTab('table')}>Home</span>
              <span className="footer-nav-link" onClick={() => setActiveTab('games')}>Play</span>
              <span className="footer-nav-link" onClick={() => navigate('/movie-night')}>Movie Night</span>
              <span className="footer-nav-link" onClick={() => setActiveTab('chat')}>Us</span>
            </div>
          </footer>
        )}
      </main>

      {/* Floating Navigation Dock */}
      {activeTab !== 'room' && (
        <nav className="us-nav-dock">
          <button className={`us-nav-item ${activeTab === 'table' ? 'us-nav-item--active' : ''}`} onClick={() => setActiveTab('table')}>
            <SanctuaryHeartIcon className="dock-icon" />
            <span>Home</span>
            {activeTab === 'table' && <div className="us-nav-dot" />}
          </button>

          <button className={`us-nav-item ${activeTab === 'games' ? 'us-nav-item--active' : ''}`} onClick={() => setActiveTab('games')}>
            <SanctuaryPlayIcon className="dock-icon" />
            <span>Play</span>
            {activeTab === 'games' && <div className="us-nav-dot" />}
          </button>

          <button className="us-nav-item" onClick={() => navigate('/movie-night')}>
            <SanctuaryLetterIcon className="dock-icon" />
            <span>Movie Night</span>
          </button>

          <button className={`us-nav-item ${activeTab === 'chat' ? 'us-nav-item--active' : ''}`} onClick={() => setActiveTab('chat')}>
            <SanctuaryChatIcon className="dock-icon" />
            <span>Us</span>
            {activeTab === 'chat' && <div className="us-nav-dot" />}
          </button>
        </nav>
      )}

      {/* INTERACTIVE "SEND A LITTLE MOMENT" MODAL */}
      {showMomentModal && (
        <div className="moment-modal-overlay" onClick={() => setShowMomentModal(false)}>
          <div className="moment-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="moment-modal-header">
              <div className="moment-title-group">
                <HeartIcon size={20} color="var(--rose-primary)" fill="var(--rose-primary)" />
                <h3>Send a little moment</h3>
              </div>
              <button className="moment-close-btn" onClick={() => setShowMomentModal(false)}>
                <X size={18} color="var(--champagne-muted)" />
              </button>
            </div>
            <p className="moment-modal-subtitle">Pick a quick moment to send to {otherPartner?.name || 'Seema'}:</p>

            <div className="moment-options-grid">
              {MOMENT_OPTIONS.map((opt) => (
                <button key={opt.label} className="moment-option-btn" onClick={() => handleSendMoment(opt)}>
                  <span className="moment-opt-emoji">{opt.emoji}</span>
                  <span className="moment-opt-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
