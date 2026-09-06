import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Swords, Dices, Layers, Crosshair } from 'lucide-react';
import { Dice3D } from './Dice3D';
import '../SinglePageApp.css';

interface GameItem {
  id: string;
  name: string;
  category: string;
  record: string;
  tagline: string;
  description: string;
  icon: any;
}

const FEATURED_GAMES: GameItem[] = [
  {
    id: 'chess',
    name: 'Chess',
    category: 'Deep Strategy',
    record: 'Tied 4–4',
    tagline: 'The board is waiting.',
    description: 'A classic 8x8 battle of foresight and quiet tactical decisions under warm candlelight.',
    icon: Swords,
  },
  {
    id: 'ludo',
    name: 'Ludo',
    category: 'Roll & Race',
    record: 'Seema leads 5–3',
    tagline: 'Roll the 3D die.',
    description: 'Race your tokens home in an interactive 3D WebGL tumbling stage.',
    icon: Dices,
  },
  {
    id: 'uno',
    name: 'Uno',
    category: 'Quick Cards',
    record: 'Maulik leads 8–6',
    tagline: 'Match colors & numbers.',
    description: 'Fast-paced card matching where late-night turns flip the leaderboard.',
    icon: Layers,
  },
  {
    id: 'battleship',
    name: 'Battleship',
    category: 'Naval Warfare',
    record: 'Seema leads 3–2',
    tagline: 'Target missile grid.',
    description: 'Deploy radar coordinates and sink ships across encrypted WebSocket turns.',
    icon: Crosshair,
  },
];

interface Props {
  partnerName?: string;
  isPartnerOnline?: boolean;
}

export function GameCarousel(_props: Props) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);

  // 3D Die Modal State
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | undefined>(undefined);
  const [settledValue, setSettledValue] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  const triggerNavigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return;

      setIsAnimating(true);
      if (direction === 'next') {
        setActiveIndex((prev) => (prev + 1) % FEATURED_GAMES.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + FEATURED_GAMES.length) % FEATURED_GAMES.length);
      }

      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    },
    [isAnimating]
  );

  const currentGame = FEATURED_GAMES[activeIndex];

  const handleRollDie = () => {
    setShowDiceModal(true);
    setIsRolling(true);
    setDiceResult(undefined);
    setSettledValue(null);

    setTimeout(() => {
      const serverRoll = Math.floor(Math.random() * 6) + 1;
      setDiceResult(serverRoll);
      setIsRolling(false);
    }, 850);
  };

  return (
    <div className="hero-sanctuary-stage">
      {/* Background Living Ambient Lighting Glow */}
      <div className="hero-ambient-light" />

      {/* Cinematic Hero Split Grid */}
      <div className="hero-split-container">
        {/* Left Column: Editorial Copy & CTAs */}
        <div className="hero-editorial-col animate-fade-in-up">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            <span className="eyebrow-text">YOUR TABLE • {currentGame.category}</span>
          </div>

          <h1 className="hero-title">{currentGame.name}</h1>

          <div className="hero-record-row">
            <span className="record-badge">{currentGame.record}</span>
            <span className="tagline-text">{currentGame.tagline}</span>
          </div>

          <p className="hero-description">{currentGame.description}</p>

          <div className="hero-cta-group">
            <button
              className="hero-primary-cta"
              onClick={() => navigate('/games')}
            >
              <span>PLAY {currentGame.name.toUpperCase()} →</span>
            </button>

            {currentGame.id === 'ludo' && (
              <button className="hero-secondary-cta" onClick={handleRollDie}>
                <Sparkles size={15} color="#D6A85A" />
                <span>ROLL 3D DIE</span>
              </button>
            )}

            <button
              className="hero-ghost-cta"
              onClick={() => navigate('/games')}
            >
              <span>VIEW MATCH</span>
            </button>
          </div>

          {/* Nav Arrow Controls & Dots */}
          <div className="hero-controls-row">
            <button
              className="hero-arrow-btn"
              onClick={() => triggerNavigate('prev')}
              disabled={isAnimating}
              aria-label="Previous Game"
            >
              <ArrowLeft size={16} color="#F3E9DC" />
            </button>
            <button
              className="hero-arrow-btn"
              onClick={() => triggerNavigate('next')}
              disabled={isAnimating}
              aria-label="Next Game"
            >
              <ArrowRight size={16} color="#F3E9DC" />
            </button>

            <div className="hero-indicator-dots">
              {FEATURED_GAMES.map((g, idx) => (
                <span
                  key={g.id}
                  className={`dot-indicator ${idx === activeIndex ? 'dot-indicator--active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Flat Single-Tone Panel with Centered Icon & Ambient Pure CSS Glow */}
        <div className="hero-3d-col">
          <div className="hero-flat-game-panel">
            <div className="panel-ambient-glow" />
            {(() => {
              const IconComp = currentGame.icon;
              return <IconComp size={108} color="#F6EFE4" strokeWidth={1.6} className="hero-panel-icon" />;
            })()}
          </div>
        </div>
      </div>

      {/* 3D Dice Roll Modal */}
      {showDiceModal && (
        <div className="dice-modal-overlay" onClick={() => setShowDiceModal(false)}>
          <div className="dice-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="dice-modal-close" onClick={() => setShowDiceModal(false)}>
              &times;
            </button>

            <h3 className="dice-modal-title">Ludo — 3D Die Tumbler</h3>
            <p className="dice-modal-subtitle">
              {isRolling
                ? 'Tumbling across the sanctuary table...'
                : settledValue
                ? `You rolled a ${settledValue}!`
                : 'Click roll to make your turn move'}
            </p>

            <div className="dice-modal-stage">
              <Dice3D
                rolling={isRolling}
                result={diceResult}
                onSettled={(r) => setSettledValue(r)}
                size={180}
              />
            </div>

            <div className="dice-modal-actions">
              <button
                className="modal-btn-gold"
                onClick={handleRollDie}
                disabled={isRolling}
              >
                {isRolling ? 'Rolling...' : 'Roll Again'}
              </button>
              <button
                className="modal-btn-ghost"
                onClick={() => setShowDiceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
