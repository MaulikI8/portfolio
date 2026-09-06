import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { MOCK_CATALOG } from '../mocks/fixtures';
import {
  Gamepad2,
  Grid,
  Layers,
  HelpCircle,
  Palette,
  Activity,
  ShieldCheck,
  Image as ImageIcon,
  Circle,
  TrendingUp,
  Scissors,
  MessageSquare,
  Split,
  Sparkles,
  Zap,
  Type,
  RotateCw,
  Anchor,
  Heart,
  Play,
  Dices,
  Swords,
  CircleDot,
  Grid3x3,
  Ship,
  Fish,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Grid,
  Anchor,
  Square: Grid,
  Layers,
  Dices,
  Swords,
  CircleDot,
  Grid3x3,
  Ship,
  Fish,
  HelpCircle,
  Palette,
  Activity,
  ShieldCheck,
  Image: ImageIcon,
  Circle,
  TrendingUp,
  Scissors,
  MessageSquare,
  Split,
  Sparkles,
  Zap,
  Type,
  RotateCw,
};

export function GamesIndexPage() {
  const navigate = useNavigate();
  const { data: catalog, loading, error, refetch } = useFetch<any>('/api/games/catalog');
  const [toast, setToast] = useState<string | null>(null);

  if (loading) {
    return (
      <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton" style={{ height: '140px' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--strawberry-500)', marginBottom: '1rem', fontWeight: 600 }}>Couldn’t load game catalog.</p>
        <button className="btn-primary" onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  // Normalize catalog payload (whether backend returns array of categories or flat array)
  let rawGames: any[] = [];
  if (Array.isArray(catalog)) {
    catalog.forEach((item: any) => {
      if (item && item.games && Array.isArray(item.games)) {
        rawGames.push(...item.games);
      } else if (item && (item.slug || item.code)) {
        rawGames.push(item);
      }
    });
  }

  if (rawGames.length === 0) {
    rawGames = MOCK_CATALOG;
  }

  // Playable Games (UNO & LUDO)
  const playableGames = [
    { slug: 'uno', name: 'UNO Classic', hook: 'Draw cards, wild colors and call UNO!', icon_name: 'Layers' },
    { slug: 'ludo', name: 'Ludo Classic', hook: '4-token race to home base!', icon_name: 'Dices' },
  ];

  // Popular curated upcoming games
  const upcomingGames = [
    { slug: 'tictactoe', name: 'Tic-Tac-Toe', hook: 'Classic 3x3 alignment duel', icon_name: 'Grid' },
    { slug: 'chess', name: 'Chess', hook: 'Strategic royal showdown', icon_name: 'Swords' },
    { slug: 'checkers', name: 'Checkers', hook: 'Diagonal jump & king strategy', icon_name: 'CircleDot' },
    { slug: 'connect-4', name: 'Connect 4', hook: 'Drop discs four in a row', icon_name: 'Grid3x3' },
    { slug: 'battleship', name: 'Battleship', hook: 'Sink your partner grid fleet', icon_name: 'Ship' },
    { slug: 'go-fish', name: 'Go Fish', hook: 'Catch sets and pairs', icon_name: 'Fish' },
  ];

  return (
    <div style={{ padding: '0.5rem 0 2.5rem 0', position: 'relative' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)',
            color: '#FFFFFF',
            padding: '0.75rem 1.5rem',
            borderRadius: '99px',
            fontWeight: 700,
            fontSize: '0.92rem',
            boxShadow: 'var(--shadow-glow)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <Heart size={18} fill="#FFFFFF" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--coral-soft)', color: 'var(--coral-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gamepad2 size={26} />
        </div>
        <div>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--ink-deep)', fontWeight: 700 }}>
            Couple Games
          </h1>
        </div>
      </div>

      {/* SECTION 1: FEATURED PLAYABLE GAMES (UNO & LUDO) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Play size={18} color="var(--coral-primary)" fill="var(--coral-primary)" />
          <h2 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--ink-deep)', fontWeight: 700 }}>
            Ready to Play
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {playableGames.map((game) => {
            const IconComp = ICON_MAP[game.icon_name] || Gamepad2;
            const isUno = game.slug === 'uno';

            return (
              <div
                key={game.slug}
                onClick={() => navigate(`/games/${game.slug}`)}
                className="card-surface card-interactive"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderRadius: '24px',
                  border: '2px solid var(--border-strong)',
                  background: isUno
                    ? 'linear-gradient(135deg, rgba(255, 94, 142, 0.12) 0%, var(--surface-card) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--surface-card) 100%)',
                  boxShadow: 'var(--shadow-soft)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: isUno ? 'var(--coral-soft)' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={26} color={isUno ? 'var(--coral-primary)' : '#10B981'} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5', padding: '0.3rem 0.85rem', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Play size={12} fill="#10B981" /> PLAY NOW
                  </span>
                </div>

                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--ink-deep)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {game.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                    {game.hook}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: COMING SOON MY LOVE (HORIZONTAL GRID OF REMAINING GAMES) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Heart size={18} color="var(--magenta-deep)" fill="var(--magenta-deep)" />
          <h2 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--ink-deep)', fontWeight: 700 }}>
            Coming Soon My Love
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          {upcomingGames.map((game: any, idx: number) => {
            const IconComp = ICON_MAP[game.icon_name || game.icon] || Gamepad2;
            const gameName = game.name || game.title || 'Game';

            return (
              <div
                key={game.slug || game.code || idx}
                onClick={() => {
                  setToast('Coming soon my love! 💖');
                  setTimeout(() => setToast(null), 3000);
                }}
                className="card-surface card-interactive"
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderRadius: '20px',
                  opacity: 0.88,
                  border: '1px dashed var(--border-subtle)',
                  background: 'var(--surface-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--coral-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={18} color="var(--coral-primary)" />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--magenta-deep)', background: 'rgba(255, 94, 142, 0.12)', padding: '0.2rem 0.55rem', borderRadius: '99px', border: '1px solid rgba(255, 94, 142, 0.25)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Heart size={10} fill="var(--magenta-deep)" /> Coming soon
                  </span>
                </div>

                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.05rem', color: 'var(--ink-deep)', fontWeight: 700, marginBottom: '0.15rem' }}>
                    {gameName}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--magenta-deep)', fontWeight: 600, lineHeight: 1.3 }}>
                    Coming soon my love
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
